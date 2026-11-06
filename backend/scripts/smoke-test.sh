#!/usr/bin/env bash
# End-to-end API smoke test against a running dev stack (docker compose up -d).
#   ./backend/scripts/smoke-test.sh
# Needs: curl, jq, python3 + Pillow (for the test image), file.
# Login is rate-limited (5 attempts, then 1 per 12 s): wait ~1 minute between runs.
# It creates and deletes its own data, but leaves one uploaded test image.
set -u
B=${B:-http://localhost:8080/api/v1}
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@sonychristanto.local}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin12345}
T=$(mktemp -d); trap 'rm -rf $T' EXIT
J=$T/jar; J2=$T/jar2
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then echo "PASS $1"; pass=$((pass+1)); else echo "FAIL $1 (got $2, want $3)"; fail=$((fail+1)); fi; }
code() { curl -s -o $T/body -w "%{http_code}" "$@"; }

check "login wrong pw" $(code -X POST $B/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"wrong-password\"}") 401
check "login ok" $(code -c $J -X POST $B/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}") 200
grep -q 'HttpOnly' $J && check "cookie httpOnly" yes yes || check "cookie httpOnly" no yes
check "me" $(code -b $J $B/auth/me) 200
SUPER=$(jq -r .data.id $T/body); check "is superadmin" $(jq -r .data.is_superadmin $T/body) true
check "admin route w/o cookie" $(code $B/admin/articles) 401

# accounts
check "create admin weak pw" $(code -b $J -X POST $B/admin/accounts -H 'Content-Type: application/json' -d '{"name":"Nita","email":"nita@x.id","password":"123"}') 422
check "create admin" $(code -b $J -X POST $B/admin/accounts -H 'Content-Type: application/json' -d '{"name":"Nita","email":"nita@x.id","password":"rahasia123"}') 201
NITA=$(jq -r .data.id $T/body)
check "duplicate email" $(code -b $J -X POST $B/admin/accounts -H 'Content-Type: application/json' -d '{"name":"Nita2","email":"NITA@x.id","password":"rahasia123"}') 422
check "edit superadmin blocked" $(code -b $J -X PUT $B/admin/accounts/$SUPER -H 'Content-Type: application/json' -d '{"name":"X","email":"x@x.id"}') 403
check "self deactivate blocked" $(code -b $J -X PATCH $B/admin/accounts/$SUPER/status -H 'Content-Type: application/json' -d '{"is_active":false}') 403
check "nita login" $(code -c $J2 -X POST $B/auth/login -H 'Content-Type: application/json' -d '{"email":"nita@x.id","password":"rahasia123"}') 200
check "nita cannot delete superadmin" $(code -b $J2 -X DELETE $B/admin/accounts/$SUPER) 403
check "deactivate nita" $(code -b $J -X PATCH $B/admin/accounts/$NITA/status -H 'Content-Type: application/json' -d '{"is_active":false}') 200
check "nita session blocked" $(code -b $J2 $B/auth/me) 403
check "nita login while inactive" $(code -X POST $B/auth/login -H 'Content-Type: application/json' -d '{"email":"nita@x.id","password":"rahasia123"}') 403
check "reactivate nita" $(code -b $J -X PATCH $B/admin/accounts/$NITA/status -H 'Content-Type: application/json' -d '{"is_active":true}') 200
check "reset nita pw" $(code -b $J -X PUT $B/admin/accounts/$NITA/password -H 'Content-Type: application/json' -d '{"new_password":"baru12345"}') 204
check "nita login new pw" $(code -c $J2 -X POST $B/auth/login -H 'Content-Type: application/json' -d '{"email":"nita@x.id","password":"baru12345"}') 200

