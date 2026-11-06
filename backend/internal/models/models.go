// Package models holds the GORM database models.
package models

import (
	"time"

	"github.com/google/uuid"
)

// Admin is a dashboard account. There is a single role (admin); the first
// account ever created is flagged IsSuperadmin and is protected from being
// edited, deactivated or deleted by other admins.
type Admin struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string     `gorm:"size:120;not null" json:"name"`
	Email        string     `gorm:"size:190;not null;uniqueIndex" json:"email"`
	PasswordHash string     `gorm:"not null" json:"-"`
	AvatarURL    *string    `gorm:"size:500" json:"avatar_url"`
	IsSuperadmin bool       `gorm:"not null;default:false" json:"is_superadmin"`
	IsActive     bool       `gorm:"not null" json:"is_active"`
	TokenVersion int        `gorm:"not null;default:0" json:"-"`
	LastLoginAt  *time.Time `json:"last_login_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

const (
	StatusDraft     = "draft"     // never published; invisible to the public
	StatusPublished = "published" // live
	StatusInactive  = "inactive"  // was published, hidden temporarily
)

// Article holds the PUBLISHED snapshot. The working copy that the editor
// autosaves to lives in ArticleDraft, so editing a live article never
// changes what the public sees until it is published again.
type Article struct {
	ID              uuid.UUID     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Slug            *string       `gorm:"size:200;uniqueIndex" json:"slug"`
	Status          string        `gorm:"size:20;not null;index" json:"status"`
	Category        *string       `gorm:"size:40;index" json:"category"`
	Title           string        `gorm:"size:200;not null;default:''" json:"title"`
	Excerpt         string        `gorm:"size:400;not null;default:''" json:"excerpt"`
	BannerURL       *string       `gorm:"size:500" json:"banner_url"`
	BannerAlt       string        `gorm:"size:200;not null;default:''" json:"banner_alt"`
	Content         string        `gorm:"type:jsonb;not null;default:'[]'" json:"-"`
	ContentText     string        `gorm:"type:text;not null;default:''" json:"-"`
	ReadingMinutes  int           `gorm:"not null;default:0" json:"reading_minutes"`
	PublishedAt     *time.Time    `gorm:"index" json:"published_at"`
	LastPublishedAt *time.Time    `json:"last_published_at"`
	AuthorID        *uuid.UUID    `gorm:"type:uuid;index" json:"-"`
	Author          *Admin        `gorm:"constraint:OnDelete:SET NULL" json:"-"`
	Draft           *ArticleDraft `gorm:"foreignKey:ArticleID;constraint:OnDelete:CASCADE" json:"-"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

// ArticleDraft is the editable working copy (one per article).
type ArticleDraft struct {
	ArticleID   uuid.UUID  `gorm:"type:uuid;primaryKey" json:"-"`
	Title       string     `gorm:"size:200;not null;default:''" json:"title"`
	Slug        string     `gorm:"size:200;not null;default:''" json:"slug"`
	Excerpt     string     `gorm:"size:400;not null;default:''" json:"excerpt"`
	Category    string     `gorm:"size:40;not null;default:''" json:"category"`
	BannerURL   *string    `gorm:"size:500" json:"banner_url"`
	BannerAlt   string     `gorm:"size:200;not null;default:''" json:"banner_alt"`
	Content     string     `gorm:"type:jsonb;not null;default:'[]'" json:"-"`
	Version     int        `gorm:"not null;default:1" json:"version"`
	UpdatedByID *uuid.UUID `gorm:"type:uuid" json:"-"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// Media records every uploaded object so orphans can be cleaned up later.
type Media struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Key          string     `gorm:"size:300;not null;uniqueIndex" json:"key"`
	URL          string     `gorm:"size:500;not null" json:"url"`
	Purpose      string     `gorm:"size:30;not null;index" json:"purpose"`
	Width        int        `json:"width"`
	Height       int        `json:"height"`
	SizeBytes    int64      `json:"size_bytes"`
	UploadedByID *uuid.UUID `gorm:"type:uuid" json:"-"`
	CreatedAt    time.Time  `json:"created_at"`
}

// Category is fixed in code for now (see docs/PRD.md, keputusan K-3).
type Category struct {
	Key   string `json:"key"`
	Label string `json:"label"`
}

var Categories = []Category{
	{Key: "perspektif-sony", Label: "Perspektif Sony"},
	{Key: "agenda-sony", Label: "Agenda Sony"},
}

func CategoryLabel(key string) (string, bool) {
	for _, c := range Categories {
		if c.Key == key {
			return c.Label, true
		}
	}
	return "", false
}
