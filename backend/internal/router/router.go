// Package router wires routes to handlers.
package router

import (
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/config"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/handlers"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/middleware"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/revalidate"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/storage"
)

func New(cfg *config.Config, db *gorm.DB, store *storage.Store) *gin.Engine {
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	_ = r.SetTrustedProxies(cfg.TrustedProxies)
	// Behind Cloudflare -> nginx: nginx must forward the real visitor IP.
	r.RemoteIPHeaders = []string{"X-Real-IP", "X-Forwarded-For"}
	r.MaxMultipartMemory = 16 << 20
	r.Use(gin.Recovery(), middleware.Logger(), middleware.SecurityHeaders())

	h := &handlers.Handler{Cfg: cfg, DB: db, Store: store, Revalidate: revalidate.New(cfg)}
	authed := middleware.RequireAuth(cfg, db)

	r.GET("/media/*key", h.ServeMedia)
	r.HEAD("/media/*key", h.ServeMedia)

	v1 := r.Group("/api/v1")
	v1.GET("/health", handlers.Health)

	// Public (website)
	v1.GET("/categories", h.PublicCategories)
	v1.GET("/articles", h.PublicListArticles)
	v1.GET("/articles/:slug", h.PublicGetArticle)
	v1.GET("/feeds/articles", h.PublicArticleFeed)

	// Auth
	v1.POST("/auth/login", middleware.RateLimit(12*time.Second, 5), h.Login)
	v1.POST("/auth/logout", h.Logout)
	v1.GET("/auth/me", authed, h.Me)

	// Dashboard (every route requires a session)
	admin := v1.Group("/admin", authed)
	admin.PUT("/profile", h.UpdateProfile)
	admin.PUT("/profile/password", h.ChangeOwnPassword)

	admin.GET("/accounts", h.ListAccounts)
	admin.POST("/accounts", h.CreateAccount)
	admin.GET("/accounts/:id", h.GetAccount)
	admin.PUT("/accounts/:id", h.UpdateAccount)
	admin.PATCH("/accounts/:id/status", h.SetAccountStatus)
	admin.PUT("/accounts/:id/password", h.ResetAccountPassword)
	admin.DELETE("/accounts/:id", h.DeleteAccount)

	admin.GET("/articles", h.AdminListArticles)
	admin.POST("/articles", h.AdminCreateArticle)
	admin.GET("/articles/:id", h.AdminGetArticle)
	admin.PUT("/articles/:id/draft", h.AdminSaveDraft)
	admin.POST("/articles/:id/publish", h.AdminPublishArticle)
	admin.POST("/articles/:id/unpublish", h.AdminUnpublishArticle)
	admin.POST("/articles/:id/discard-draft", h.AdminDiscardDraft)
	admin.DELETE("/articles/:id", h.AdminDeleteArticle)

	admin.POST("/uploads", middleware.RateLimit(time.Second, 20), h.Upload)

	return r
}
