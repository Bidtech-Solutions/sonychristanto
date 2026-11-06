package handlers

import (
	"net/http"
	"net/mail"
	"strings"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/auth"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/middleware"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/models"
)

// Account rules (docs/PRD.md, Modul Autentikasi):
//   - every active admin can manage other admins;
//   - nobody can edit, reset, deactivate or delete the SUPERADMIN through
//     these endpoints (the superadmin manages itself via /admin/profile);
//   - an admin cannot deactivate or delete their own account.

func validName(n string) bool {
	l := utf8.RuneCountInString(n)
	return l >= 2 && l <= 120
}

func normEmail(e string) (string, bool) {
	e = strings.ToLower(strings.TrimSpace(e))
	addr, err := mail.ParseAddress(e)
	if err != nil || addr.Address != e || len(e) > 190 {
		return e, false
	}
	return e, true
}

func (h *Handler) loadTarget(c *gin.Context) (*models.Admin, bool) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		notFound(c, "Akun")
		return nil, false
	}
	var a models.Admin
	if err := h.DB.First(&a, "id = ?", id).Error; err != nil {
		if isNotFound(err) {
			notFound(c, "Akun")
		} else {
			internal(c, err)
		}
		return nil, false
	}
	return &a, true
}

func guardSuperadmin(c *gin.Context, target *models.Admin) bool {
	if target.IsSuperadmin {
		fail(c, http.StatusForbidden, "SUPERADMIN_PROTECTED", "Akun superadmin tidak dapat diubah dari halaman kelola akun")
		return false
	}
	return true
}

func guardSelf(c *gin.Context, target *models.Admin) bool {
	if target.ID == middleware.CurrentAdmin(c).ID {
		fail(c, http.StatusForbidden, "SELF_ACTION_FORBIDDEN", "Anda tidak dapat melakukan aksi ini pada akun sendiri")
		return false
	}
	return true
}

// GET /api/v1/admin/accounts
func (h *Handler) ListAccounts(c *gin.Context) {
	var list []models.Admin
	if err := h.DB.Order("is_superadmin DESC, created_at ASC").Find(&list).Error; err != nil {
		internal(c, err)
		return
	}
	ok(c, http.StatusOK, list)
}

// GET /api/v1/admin/accounts/:id
func (h *Handler) GetAccount(c *gin.Context) {
	if a, okk := h.loadTarget(c); okk {
		ok(c, http.StatusOK, a)
	}
}

type createAccountReq struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// POST /api/v1/admin/accounts
func (h *Handler) CreateAccount(c *gin.Context) {
	var req createAccountReq
	if !bind(c, &req) {
		return
	}
	fields := map[string]string{}
	req.Name = strings.TrimSpace(req.Name)
	if !validName(req.Name) {
		fields["name"] = "Nama 2–120 karakter"
	}
	email, valid := normEmail(req.Email)
	if !valid {
		fields["email"] = "Format email tidak valid"
	}
	if err := auth.ValidatePassword(req.Password); err != nil {
		fields["password"] = err.Error()
	}
	if len(fields) > 0 {
		failFields(c, fields)
		return
	}
	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		internal(c, err)
		return
	}
	a := models.Admin{Name: req.Name, Email: email, PasswordHash: hash, IsActive: true}
	if err := h.DB.Create(&a).Error; err != nil {
		if isDuplicate(err) {
			failFields(c, map[string]string{"email": "Email sudah dipakai"})
			return
		}
		internal(c, err)
		return
	}
	ok(c, http.StatusCreated, a)
}

type updateAccountReq struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

// PUT /api/v1/admin/accounts/:id
func (h *Handler) UpdateAccount(c *gin.Context) {
	target, okk := h.loadTarget(c)
	if !okk || !guardSuperadmin(c, target) {
		return
	}
	var req updateAccountReq
	if !bind(c, &req) {
		return
	}
	h.applyProfile(c, target, req.Name, req.Email, nil)
}

// applyProfile is shared by account edit and self profile edit.
func (h *Handler) applyProfile(c *gin.Context, target *models.Admin, name, emailRaw string, avatar *string) {
	fields := map[string]string{}
	name = strings.TrimSpace(name)
	if !validName(name) {
		fields["name"] = "Nama 2–120 karakter"
	}
	email, valid := normEmail(emailRaw)
	if !valid {
		fields["email"] = "Format email tidak valid"
	}
	if avatar != nil && *avatar != "" && !strings.HasPrefix(*avatar, "/media/") {
		fields["avatar_url"] = "Avatar harus diunggah melalui dashboard"
	}
	if len(fields) > 0 {
		failFields(c, fields)
		return
	}
	updates := map[string]any{"name": name, "email": email}
	if avatar != nil {
		if *avatar == "" {
			updates["avatar_url"] = nil
		} else {
			updates["avatar_url"] = *avatar
		}
	}
	if err := h.DB.Model(target).Updates(updates).Error; err != nil {
		if isDuplicate(err) {
			failFields(c, map[string]string{"email": "Email sudah dipakai"})
			return
		}
		internal(c, err)
		return
	}
	h.DB.First(target, "id = ?", target.ID)
	ok(c, http.StatusOK, target)
}

