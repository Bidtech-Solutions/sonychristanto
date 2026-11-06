package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/auth"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/middleware"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/models"
)

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) setSession(c *gin.Context, admin *models.Admin) (time.Time, error) {
	token, exp, err := auth.IssueToken(h.Cfg.JWTSecret, h.Cfg.JWTTTL, admin.ID, admin.TokenVersion)
	if err != nil {
		return exp, err
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(h.Cfg.CookieName, token, int(h.Cfg.JWTTTL.Seconds()), "/", h.Cfg.CookieDomain, h.Cfg.CookieSecure, true)
	return exp, nil
}

func (h *Handler) clearSession(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(h.Cfg.CookieName, "", -1, "/", h.Cfg.CookieDomain, h.Cfg.CookieSecure, true)
}

// POST /api/v1/auth/login
func (h *Handler) Login(c *gin.Context) {
	var req loginReq
	if !bind(c, &req) {
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))
	var admin models.Admin
	var hash *string
	if err := h.DB.First(&admin, "email = ?", email).Error; err == nil {
		hash = &admin.PasswordHash
	} else if !isNotFound(err) {
		internal(c, err)
		return
	}
	if !auth.CheckPasswordConstantTime(hash, req.Password) {
		fail(c, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Email atau password salah")
		return
	}
	if !admin.IsActive {
		fail(c, http.StatusForbidden, "ACCOUNT_INACTIVE", "Akun dinonaktifkan. Hubungi admin lain.")
		return
	}
	now := time.Now()
	h.DB.Model(&admin).Update("last_login_at", now)
	admin.LastLoginAt = &now
	exp, err := h.setSession(c, &admin)
	if err != nil {
		internal(c, err)
		return
	}
	ok(c, http.StatusOK, gin.H{"admin": admin, "expires_at": exp})
}

// POST /api/v1/auth/logout
func (h *Handler) Logout(c *gin.Context) {
	h.clearSession(c)
	c.Status(http.StatusNoContent)
}

// GET /api/v1/auth/me
func (h *Handler) Me(c *gin.Context) {
	ok(c, http.StatusOK, middleware.CurrentAdmin(c))
}
