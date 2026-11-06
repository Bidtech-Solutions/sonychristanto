// Package storage wraps the S3-compatible object store (RustFS).
package storage

import (
	"bytes"
	"context"
	"io"
	"log/slog"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/config"
)

type Store struct {
	client *minio.Client
	bucket string
}

func New(cfg *config.Config) (*Store, error) {
	c, err := minio.New(cfg.S3Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.S3AccessKey, cfg.S3SecretKey, ""),
		Secure: cfg.S3UseSSL,
		Region: cfg.S3Region,
	})
	if err != nil {
		return nil, err
	}
	return &Store{client: c, bucket: cfg.S3Bucket}, nil
}

// EnsureBucket creates the bucket if missing. The bucket stays PRIVATE:
// the public only reaches objects through GET /media/* on the backend.
func (s *Store) EnsureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return err
	}
	if !exists {
		if err := s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{}); err != nil {
			return err
		}
		slog.Info("bucket created", "bucket", s.bucket)
	}
	return nil
}

func (s *Store) Put(ctx context.Context, key string, data []byte, contentType string) error {
	_, err := s.client.PutObject(ctx, s.bucket, key, bytes.NewReader(data), int64(len(data)), minio.PutObjectOptions{
		ContentType:  contentType,
		CacheControl: "public, max-age=31536000, immutable",
	})
	return err
}

type Object struct {
	Body        io.ReadCloser
	Size        int64
	ContentType string
	ETag        string
}

// Get returns (nil, nil) when the key does not exist.
func (s *Store) Get(ctx context.Context, key string) (*Object, error) {
	info, err := s.client.StatObject(ctx, s.bucket, key, minio.StatObjectOptions{})
	if err != nil {
		if minio.ToErrorResponse(err).Code == "NoSuchKey" {
			return nil, nil
		}
		return nil, err
	}
	obj, err := s.client.GetObject(ctx, s.bucket, key, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	return &Object{Body: obj, Size: info.Size, ContentType: info.ContentType, ETag: info.ETag}, nil
}

func (s *Store) Delete(ctx context.Context, key string) error {
	return s.client.RemoveObject(ctx, s.bucket, key, minio.RemoveObjectOptions{})
}
