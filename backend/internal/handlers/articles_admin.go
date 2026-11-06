package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/content"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/middleware"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/models"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/revalidate"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/slug"
)

// Lifecycle (docs/PRD.md, Modul Artikel):
//
//	create ─► draft ──publish──► published ──unpublish──► inactive
//	                     ▲            │                      │
//	                     └─ publish ◄─┴──── (edit draft) ◄───┘
//
// The editor always writes to article_drafts (autosave). Publishing copies
// the draft onto the article row. The slug is locked after first publish.

type articleAdminDTO struct {
	ID                    uuid.UUID     `json:"id"`
	Status                string        `json:"status"`
	Slug                  *string       `json:"slug"`
	HasUnpublishedChanges bool          `json:"has_unpublished_changes"`
	Published             *publishedDTO `json:"published"`
	Draft                 draftDTO      `json:"draft"`
	Author                *authorDTO    `json:"author"`
	PublishedAt           *time.Time    `json:"published_at"`
	LastPublishedAt       *time.Time    `json:"last_published_at"`
	CreatedAt             time.Time     `json:"created_at"`
	UpdatedAt             time.Time     `json:"updated_at"`
}

type publishedDTO struct {
	Title     string  `json:"title"`
	Excerpt   string  `json:"excerpt"`
	Category  *string `json:"category"`
	BannerURL *string `json:"banner_url"`
}

type draftDTO struct {
	Title     string          `json:"title"`
	Slug      string          `json:"slug"`
	Excerpt   string          `json:"excerpt"`
	Category  string          `json:"category"`
	BannerURL *string         `json:"banner_url"`
	BannerAlt string          `json:"banner_alt"`
	Content   json.RawMessage `json:"content,omitempty"`
	Version   int             `json:"version"`
	UpdatedAt time.Time       `json:"updated_at"`
}

type authorDTO struct {
	Name      string  `json:"name"`
	AvatarURL *string `json:"avatar_url"`
}

func toAdminDTO(a *models.Article, withContent bool) articleAdminDTO {
	d := articleAdminDTO{
		ID: a.ID, Status: a.Status, Slug: a.Slug,
		PublishedAt: a.PublishedAt, LastPublishedAt: a.LastPublishedAt,
		CreatedAt: a.CreatedAt, UpdatedAt: a.UpdatedAt,
	}
	if a.Draft != nil {
		d.Draft = draftDTO{
			Title: a.Draft.Title, Slug: a.Draft.Slug, Excerpt: a.Draft.Excerpt, Category: a.Draft.Category,
			BannerURL: a.Draft.BannerURL, BannerAlt: a.Draft.BannerAlt, Version: a.Draft.Version, UpdatedAt: a.Draft.UpdatedAt,
		}
		if withContent {
			d.Draft.Content = json.RawMessage(a.Draft.Content)
		}
		d.HasUnpublishedChanges = a.LastPublishedAt != nil && a.Draft.UpdatedAt.After(*a.LastPublishedAt)
	}
	if a.LastPublishedAt != nil {
		d.Published = &publishedDTO{Title: a.Title, Excerpt: a.Excerpt, Category: a.Category, BannerURL: a.BannerURL}
	}
	if a.Author != nil {
		d.Author = &authorDTO{Name: a.Author.Name, AvatarURL: a.Author.AvatarURL}
	}
	return d
}

func (h *Handler) loadArticle(c *gin.Context, db *gorm.DB) (*models.Article, bool) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		notFound(c, "Artikel")
		return nil, false
	}
	var a models.Article
	if err := db.Preload("Draft").Preload("Author").First(&a, "id = ?", id).Error; err != nil {
		if isNotFound(err) {
			notFound(c, "Artikel")
		} else {
			internal(c, err)
		}
		return nil, false
	}
	if a.Draft == nil { // should never happen; self-heal
		a.Draft = &models.ArticleDraft{ArticleID: a.ID, Content: "[]", Version: 1}
		db.Create(a.Draft)
	}
	return &a, true
}

