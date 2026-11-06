// Package revalidate tells the Nuxt server (ISR cache) and, optionally,
// Cloudflare to drop cached copies of pages after article changes.
package revalidate

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/config"
)

type Client struct {
	cfg  *config.Config
	http *http.Client
}

func New(cfg *config.Config) *Client {
	return &Client{cfg: cfg, http: &http.Client{Timeout: 10 * time.Second}}
}

// ArticlePaths lists every page that shows the article.
func ArticlePaths(slug, category string) []string {
	paths := []string{"/", "/blog", "/sitemap.xml", "/llms.txt", "/llms-full.txt", "/feed.xml"}
	if slug != "" {
		paths = append(paths, "/blog/"+slug)
	}
	if category != "" {
		paths = append(paths, "/blog/kategori/"+category)
	}
	return paths
}

// Async fires and forgets; failures are logged, never surfaced to the editor.
// Pages still refresh on their own when the ISR TTL expires.
func (c *Client) Async(paths []string) {
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()
		if err := c.nuxt(ctx, paths); err != nil {
			slog.Warn("nuxt revalidate failed", "err", err)
		}
		if err := c.cloudflare(ctx, paths); err != nil {
			slog.Warn("cloudflare purge failed", "err", err)
		}
	}()
}

func (c *Client) nuxt(ctx context.Context, paths []string) error {
	if c.cfg.RevalidateURL == "" || c.cfg.RevalidateSecret == "" {
		return nil
	}
	body, _ := json.Marshal(map[string]any{"paths": paths})
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, c.cfg.RevalidateURL, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Revalidate-Secret", c.cfg.RevalidateSecret)
	return c.do(req)
}

func (c *Client) cloudflare(ctx context.Context, paths []string) error {
	if c.cfg.CloudflareZoneID == "" || c.cfg.CloudflareAPIToken == "" {
		return nil
	}
	files := make([]string, 0, len(paths)+1)
	for _, p := range paths {
		files = append(files, c.cfg.SiteURL+p)
	}
	body, _ := json.Marshal(map[string]any{"files": files})
	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/purge_cache", c.cfg.CloudflareZoneID)
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.cfg.CloudflareAPIToken)
	return c.do(req)
}

func (c *Client) do(req *http.Request) error {
	res, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return fmt.Errorf("%s responded %d", req.URL.Host, res.StatusCode)
	}
	return nil
}
