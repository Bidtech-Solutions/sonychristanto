// Package handlers implements the HTTP API. Response envelope:
//
//	success: {"data": ..., "meta": {...}}
//	error:   {"error": {"code": "...", "message": "...", "fields": {...}}}
package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/config"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/revalidate"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/storage"
)

type Handler struct {
	Cfg        *config.Config
	DB         *gorm.DB
	Store      *storage.Store
	Revalidate *revalidate.Client
}

func ok(c *gin.Context, status int, data any) {
	c.JSON(status, gin.H{"data": data})
}

func okMeta(c *gin.Context, data any, meta any) {
	c.JSON(http.StatusOK, gin.H{"data": data, "meta": meta})
}

func fail(c *gin.Context, status int, code, msg string) {
	c.AbortWithStatusJSON(status, gin.H{"error": gin.H{"code": code, "message": msg}})
}

func failFields(c *gin.Context, fields map[string]string) {
	c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{"error": gin.H{
		"code": "VALIDATION_ERROR", "message": "Periksa kembali isian Anda", "fields": fields,
	}})
}

func internal(c *gin.Context, err error) {
	_ = c.Error(err)
	fail(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Terjadi kesalahan pada server")
}

func notFound(c *gin.Context, what string) {
	fail(c, http.StatusNotFound, "NOT_FOUND", what+" tidak ditemukan")
}

func isNotFound(err error) bool { return errors.Is(err, gorm.ErrRecordNotFound) }

func isDuplicate(err error) bool { return errors.Is(err, gorm.ErrDuplicatedKey) }

// bind decodes JSON and reports malformed bodies uniformly.
func bind(c *gin.Context, dst any) bool {
	if err := c.ShouldBindJSON(dst); err != nil {
		fail(c, http.StatusBadRequest, "BAD_REQUEST", "Body request tidak valid")
		return false
	}
	return true
}

type pageMeta struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

func pagination(c *gin.Context, defPer, maxPer int) (page, per int) {
	page, _ = strconv.Atoi(c.DefaultQuery("page", "1"))
	per, _ = strconv.Atoi(c.DefaultQuery("per_page", strconv.Itoa(defPer)))
	if page < 1 {
		page = 1
	}
	if per < 1 || per > maxPer {
		per = defPer
	}
	return
}

func newPageMeta(page, per int, total int64) pageMeta {
	return pageMeta{Page: page, PerPage: per, Total: total, TotalPages: int((total + int64(per) - 1) / int64(per))}
}

func Health(c *gin.Context) {
	ok(c, http.StatusOK, gin.H{"status": "ok"})
}
