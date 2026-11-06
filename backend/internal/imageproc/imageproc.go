// Package imageproc normalises every upload: EXIF auto-rotate, downscale to
// fit the configured box (default 1920x1080, never upscaled) and re-encode as
// WebP (default quality 80). Metadata (EXIF/GPS) is dropped in the process.
package imageproc

import (
	"bytes"
	"errors"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"net/http"

	"github.com/disintegration/imaging"
	"github.com/gen2brain/webp"
	_ "golang.org/x/image/webp"
)

var ErrUnsupported = errors.New("format gambar tidak didukung (gunakan JPG, PNG, WebP, atau GIF)")
var ErrTooLarge = errors.New("dimensi gambar terlalu besar (maksimal 50 megapiksel)")

const maxPixels = 50_000_000

var allowed = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

type Result struct {
	Data   []byte
	Width  int
	Height int
}

type Options struct {
	MaxWidth  int
	MaxHeight int
	Quality   int
	// Square crops to a centred square (used for avatars).
	Square bool
}

func Process(raw []byte, o Options) (*Result, error) {
	if !allowed[http.DetectContentType(raw)] {
		return nil, ErrUnsupported
	}
	// Check dimensions before decoding the full image (decompression bombs).
	cfg, _, err := image.DecodeConfig(bytes.NewReader(raw))
	if err != nil {
		return nil, ErrUnsupported
	}
	if cfg.Width*cfg.Height > maxPixels {
		return nil, ErrTooLarge
	}
	img, err := imaging.Decode(bytes.NewReader(raw), imaging.AutoOrientation(true))
	if err != nil {
		return nil, ErrUnsupported
	}
	if o.Square {
		img = imaging.Fill(img, o.MaxWidth, o.MaxWidth, imaging.Center, imaging.Lanczos)
	} else {
		img = imaging.Fit(img, o.MaxWidth, o.MaxHeight, imaging.Lanczos)
	}
	var buf bytes.Buffer
	if err := webp.Encode(&buf, img, webp.Options{Quality: o.Quality, Method: 4}); err != nil {
		return nil, err
	}
	b := img.Bounds()
	return &Result{Data: buf.Bytes(), Width: b.Dx(), Height: b.Dy()}, nil
}
