package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/models"
)

type categoryDTO struct {
	Key   string `json:"key"`
	Label string `json:"label"`
}

type publicArticleDTO struct {
	Slug           string          `json:"slug"`
	Title          string          `json:"title"`
	Excerpt        string          `json:"excerpt"`
	Category       categoryDTO     `json:"category"`
	BannerURL      *string         `json:"banner_url"`
	BannerAlt      string          `json:"banner_alt"`
	ReadingMinutes int             `json:"reading_minutes"`
	PublishedAt    *time.Time      `json:"published_at"`
	UpdatedAt      *time.Time      `json:"updated_at"`
	Author         *authorDTO      `json:"author,omitempty"`
	Content        json.RawMessage `json:"content,omitempty"`
	ContentText    string          `json:"content_text,omitempty"`
}

func toPublicDTO(a *models.Article) publicArticleDTO {
	cat := deref(a.Category)
	label, _ := models.CategoryLabel(cat)
	d := publicArticleDTO{
		Slug: deref(a.Slug), Title: a.Title, Excerpt: a.Excerpt,
		Category:  categoryDTO{Key: cat, Label: label},
		BannerURL: a.BannerURL, BannerAlt: a.BannerAlt, ReadingMinutes: a.ReadingMinutes,
		PublishedAt: a.PublishedAt, UpdatedAt: a.LastPublishedAt,
	}
	if a.Author != nil {
		d.Author = &authorDTO{Name: a.Author.Name}
	}
	return d
}

// GET /api/v1/categories
func (h *Handler) PublicCategories(c *gin.Context) {
	ok(c, http.StatusOK, models.Categories)
}

// GET /api/v1/articles?category=&page=&per_page=
func (h *Handler) PublicListArticles(c *gin.Context) {
	page, per := pagination(c, 9, 30)
	q := h.DB.Model(&models.Article{}).Where("status = ?", models.StatusPublished)
	if cat := c.Query("category"); cat != "" {
		if _, valid := models.CategoryLabel(cat); !valid {
			notFound(c, "Kategori")
			return
		}
		q = q.Where("category = ?", cat)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		internal(c, err)
		return
	}
	var list []models.Article
	if err := q.Omit("content", "content_text").Order("published_at DESC").
		Offset((page - 1) * per).Limit(per).Find(&list).Error; err != nil {
		internal(c, err)
		return
	}
	out := make([]publicArticleDTO, len(list))
	for i := range list {
		out[i] = toPublicDTO(&list[i])
	}
	okMeta(c, out, newPageMeta(page, per, total))
}

// GET /api/v1/articles/:slug
func (h *Handler) PublicGetArticle(c *gin.Context) {
	var a models.Article
	err := h.DB.Preload("Author").Where("slug = ? AND status = ?", c.Param("slug"), models.StatusPublished).First(&a).Error
	if err != nil {
		if isNotFound(err) {
			notFound(c, "Artikel")
		} else {
			internal(c, err)
		}
		return
	}
	d := toPublicDTO(&a)
	d.Content = json.RawMessage(a.Content)
	ok(c, http.StatusOK, d)
}

// GET /api/v1/feeds/articles?include_text=1 — every published article, for
// sitemap.xml, feed.xml, llms.txt and llms-full.txt.
func (h *Handler) PublicArticleFeed(c *gin.Context) {
	withText := c.Query("include_text") == "1"
	q := h.DB.Where("status = ?", models.StatusPublished).Order("published_at DESC").Limit(5000)
	q = q.Omit("content")
	if !withText {
		q = q.Omit("content", "content_text")
	}
	var list []models.Article
	if err := q.Find(&list).Error; err != nil {
		internal(c, err)
		return
	}
	out := make([]publicArticleDTO, len(list))
	for i := range list {
		out[i] = toPublicDTO(&list[i])
		if withText {
			out[i].ContentText = list[i].ContentText
		}
	}
	ok(c, http.StatusOK, out)
}