// GET /api/v1/admin/articles?status=&category=&q=&page=&per_page=
func (h *Handler) AdminListArticles(c *gin.Context) {
	page, per := pagination(c, 20, 50)
	q := h.DB.Model(&models.Article{}).Joins("JOIN article_drafts d ON d.article_id = articles.id")
	if s := c.Query("status"); s != "" {
		q = q.Where("articles.status = ?", s)
	}
	if cat := c.Query("category"); cat != "" {
		q = q.Where("COALESCE(articles.category, d.category) = ?", cat)
	}
	if term := strings.TrimSpace(c.Query("q")); term != "" {
		like := "%" + strings.ReplaceAll(strings.ReplaceAll(term, "%", `\%`), "_", `\_`) + "%"
		q = q.Where("(d.title ILIKE ? OR articles.title ILIKE ?)", like, like)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		internal(c, err)
		return
	}
	var list []models.Article
	if err := q.Preload("Draft").Preload("Author").Order("d.updated_at DESC").
		Offset((page - 1) * per).Limit(per).Find(&list).Error; err != nil {
		internal(c, err)
		return
	}
	out := make([]articleAdminDTO, len(list))
	for i := range list {
		out[i] = toAdminDTO(&list[i], false)
	}
	okMeta(c, out, newPageMeta(page, per, total))
}

type createArticleReq struct {
	Category string `json:"category"`
	Title    string `json:"title"`
}

// POST /api/v1/admin/articles — creates an empty draft for the editor.
func (h *Handler) AdminCreateArticle(c *gin.Context) {
	var req createArticleReq
	_ = c.ShouldBindJSON(&req) // body is optional
	if req.Category != "" {
		if _, valid := models.CategoryLabel(req.Category); !valid {
			failFields(c, map[string]string{"category": "Kategori tidak dikenal"})
			return
		}
	}
	me := middleware.CurrentAdmin(c)
	a := models.Article{Status: models.StatusDraft, AuthorID: &me.ID, Content: "[]"}
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&a).Error; err != nil {
			return err
		}
		a.Draft = &models.ArticleDraft{
			ArticleID: a.ID, Title: strings.TrimSpace(req.Title), Category: req.Category,
			Content: "[]", Version: 1, UpdatedByID: &me.ID,
		}
		return tx.Create(a.Draft).Error
	})
	if err != nil {
		internal(c, err)
		return
	}
	a.Author = me
	ok(c, http.StatusCreated, toAdminDTO(&a, true))
}

// GET /api/v1/admin/articles/:id
func (h *Handler) AdminGetArticle(c *gin.Context) {
	if a, okk := h.loadArticle(c, h.DB); okk {
		ok(c, http.StatusOK, toAdminDTO(a, true))
	}
}

type saveDraftReq struct {
	Title     string          `json:"title"`
	Slug      string          `json:"slug"`
	Excerpt   string          `json:"excerpt"`
	Category  string          `json:"category"`
	BannerURL *string         `json:"banner_url"`
	BannerAlt string          `json:"banner_alt"`
	Content   json.RawMessage `json:"content"`
	Version   int             `json:"version"`
}

