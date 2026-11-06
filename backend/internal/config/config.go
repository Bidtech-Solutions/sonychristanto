// Package config loads runtime configuration from environment variables.
package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv string
	Port   string

	DatabaseURL string

	JWTSecret    string
	JWTTTL       time.Duration
	CookieName   string
	CookieSecure bool
	CookieDomain string

	SeedAdminName     string
	SeedAdminEmail    string
	SeedAdminPassword string

	S3Endpoint  string
	S3AccessKey string
	S3SecretKey string
	S3Bucket    string
	S3Region    string
	S3UseSSL    bool

	UploadMaxBytes int64
	ImageMaxWidth  int
	ImageMaxHeight int
	ImageQuality   int

	SiteURL            string
	RevalidateURL      string
	RevalidateSecret   string
	CloudflareZoneID   string
	CloudflareAPIToken string

	TrustedProxies []string
}

func (c *Config) IsProduction() bool { return c.AppEnv == "production" }

// Load reads configuration and fails fast on anything unsafe for production.
func Load() (*Config, error) {
	c := &Config{
		AppEnv: env("APP_ENV", "development"),
		Port:   env("BACKEND_PORT", "8080"),

		JWTSecret:    os.Getenv("JWT_SECRET"),
		JWTTTL:       time.Duration(envInt("JWT_TTL_HOURS", 12)) * time.Hour,
		CookieName:   env("AUTH_COOKIE_NAME", "sc_session"),
		CookieSecure: envBool("AUTH_COOKIE_SECURE", false),
		CookieDomain: os.Getenv("AUTH_COOKIE_DOMAIN"),

		SeedAdminName:     env("SEED_ADMIN_NAME", "Super Admin"),
		SeedAdminEmail:    strings.ToLower(strings.TrimSpace(os.Getenv("SEED_ADMIN_EMAIL"))),
		SeedAdminPassword: os.Getenv("SEED_ADMIN_PASSWORD"),

		S3Endpoint:  env("S3_ENDPOINT", "rustfs:9000"),
		S3AccessKey: os.Getenv("S3_ACCESS_KEY"),
		S3SecretKey: os.Getenv("S3_SECRET_KEY"),
		S3Bucket:    env("S3_BUCKET", "sonychristanto"),
		S3Region:    env("S3_REGION", "us-east-1"),
		S3UseSSL:    envBool("S3_USE_SSL", false),

		UploadMaxBytes: int64(envInt("UPLOAD_MAX_MB", 10)) * 1024 * 1024,
		ImageMaxWidth:  envInt("IMAGE_MAX_WIDTH", 1920),
		ImageMaxHeight: envInt("IMAGE_MAX_HEIGHT", 1080),
		ImageQuality:   envInt("IMAGE_QUALITY", 80),

		SiteURL:            strings.TrimRight(env("SITE_URL", "http://localhost:3000"), "/"),
		RevalidateURL:      os.Getenv("FRONTEND_REVALIDATE_URL"),
		RevalidateSecret:   os.Getenv("REVALIDATE_SECRET"),
		CloudflareZoneID:   os.Getenv("CLOUDFLARE_ZONE_ID"),
		CloudflareAPIToken: os.Getenv("CLOUDFLARE_API_TOKEN"),

		TrustedProxies: splitList(env("TRUSTED_PROXIES", "127.0.0.1,::1,172.16.0.0/12,10.0.0.0/8,192.168.0.0/16")),
	}

	c.DatabaseURL = os.Getenv("DATABASE_URL")
	if c.DatabaseURL == "" {
		// key=value DSN (not a URL): pgx does not un-escape "Asia%2FJakarta",
		// and quoting keeps passwords with spaces or symbols intact.
		c.DatabaseURL = strings.Join([]string{
			"host=" + dsnQuote(env("POSTGRES_HOST", "postgres")),
			"port=" + dsnQuote(env("POSTGRES_PORT", "5432")),
			"user=" + dsnQuote(env("POSTGRES_USER", "sony")),
			"password=" + dsnQuote(os.Getenv("POSTGRES_PASSWORD")),
			"dbname=" + dsnQuote(env("POSTGRES_DB", "sonychristanto")),
			"sslmode=" + dsnQuote(env("POSTGRES_SSLMODE", "disable")),
			"TimeZone=Asia/Jakarta",
		}, " ")
	}

	if len(c.JWTSecret) < 32 {
		if c.IsProduction() {
			return nil, fmt.Errorf("JWT_SECRET must be at least 32 characters in production")
		}
		c.JWTSecret = "dev-only-insecure-secret-change-me-please-0000"
	}
	if c.IsProduction() {
		if !c.CookieSecure {
			return nil, fmt.Errorf("AUTH_COOKIE_SECURE must be true in production")
		}
		if c.S3AccessKey == "" || c.S3SecretKey == "" {
			return nil, fmt.Errorf("S3_ACCESS_KEY and S3_SECRET_KEY are required in production")
		}
	}
	if c.ImageQuality < 1 || c.ImageQuality > 100 {
		c.ImageQuality = 80
	}
	return c, nil
}

// dsnQuote quotes a libpq key=value DSN value.
func dsnQuote(v string) string {
	return "'" + strings.NewReplacer(`\`, `\\`, `'`, `\'`).Replace(v) + "'"
}

func env(key, def string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return def
}

func envInt(key string, def int) int {
	if v, err := strconv.Atoi(strings.TrimSpace(os.Getenv(key))); err == nil {
		return v
	}
	return def
}

func envBool(key string, def bool) bool {
	if v, err := strconv.ParseBool(strings.TrimSpace(os.Getenv(key))); err == nil {
		return v
	}
	return def
}

func splitList(s string) []string {
	var out []string
	for _, p := range strings.Split(s, ",") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}
