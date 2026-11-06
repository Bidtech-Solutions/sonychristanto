// BlockNote is a React library. The dashboard is Vue, so we mount a tiny
// React root inside a client-only Vue component (ArticleEditor.client.vue).
// Written with createElement (no JSX) so Vite needs no React plugin.
//
// The editor schema is deliberately limited. Keep it in sync with:
//   - backend/internal/content/content.go (AllowedBlocks, MaxColumns)
//   - app/components/blog/BlockRenderer.vue (public renderer)
//
// LICENSE NOTE: @blocknote/xl-multi-column is "GPL-3.0 OR PROPRIETARY"
// (the rest of BlockNote is MPL-2.0). See docs/PRD.md K-1 before go-live.
import { BlockNoteSchema, defaultBlockSpecs, filterSuggestionItems } from '@blocknote/core'
import { en } from '@blocknote/core/locales'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote } from '@blocknote/react'
import { getMultiColumnSlashMenuItems, locales as multiColumnLocales, withMultiColumn } from '@blocknote/xl-multi-column'
import { createElement as h } from 'react'
import { createRoot } from 'react-dom/client'

const { paragraph, heading, quote, bulletListItem, numberedListItem, checkListItem, image, divider } = defaultBlockSpecs

export const schema = withMultiColumn(
  BlockNoteSchema.create({
    blockSpecs: { paragraph, heading, quote, bulletListItem, numberedListItem, checkListItem, image, divider },
  }),
)

export interface EditorOptions {
  initialContent: unknown[]
  uploadFile: (file: File) => Promise<string>
  onChange: (doc: unknown[]) => void
}

function Editor(props: EditorOptions) {
  const editor = useCreateBlockNote({
    schema,
    dictionary: { ...en, multi_column: multiColumnLocales.en } as any,
    initialContent: props.initialContent.length ? (props.initialContent as any) : undefined,
    uploadFile: props.uploadFile,
    // No multiColumnDropCursor: dragging a block to a column edge would create
    // a 3rd column. Columns are only created from the slash menu ("2 kolom").
  })

  const getItems = async (query: string) =>
    filterSuggestionItems(
      [
        ...getDefaultReactSlashMenuItems(editor),
        ...getMultiColumnSlashMenuItems(editor).slice(0, 1), // two columns only
      ] as any[],
      query,
    )

  return h(
    BlockNoteView as any,
    { editor, theme: 'light', slashMenu: false, onChange: () => props.onChange(editor.document as unknown[]) },
    h(SuggestionMenuController as any, { triggerCharacter: '/', getItems }),
  )
}

/** Mounts the editor into `el`; returns an unmount function. */
export function mountEditor(el: HTMLElement, opts: EditorOptions) {
  const root = createRoot(el)
  root.render(h(Editor, opts))
  return () => root.unmount()
}
