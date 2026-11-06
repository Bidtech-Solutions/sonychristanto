package imageproc

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"net/http"
	"testing"
)

func TestProcessDownscalesToWebP(t *testing.T) {
	src := image.NewRGBA(image.Rect(0, 0, 4000, 3000))
	for x := 0; x < 4000; x += 7 {
		src.Set(x, x%3000, color.RGBA{200, 30, 30, 255})
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, src); err != nil {
		t.Fatal(err)
	}
	res, err := Process(buf.Bytes(), Options{MaxWidth: 1920, MaxHeight: 1080, Quality: 80})
	if err != nil {
		t.Fatal(err)
	}
	if res.Width != 1440 || res.Height != 1080 {
		t.Fatalf("got %dx%d, want 1440x1080", res.Width, res.Height)
	}
	if ct := http.DetectContentType(res.Data); ct != "image/webp" {
		t.Fatalf("content type %s", ct)
	}
}

func TestProcessRejectsNonImage(t *testing.T) {
	if _, err := Process([]byte("%PDF-1.4 hello"), Options{MaxWidth: 1920, MaxHeight: 1080, Quality: 80}); err != ErrUnsupported {
		t.Fatalf("err = %v", err)
	}
}