// PUT /api/v1/admin/articles/:id/draft — autosave target. Lenient: a draft
// may be incomplete, but whatever is sent must be well-formed. `version`
// is an optimistic lock: a stale version (another tab/admin saved in
// between) returns 409 instead of silently overwriting.
func (h *Handler) AdminSaveDraft(c *gin.Context) {
	var req saveDraftReq
	if !bind(c, &req) {
		return
	}
	fields := map[string]string{}
	req.Title = strings.TrimSpace(req.Title)
	req.Slug = strings.TrimSpace(req.Slug)
	if utf8.RuneCountInString(req.Title) > 200 {
		fields["title"] = "Judul maksimal 200 karakter"
	}
	if utf8.RuneCountInString(req.Excerpt) > 300 {
		fields["excerpt"] = "Ringkasan maksimal 300 karakter"
	}
	if utf8.RuneCountInString(req.BannerAlt) > 200 {
		fields["banner_alt"] = "Teks alternatif maksimal 200 karakter"
	}
	if req.Slug != "" && (!slug.Valid.MatchString(req.Slug) || len(req.Slug) > slug.MaxLen) {
		fields["slug"] = "Slug hanya huruf kecil, angka, dan tanda hubung"
	}
	if req.Category != "" {
		if _, valid := models.CategoryLabel(req.Category); !valid {
			fields["category"] = "Kategori tidak dikenal"
		}
	}
	if req.BannerURL != nil && *req.BannerURL != "" && !strings.HasPrefix(*req.BannerURL, "/media/") {
		fields["banner_url"] = "Banner harus diunggah melalui dashboard"
	}
	_, normalized, err := content.Parse(req.Content)
	if err != nil {
		fields["content"] = err.Error()
	}
	if len(fields) > 0 {
		failFields(c, fields)
		return
	}
	if req.BannerURL != nil && *req.BannerURL == "" {
		req.BannerURL = nil
	}

	me := middleware.CurrentAdmin(c)
	var result *models.Article
	var conflict bool
	txErr := h.DB.Transaction(func(tx *gorm.DB) error {
		a, okk := h.loadArticle(c, tx.Clauses(clause.Locking{Strength: "UPDATE"}))
		if !okk {
			return errHandled
		}
		if req.Version != 0 && req.Version != a.Draft.Version {
			conflict = true
			result = a
			return errHandled
		}
		if a.Slug != nil {
			req.Slug = *a.Slug // locked after first publish
		}
		a.Draft.Title, a.Draft.Slug, a.Draft.Excerpt = req.Title, req.Slug, strings.TrimSpace(req.Excerpt)
		a.Draft.Category, a.Draft.BannerURL, a.Draft.BannerAlt = req.Category, req.BannerURL, strings.TrimSpace(req.BannerAlt)
		a.Draft.Content = normalized
		a.Draft.Version++
		a.Draft.UpdatedByID = &me.ID
		if err := tx.Save(a.Draft).Error; err != nil {
			return err
		}
		result = a
		return nil
	})
	if conflict {
		c.AbortWithStatusJSON(http.StatusConflict, gin.H{"error": gin.H{
			"code": "DRAFT_CONFLICT", "message": "Draft ini sudah diubah di tempat lain. Muat ulang untuk melihat versi terbaru.",
			"current_version": result.Draft.Version,
		}})
		return
	}
	if txErr == errHandled {
		return
	}
	if txErr != nil {
		internal(c, txErr)
		return
	}
	ok(c, http.StatusOK, gin.H{"version": result.Draft.Version, "updated_at": result.Draft.UpdatedAt})
}

var errHandled = fmt.Errorf("response already written")

// POST /api/v1/admin/articles/:id/publish — strict validation, then copies
// the draft onto the public snapshot.
func (h *Handler) AdminPublishArticle(c *gin.Context) {
	var published *models.Article
	var oldCategory string
	txErr := h.DB.Transaction(func(tx *gorm.DB) error {
		a, okk := h.loadArticle(c, tx.Clauses(clause.Locking{Strength: "UPDATE"}))
		if !okk {
			return errHandled
		}
		d := a.Draft
		blocks, normalized, err := content.Parse(json.RawMessage(d.Content))
		fields := map[string]string{}
		if err != nil {
			fields["content"] = err.Error()
		}
		text := content.PlainText(blocks)
		if l := utf8.RuneCountInString(d.Title); l < 5 {
			fields["title"] = "Judul minimal 5 karakter"
		}
		if _, valid := models.CategoryLabel(d.Category); !valid {
			fields["category"] = "Pilih kategori"
		}
		if utf8.RuneCountInString(text) < 50 {
			fields["content"] = "Isi artikel terlalu pendek (minimal 50 karakter)"
		}
		if d.BannerURL != nil && strings.TrimSpace(d.BannerAlt) == "" {
			fields["banner_alt"] = "Isi teks alternatif banner (penting untuk SEO & aksesibilitas)"
		}
		if len(fields) > 0 {
			failFields(c, fields)
			return errHandled
		}

		if a.Slug == nil {
			base := d.Slug
			if base == "" {
				base = slug.Make(d.Title)
			}
			if base == "" {
				base = "artikel"
			}
			s, err := uniqueSlug(tx, base, a.ID)
			if err != nil {
				return err
			}
			a.Slug = &s
			d.Slug = s
		}
		if a.Category != nil {
			oldCategory = *a.Category
		}
		excerpt := d.Excerpt
		if excerpt == "" {
			excerpt = content.Excerpt(text, 160)
		}
		now := time.Now()
		cat := d.Category
		a.Status = models.StatusPublished
		a.Category = &cat
		a.Title, a.Excerpt, a.BannerURL, a.BannerAlt = d.Title, excerpt, d.BannerURL, d.BannerAlt
		a.Content, a.ContentText, a.ReadingMinutes = normalized, text, content.ReadingMinutes(text)
		if a.PublishedAt == nil {
			a.PublishedAt = &now
		}
		a.LastPublishedAt = &now
		if err := tx.Omit("Draft", "Author").Save(a).Error; err != nil {
			return err
		}
		// Keep draft.updated_at <= last_published_at so "unpublished changes" resets.
		if err := tx.Model(d).UpdateColumns(map[string]any{"slug": d.Slug, "updated_at": now}).Error; err != nil {
			return err
		}
		d.UpdatedAt = now
		published = a
		return nil
	})
	if txErr == errHandled {
		return
	}
	if txErr != nil {
		internal(c, txErr)
		return
	}
	paths := revalidate.ArticlePaths(*published.Slug, *published.Category)
	if oldCategory != "" && oldCategory != *published.Category {
		paths = append(paths, "/blog/kategori/"+oldCategory)
	}
	h.Revalidate.Async(paths)
	ok(c, http.StatusOK, toAdminDTO(published, true))
}

