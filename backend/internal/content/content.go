// Package content validates BlockNote documents and derives plain text from
// them (for excerpts, reading time, llms-full.txt and search).
package content

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strings"
	"unicode/utf8"
)

const MaxBytes = 2 << 20 // 2 MB of JSON per article
const MaxColumns = 2

// AllowedBlocks must stay in sync with the editor schema
// (frontend/app/editor/blocknote.ts) and the public renderer
// (frontend/app/components/blog/BlockRenderer.vue).
var AllowedBlocks = map[string]bool{
	"paragraph":        true,
	"heading":          true,
	"quote":            true,
	"bulletListItem":   true,
	"numberedListItem": true,
	"checkListItem":    true,
	"image":            true,
	"divider":          true,
	"columnList":       true,
	"column":           true,
}

type Block struct {
	ID       string          `json:"id"`
	Type     string          `json:"type"`
	Props    map[string]any  `json:"props"`
	Content  json.RawMessage `json:"content"`
	Children []Block         `json:"children"`
}

type inline struct {
	Type    string   `json:"type"`
	Text    string   `json:"text"`
	Href    string   `json:"href"`
	Content []inline `json:"content"`
}

// Parse validates the document and returns it normalised (empty -> "[]").
func Parse(raw json.RawMessage) ([]Block, string, error) {
	if len(raw) == 0 || string(raw) == "null" {
		return []Block{}, "[]", nil
	}
	if len(raw) > MaxBytes {
		return nil, "", errors.New("konten artikel terlalu besar")
	}
	var blocks []Block
	if err := json.Unmarshal(raw, &blocks); err != nil {
		return nil, "", errors.New("format konten tidak valid")
	}
	if err := validate(blocks, ""); err != nil {
		return nil, "", err
	}
	return blocks, string(raw), nil
}

func validate(blocks []Block, parent string) error {
	for _, b := range blocks {
		if !AllowedBlocks[b.Type] {
			return fmt.Errorf("tipe blok %q tidak didukung", b.Type)
		}
		switch b.Type {
		case "columnList":
			if len(b.Children) > MaxColumns {
				return fmt.Errorf("maksimal %d kolom", MaxColumns)
			}
			for _, c := range b.Children {
				if c.Type != "column" {
					return errors.New("columnList hanya boleh berisi column")
				}
			}
		case "column":
			if parent != "columnList" {
				return errors.New("column harus berada di dalam columnList")
			}
		case "image":
			url, _ := b.Props["url"].(string)
			if url != "" && !strings.HasPrefix(url, "/media/") {
				return errors.New("gambar harus diunggah melalui dashboard")
			}
		}
		if err := validate(b.Children, b.Type); err != nil {
			return err
		}
	}
	return nil
}

// PlainText flattens the document into readable text, one block per line.
func PlainText(blocks []Block) string {
	var sb strings.Builder
	var walk func([]Block)
	walk = func(bs []Block) {
		for _, b := range bs {
			var inl []inline
			_ = json.Unmarshal(b.Content, &inl)
			line := strings.TrimSpace(inlineText(inl))
			if b.Type == "image" {
				if cap, _ := b.Props["caption"].(string); cap != "" {
					line = cap
				}
			}
			if line != "" {
				sb.WriteString(line)
				sb.WriteString("\n")
			}
			walk(b.Children)
		}
	}
	walk(blocks)
	return strings.TrimSpace(sb.String())
}

func inlineText(items []inline) string {
	var sb strings.Builder
	for _, it := range items {
		switch it.Type {
		case "text":
			sb.WriteString(it.Text)
		case "link":
			sb.WriteString(inlineText(it.Content))
		}
	}
	return sb.String()
}

// ReadingMinutes assumes ~200 words per minute (Indonesian prose).
func ReadingMinutes(text string) int {
	words := len(strings.Fields(text))
	return int(math.Max(1, math.Ceil(float64(words)/200)))
}

// Excerpt cuts text at a word boundary to at most n runes.
func Excerpt(text string, n int) string {
	text = strings.Join(strings.Fields(text), " ")
	if utf8.RuneCountInString(text) <= n {
		return text
	}
	r := []rune(text)[:n]
	s := string(r)
	if i := strings.LastIndex(s, " "); i > n/2 {
		s = s[:i]
	}
	return strings.TrimRight(s, " ,.;:") + "…"
}
