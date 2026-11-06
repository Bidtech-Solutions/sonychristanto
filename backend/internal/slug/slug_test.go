package slug

import "testing"

func TestMake(t *testing.T) {
	cases := map[string]string{
		"Rapat Kerja Komisi IV: Pendidikan di Batam!": "rapat-kerja-komisi-iv-pendidikan-di-batam",
		"  Café  Kopi  ": "cafe-kopi",
	}
	for in, want := range cases {
		if got := Make(in); got != want {
			t.Errorf("Make(%q) = %q, want %q", in, got, want)
		}
	}
}
