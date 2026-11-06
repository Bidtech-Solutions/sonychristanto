package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/config"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/database"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/router"
	"github.com/Bidtech-Solutions/sonychristanto/backend/internal/storage"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	if err := run(); err != nil {
		slog.Error("fatal", "err", err)
		os.Exit(1)
	}
}

func run() error {
	// `server healthcheck` is used by the Docker HEALTHCHECK (distroless has no curl).
	if len(os.Args) > 1 && os.Args[1] == "healthcheck" {
		port := os.Getenv("BACKEND_PORT")
		if port == "" {
			port = "8080"
		}
		res, err := http.Get("http://127.0.0.1:" + port + "/api/v1/health")
		if err != nil || res.StatusCode != http.StatusOK {
			os.Exit(1)
		}
		return nil
	}

	cfg, err := config.Load()
	if err != nil {
		return err
	}
	db, err := database.Connect(cfg)
	if err != nil {
		return err
	}
	if err := database.Migrate(db); err != nil {
		return err
	}
	if err := database.SeedSuperadmin(db, cfg); err != nil {
		return err
	}

	store, err := storage.New(cfg)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	for i := 0; ; i++ {
		if err = store.EnsureBucket(ctx); err == nil || i == 10 {
			break
		}
		slog.Warn("object storage not ready, retrying", "err", err)
		time.Sleep(2 * time.Second)
	}
	cancel()
	if err != nil {
		return err
	}

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router.New(cfg, db, store),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       60 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}
	errCh := make(chan error, 1)
	go func() {
		slog.Info("backend listening", "port", cfg.Port, "env", cfg.AppEnv)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	select {
	case err := <-errCh:
		return err
	case <-stop:
	}
	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancelShutdown()
	slog.Info("shutting down")
	return srv.Shutdown(shutdownCtx)
}
