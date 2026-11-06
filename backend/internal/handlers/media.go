package handlers

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/imageproc"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/middleware"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/models"
)

var uploadPurposes = map[string]bool{"article": true, "banner": true, "avatar": true}

// POST /api/v1/admin/uploads (multipart: file, purpose=article|banner|avatar)
// Every image becomes WebP, max 1920x1080 (avatar: 512x512 crop), quality 80.
func (h *Handler) Upload(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, h.Cfg.UploadMaxBytes+1<<20)
	purpose := c.DefaultPostForm("purpose", "article")
	if !uploadPurposes[purpose] {
		failFields(c, map[string]string{"purpose": "purpose harus article, banner, atau avatar"})
		return
	}
	fh, err := c.FormFile("file")
	if err != nil {
		var mbe *http.MaxBytesError
		if errors.As(err, &mbe) {
			fail(c, http.StatusRequestEntityTooLarge, "FILE_TOO_LARGE", fmt.Sprintf("Ukuran file maksimal %d MB", h.Cfg.UploadMaxBytes>>20))
			return
		}
		failFields(c, map[string]string{"file": "File wajib diunggah"})
		return
	}
	if fh.Size > h.Cfg.UploadMaxBytes {
		fail(c, http.StatusRequestEntityTooLarge, "FILE_TOO_LARGE", fmt.Sprintf("Ukuran file maksimal %d MB", h.Cfg.UploadMaxBytes>>20))
		return
	}
	f, err := fh.Open()
	if err != nil {
		internal(c, err)
		return
	}
	defer f.Close()
	raw, err := io.ReadAll(f)
	if err != nil {
		internal(c, err)
		return
	}

	opts := imageproc.Options{MaxWidth: h.Cfg.ImageMaxWidth, MaxHeight: h.Cfg.ImageMaxHeight, Quality: h.Cfg.ImageQuality}
	if purpose == "avatar" {
		opts.MaxWidth, opts.Square = 512, true
	}
	res, err := imageproc.Process(raw, opts)
	if err != nil {
		if errors.Is(err, imageproc.ErrUnsupported) || errors.Is(err, imageproc.ErrTooLarge) {
			failFields(c, map[string]string{"file": err.Error()})
			return
		}
		internal(c, err)
		return
	}

	now := time.Now()
	key := fmt.Sprintf("uploads/%s/%04d/%02d/%s.webp", purpose, now.Year(), now.Month(), uuid.New())
	if err := h.Store.Put(c.Request.Context(), key, res.Data, "image/webp"); err != nil {
		internal(c, err)
		return
	}
	me := middleware.CurrentAdmin(c)
	m := models.Media{
		Key: key, URL: "/media/" + key, Purpose: purpose,
		Width: res.Width, Height: res.Height, SizeBytes: int64(len(res.Data)), UploadedByID: &me.ID,
	}
	if err := h.DB.Create(&m).Error; err != nil {
		internal(c, err)
		return
	}
	ok(c, http.StatusCreated, m)
}

// GET /media/*key — streams objects from the private bucket. Keys are
// random UUIDs and never overwritten, so responses are cached "forever".
func (h *Handler) ServeMedia(c *gin.Context) {
	key := strings.TrimPrefix(path.Clean(c.Param("key")), "/")
	if !strings.HasPrefix(key, "uploads/") || strings.Contains(key, "..") {
		c.Status(http.StatusNotFound)
		return
	}
	obj, err := h.Store.Get(c.Request.Context(), key)
	if err != nil {
		internal(c, err)
		return
	}
	if obj == nil {
		c.Status(http.StatusNotFound)
		return
	}
	defer obj.Body.Close()
	etag := `"` + obj.ETag + `"`
	c.Header("Cache-Control", "public, max-age=31536000, immutable")
	c.Header("ETag", etag)
	if c.GetHeader("If-None-Match") == etag {
		c.Status(http.StatusNotModified)
		return
	}
	ct := obj.ContentType
	if ct == "" {
		ct = "application/octet-stream"
	}
	c.DataFromReader(http.StatusOK, obj.Size, ct, obj.Body, nil)
}
