// Modul Galeri — static photos shown in a bento grid with a full-screen viewer.
// Put optimised images in public/images/galeri/ (run `npm run images:optimize`).
// `size` controls the bento tile: 'lg' = 2x2, 'wide' = 2x1, 'tall' = 1x2, 'sm' = 1x1.

export interface GalleryItem {
  src: string
  alt: string // describe the photo — required for accessibility & image SEO
  caption?: string
  date?: string // ISO yyyy-mm-dd
  width: number
  height: number
  size?: 'sm' | 'wide' | 'tall' | 'lg'
}

export const gallery: GalleryItem[] = [
  // TODO(klien): foto kegiatan resolusi tinggi.
]
