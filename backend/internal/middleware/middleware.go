// Package middleware contains Gin middleware: auth, rate limiting, logging
// and security headers.
package middleware

import (
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/time/rate"
	"gorm.io/gorm"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/auth"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/config"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/models"
)

const CtxAdmin = "admin"

func CurrentAdmin(c *gin.Context) *models.Admin {
	v, _ := c.Get(CtxAdmin)
	a, _ := v.(*models.Admin)
	return a
}

func abort(c *gin.Context, status int, code, msg string) {
	c.AbortWithStatusJSON(status, gin.H{"error": gin.H{"code": code, "message": msg}})
}

// RequireAuth accepts the httpOnly session cookie (dashboard) or an
// "Authorization: Bearer" header (API testing). Every request re-checks the
// account so deactivation and password changes take effect immediately.
func RequireAuth(cfg *config.Config, db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, _ := c.Cookie(cfg.CookieName)
		if h := c.GetHeader("Authorization"); token == "" && strings.HasPrefix(h, "Bearer ") {
			token = strings.TrimPrefix(h, "Bearer ")
		}
		if token == "" {
			abort(c, http.StatusUnauthorized, "UNAUTHENTICATED", "Silakan login terlebih dahulu")
			return
		}
		claims, err := auth.ParseToken(cfg.JWTSecret, token)
		if err != nil {
			abort(c, http.StatusUnauthorized, "UNAUTHENTICATED", "Sesi tidak valid atau kedaluwarsa")
			return
		}
		id, err := uuid.Parse(claims.Subject)
		if err != nil {
			abort(c, http.StatusUnauthorized, "UNAUTHENTICATED", "Sesi tidak valid")
			return
		}
		var admin models.Admin
		if err := db.First(&admin, "id = ?", id).Error; err != nil {
			abort(c, http.StatusUnauthorized, "UNAUTHENTICATED", "Akun tidak ditemukan")
			return
		}
		if !admin.IsActive {
			abort(c, http.StatusForbidden, "ACCOUNT_INACTIVE", "Akun dinonaktifkan")
			return
		}
		if admin.TokenVersion != claims.Version {
			abort(c, http.StatusUnauthorized, "SESSION_REVOKED", "Sesi berakhir, silakan login ulang")
			return
		}
		c.Set(CtxAdmin, &admin)
		c.Next()
	}
}

// RateLimit is an in-memory per-IP token bucket. Fine for a single backend
// instance; move to Redis if the backend is ever scaled horizontally.
func RateLimit(every time.Duration, burst int) gin.HandlerFunc {
	type entry struct {
		lim  *rate.Limiter
		seen time.Time
	}
	var mu sync.Mutex
	clients := map[string]*entry{}
	go func() {
		for range time.Tick(10 * time.Minute) {
			mu.Lock()
			for ip, e := range clients {
				if time.Since(e.seen) > 30*time.Minute {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()
	return func(c *gin.Context) {
		ip := c.ClientIP()
		mu.Lock()
		e, ok := clients[ip]
		if !ok {
			e = &entry{lim: rate.NewLimiter(rate.Every(every), burst)}
			clients[ip] = e
		}
		e.seen = time.Now()
		allowed := e.lim.Allow()
		mu.Unlock()
		if !allowed {
			abort(c, http.StatusTooManyRequests, "RATE_LIMITED", "Terlalu banyak percobaan, coba lagi beberapa saat lagi")
			return
		}
		c.Next()
	}
}

func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		h := c.Writer.Header()
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		h.Set("X-Frame-Options", "DENY")
		if strings.HasPrefix(c.Request.URL.Path, "/api/v1/admin") || strings.HasPrefix(c.Request.URL.Path, "/api/v1/auth") {
			h.Set("Cache-Control", "no-store")
		}
		c.Next()
	}
}

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		if c.Request.URL.Path == "/api/v1/health" {
			return
		}
		slog.Info("http",
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"ms", time.Since(start).Milliseconds(),
			"ip", c.ClientIP(),
		)
	}
}