func uniqueSlug(tx *gorm.DB, base string, self uuid.UUID) (string, error) {
	candidate := base
	for i := 2; i < 1000; i++ {
		var n int64
		if err := tx.Model(&models.Article{}).Where("slug = ? AND id <> ?", candidate, self).Count(&n).Error; err != nil {
			return "", err
		}
		if n == 0 {
			return candidate, nil
		}
		candidate = fmt.Sprintf("%s-%d", base, i)
	}
	return "", fmt.Errorf("no free slug for %q", base)
}

// POST /api/v1/admin/articles/:id/unpublish — published → inactive.
func (h *Handler) AdminUnpublishArticle(c *gin.Context) {
	a, okk := h.loadArticle(c, h.DB)
	if !okk {
		return
	}
	if a.Status != models.StatusPublished {
		fail(c, http.StatusConflict, "INVALID_STATE", "Hanya artikel yang sedang terbit yang dapat dinonaktifkan")
		return
	}
	if err := h.DB.Model(a).Update("status", models.StatusInactive).Error; err != nil {
		internal(c, err)
		return
	}
	a.Status = models.StatusInactive
	h.Revalidate.Async(revalidate.ArticlePaths(*a.Slug, deref(a.Category)))
	ok(c, http.StatusOK, toAdminDTO(a, true))
}

// POST /api/v1/admin/articles/:id/discard-draft — reset the working copy
// to the last published version.
func (h *Handler) AdminDiscardDraft(c *gin.Context) {
	a, okk := h.loadArticle(c, h.DB)
	if !okk {
		return
	}
	if a.LastPublishedAt == nil {
		fail(c, http.StatusConflict, "INVALID_STATE", "Artikel belum pernah terbit, tidak ada versi untuk dikembalikan")
		return
	}
	d := a.Draft
	d.Title, d.Slug, d.Excerpt, d.Category = a.Title, deref(a.Slug), a.Excerpt, deref(a.Category)
	d.BannerURL, d.BannerAlt, d.Content = a.BannerURL, a.BannerAlt, a.Content
	d.Version++
	if err := h.DB.Save(d).Error; err != nil {
		internal(c, err)
		return
	}
	// Saving bumps updated_at; pin it back so the article is not flagged as changed.
	h.DB.Model(d).UpdateColumn("updated_at", *a.LastPublishedAt)
	d.UpdatedAt = *a.LastPublishedAt
	ok(c, http.StatusOK, toAdminDTO(a, true))
}

// DELETE /api/v1/admin/articles/:id — permanent. Uploaded images stay in
// the bucket (tracked in the media table) for a later cleanup job.
func (h *Handler) AdminDeleteArticle(c *gin.Context) {
	a, okk := h.loadArticle(c, h.DB)
	if !okk {
		return
	}
	if err := h.DB.Select("Draft").Delete(a).Error; err != nil {
		internal(c, err)
		return
	}
	if a.Slug != nil {
		h.Revalidate.Async(revalidate.ArticlePaths(*a.Slug, deref(a.Category)))
	}
	c.Status(http.StatusNoContent)
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