# upload: 4000x3000 JPEG -> webp <= 1920x1080
python3 -c "
from PIL import Image; im=Image.new('RGB',(4000,3000),(10,26,68))
for x in range(0,4000,40): im.putpixel((x,x%3000),(242,194,48))
im.save('$T/big.jpg',quality=95)"
check "upload pdf rejected" $(code -b $J -F purpose=article -F "file=@$(dirname "$0")/../go.mod;type=image/jpeg" $B/admin/uploads) 422
check "upload jpg" $(code -b $J -F purpose=banner -F file=@$T/big.jpg $B/admin/uploads) 201
URL=$(jq -r .data.url $T/body); W=$(jq -r .data.width $T/body); H=$(jq -r .data.height $T/body)
check "resized to 1440x1080" "${W}x${H}" "1440x1080"
check "media served" $(curl -s -o $T/img -w "%{http_code}" http://localhost:8080$URL) 200
check "media is webp" "$(file -b --mime-type $T/img)" "image/webp"
check "media immutable cache" "$(curl -sI http://localhost:8080$URL | grep -ci 'immutable')" 1

# articles
check "create article" $(code -b $J -X POST $B/admin/articles -H 'Content-Type: application/json' -d '{}') 201
ID=$(jq -r .data.id $T/body); V=$(jq -r .data.draft.version $T/body)
COLS3='[{"id":"a","type":"columnList","props":{},"content":[],"children":[{"id":"1","type":"column","props":{},"children":[]},{"id":"2","type":"column","props":{},"children":[]},{"id":"3","type":"column","props":{},"children":[]}]}]'
check "3 columns rejected" $(code -b $J -X PUT $B/admin/articles/$ID/draft -H 'Content-Type: application/json' -d "{\"title\":\"x\",\"content\":$COLS3,\"version\":$V}") 422
P='{"id":"p","type":"paragraph","props":{},"content":[{"type":"text","text":"Pendidikan di Batam membutuhkan perhatian bersama dari pemerintah, sekolah swasta, dan masyarakat.","styles":{}}],"children":[]}'
DOC="[$P,{\"id\":\"c\",\"type\":\"columnList\",\"props\":{},\"content\":[],\"children\":[{\"id\":\"c1\",\"type\":\"column\",\"props\":{},\"children\":[$P]},{\"id\":\"c2\",\"type\":\"column\",\"props\":{},\"children\":[{\"id\":\"im\",\"type\":\"image\",\"props\":{\"url\":\"$URL\",\"caption\":\"Rapat\"},\"children\":[]}]}]}]"
check "publish incomplete -> 422" $(code -b $J -X POST $B/admin/articles/$ID/publish) 422
check "autosave draft" $(code -b $J -X PUT $B/admin/articles/$ID/draft -H 'Content-Type: application/json' -d "{\"title\":\"Masa Depan Pendidikan Swasta di Kepri\",\"category\":\"perspektif-sony\",\"banner_url\":\"$URL\",\"banner_alt\":\"Rapat pendidikan\",\"content\":$DOC,\"version\":$V}") 200
V2=$(jq -r .data.version $T/body)
check "stale version -> 409" $(code -b $J -X PUT $B/admin/articles/$ID/draft -H 'Content-Type: application/json' -d "{\"title\":\"old tab\",\"content\":[],\"version\":$V}") 409
check "draft not public" $(code $B/articles/masa-depan-pendidikan-swasta-di-kepri) 404
BEFORE=$(curl -s "$B/articles?category=perspektif-sony" | jq -r .meta.total)
check "publish" $(code -b $J -X POST $B/admin/articles/$ID/publish) 200
check "slug generated" $(jq -r .data.slug $T/body) masa-depan-pendidikan-swasta-di-kepri
check "public article" $(code $B/articles/masa-depan-pendidikan-swasta-di-kepri) 200
check "excerpt auto" "$(jq -r '.data.excerpt|length>20' $T/body)" true
check "public list by category +1" "$(curl -s "$B/articles?category=perspektif-sony" | jq -r .meta.total)" $((BEFORE+1))
# edit after publish: public stays old until republish
check "edit published draft" $(code -b $J -X PUT $B/admin/articles/$ID/draft -H 'Content-Type: application/json' -d "{\"title\":\"Judul Baru Setelah Edit\",\"slug\":\"coba-ganti-slug\",\"category\":\"perspektif-sony\",\"banner_url\":\"$URL\",\"banner_alt\":\"Rapat\",\"content\":$DOC,\"version\":$V2}") 200
check "public still old title" "$(curl -s $B/articles/masa-depan-pendidikan-swasta-di-kepri | jq -r .data.title)" "Masa Depan Pendidikan Swasta di Kepri"
check "flag unpublished changes" "$(curl -s -b $J $B/admin/articles/$ID | jq -r .data.has_unpublished_changes)" true
check "republish" $(code -b $J -X POST $B/admin/articles/$ID/publish) 200
check "public new title, slug locked" "$(curl -s $B/articles/masa-depan-pendidikan-swasta-di-kepri | jq -r .data.title)" "Judul Baru Setelah Edit"
check "flag cleared" "$(curl -s -b $J $B/admin/articles/$ID | jq -r .data.has_unpublished_changes)" false
check "feed has article" "$(curl -s "$B/feeds/articles?include_text=1" | jq -r '.data[0].content_text|length>50')" true
check "unpublish" $(code -b $J -X POST $B/admin/articles/$ID/unpublish) 200
check "inactive hidden" $(code $B/articles/masa-depan-pendidikan-swasta-di-kepri) 404
check "republish inactive" $(code -b $J -X POST $B/admin/articles/$ID/publish) 200
check "nita deletes article" $(code -b $J2 -X DELETE $B/admin/articles/$ID) 204
check "deleted gone" $(code -b $J $B/admin/articles/$ID) 404

# profile & password
check "change own pw wrong current" $(code -b $J -X PUT $B/admin/profile/password -H 'Content-Type: application/json' -d '{"current_password":"x","new_password":"admin54321"}') 422
check "delete nita" $(code -b $J -X DELETE $B/admin/accounts/$NITA) 204
echo "== $pass passed, $fail failed"
[ "$fail" -eq 0 ]
