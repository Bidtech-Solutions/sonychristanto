// Package slug builds URL slugs.
package slug

import (
	"regexp"
	"strings"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

var nonAlnum = regexp.MustCompile(`[^a-z0-9]+`)
var Valid = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

const MaxLen = 120

func Make(s string) string {
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	s, _, _ = transform.String(t, strings.ToLower(s))
	s = strings.Trim(nonAlnum.ReplaceAllString(s, "-"), "-")
	if len(s) > MaxLen {
		s = strings.Trim(s[:MaxLen], "-")
		if i := strings.LastIndex(s, "-"); i > MaxLen/2 {
			s = s[:i]
		}
	}
	return s
}
