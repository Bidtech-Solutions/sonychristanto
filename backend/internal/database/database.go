// Package database connects to PostgreSQL, migrates the schema and seeds the
// first (super) admin.
package database

import (
	"errors"
	"fmt"
	"log/slog"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/auth"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/config"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/models"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	level := logger.Warn
	if !cfg.IsProduction() {
		level = logger.Info
	}
	var db *gorm.DB
	var err error
	// The database container may still be starting: retry for ~30s.
	for i := 0; i < 15; i++ {
		db, err = gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
			Logger:         logger.Default.LogMode(level),
			TranslateError: true,
		})
		if err == nil {
			sqlDB, _ := db.DB()
			if err = sqlDB.Ping(); err == nil {
				sqlDB.SetMaxOpenConns(20)
				sqlDB.SetMaxIdleConns(5)
				sqlDB.SetConnMaxLifetime(30 * time.Minute)
				return db, nil
			}
		}
		slog.Warn("database not ready, retrying", "attempt", i+1, "err", err)
		time.Sleep(2 * time.Second)
	}
	return nil, fmt.Errorf("connect database: %w", err)
}

// Migrate uses GORM AutoMigrate. Good enough while the schema is small;
// switch to versioned migrations (e.g. goose) before the first breaking change.
func Migrate(db *gorm.DB) error {
	if err := db.AutoMigrate(&models.Admin{}, &models.Article{}, &models.ArticleDraft{}, &models.Media{}); err != nil {
		return err
	}
	// At most one superadmin can ever exist.
	return db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_single_superadmin ON admins (is_superadmin) WHERE is_superadmin`).Error
}

// SeedSuperadmin creates the first account when the admins table is empty.
// That first account is the superadmin.
func SeedSuperadmin(db *gorm.DB, cfg *config.Config) error {
	var count int64
	if err := db.Model(&models.Admin{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	if cfg.SeedAdminEmail == "" || cfg.SeedAdminPassword == "" {
		slog.Warn("no admin exists and SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD are empty: nobody can log in yet")
		return nil
	}
	if err := auth.ValidatePassword(cfg.SeedAdminPassword); err != nil {
		return errors.New("SEED_ADMIN_PASSWORD: " + err.Error())
	}
	hash, err := auth.HashPassword(cfg.SeedAdminPassword)
	if err != nil {
		return err
	}
	admin := models.Admin{
		Name:         cfg.SeedAdminName,
		Email:        cfg.SeedAdminEmail,
		PasswordHash: hash,
		IsSuperadmin: true,
		IsActive:     true,
	}
	if err := db.Create(&admin).Error; err != nil {
		return err
	}
	slog.Info("superadmin created", "email", admin.Email)
	return nil
}