type statusReq struct {
	IsActive *bool `json:"is_active"`
}

// PATCH /api/v1/admin/accounts/:id/status
func (h *Handler) SetAccountStatus(c *gin.Context) {
	target, okk := h.loadTarget(c)
	if !okk || !guardSuperadmin(c, target) || !guardSelf(c, target) {
		return
	}
	var req statusReq
	if !bind(c, &req) {
		return
	}
	if req.IsActive == nil {
		failFields(c, map[string]string{"is_active": "Wajib diisi"})
		return
	}
	updates := map[string]any{"is_active": *req.IsActive}
	if !*req.IsActive {
		updates["token_version"] = gorm.Expr("token_version + 1") // kick out active sessions
	}
	if err := h.DB.Model(target).Updates(updates).Error; err != nil {
		internal(c, err)
		return
	}
	h.DB.First(target, "id = ?", target.ID)
	ok(c, http.StatusOK, target)
}

type passwordResetReq struct {
	NewPassword string `json:"new_password"`
}

// PUT /api/v1/admin/accounts/:id/password
func (h *Handler) ResetAccountPassword(c *gin.Context) {
	target, okk := h.loadTarget(c)
	if !okk || !guardSuperadmin(c, target) {
		return
	}
	if target.ID == middleware.CurrentAdmin(c).ID {
		fail(c, http.StatusForbidden, "SELF_ACTION_FORBIDDEN", "Ganti password sendiri melalui halaman Pengaturan")
		return
	}
	var req passwordResetReq
	if !bind(c, &req) {
		return
	}
	if err := auth.ValidatePassword(req.NewPassword); err != nil {
		failFields(c, map[string]string{"new_password": err.Error()})
		return
	}
	hash, err := auth.HashPassword(req.NewPassword)
	if err != nil {
		internal(c, err)
		return
	}
	if err := h.DB.Model(target).Updates(map[string]any{
		"password_hash": hash, "token_version": gorm.Expr("token_version + 1"),
	}).Error; err != nil {
		internal(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// DELETE /api/v1/admin/accounts/:id
func (h *Handler) DeleteAccount(c *gin.Context) {
	target, okk := h.loadTarget(c)
	if !okk || !guardSuperadmin(c, target) || !guardSelf(c, target) {
		return
	}
	// Articles keep existing; their author becomes NULL (FK ON DELETE SET NULL).
	if err := h.DB.Delete(target).Error; err != nil {
		internal(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

type profileReq struct {
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	AvatarURL *string `json:"avatar_url"`
}

// PUT /api/v1/admin/profile — the logged-in admin edits their own data.
func (h *Handler) UpdateProfile(c *gin.Context) {
	var req profileReq
	if !bind(c, &req) {
		return
	}
	h.applyProfile(c, middleware.CurrentAdmin(c), req.Name, req.Email, req.AvatarURL)
}

type changePasswordReq struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

// PUT /api/v1/admin/profile/password — rotates the session too.
func (h *Handler) ChangeOwnPassword(c *gin.Context) {
	me := middleware.CurrentAdmin(c)
	var req changePasswordReq
	if !bind(c, &req) {
		return
	}
	if !auth.CheckPassword(me.PasswordHash, req.CurrentPassword) {
		failFields(c, map[string]string{"current_password": "Password saat ini salah"})
		return
	}
	if err := auth.ValidatePassword(req.NewPassword); err != nil {
		failFields(c, map[string]string{"new_password": err.Error()})
		return
	}
	hash, err := auth.HashPassword(req.NewPassword)
	if err != nil {
		internal(c, err)
		return
	}
	me.PasswordHash = hash
	me.TokenVersion++ // signs out every other device
	if err := h.DB.Model(me).Updates(map[string]any{"password_hash": hash, "token_version": me.TokenVersion}).Error; err != nil {
		internal(c, err)
		return
	}
	if _, err := h.setSession(c, me); err != nil { // keep this device signed in
		internal(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
