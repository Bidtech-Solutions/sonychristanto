package content

import "testing"

func TestParseRejectsThreeColumns(t *testing.T) {
	doc := `[{"id":"a","type":"columnList","props":{},"content":[],"children":[
	 {"id":"c1","type":"column","props":{},"content":[],"children":[]},
	 {"id":"c2","type":"column","props":{},"content":[],"children":[]},
	 {"id":"c3","type":"column","props":{},"content":[],"children":[]}]}]`
	if _, _, err := Parse([]byte(doc)); err == nil {
		t.Fatal("expected error for 3 columns")
	}
}

func TestParseAcceptsTwoColumnsAndExtractsText(t *testing.T) {
	doc := `[{"id":"a","type":"columnList","props":{},"content":[],"children":[
	 {"id":"c1","type":"column","props":{},"content":[],"children":[
	   {"id":"p1","type":"paragraph","props":{},"content":[{"type":"text","text":"Halo","styles":{}}],"children":[]}]},
	 {"id":"c2","type":"column","props":{},"content":[],"children":[
	   {"id":"p2","type":"paragraph","props":{},"content":[{"type":"link","href":"https://x.id","content":[{"type":"text","text":"Batam","styles":{}}]}],"children":[]}]}]}]`
	blocks, _, err := Parse([]byte(doc))
	if err != nil {
		t.Fatal(err)
	}
	if got := PlainText(blocks); got != "Halo\nBatam" {
		t.Fatalf("PlainText = %q", got)
	}
}

func TestParseRejectsExternalImagesAndUnknownBlocks(t *testing.T) {
	for _, doc := range []string{
		`[{"id":"i","type":"image","props":{"url":"https://evil.example/x.png"},"children":[]}]`,
		`[{"id":"t","type":"table","props":{},"children":[]}]`,
	} {
		if _, _, err := Parse([]byte(doc)); err == nil {
			t.Fatalf("expected error for %s", doc)
		}
	}
}
