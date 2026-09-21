# CODEX.md — Glasscript project direction

## Product definition

This is **not a chat bubble card maker**.

The core product is a browser-based long-form text compositor for people who want to share excerpts from AI character chats, roleplay scenes, prose, dialogue, or notes as a beautiful **single continuous novel/document page**.

Think:

> Markdown editor → elegant long-form typesetting → export the entire result as PNG / WEBP / PDF.

Do not reintroduce chat bubbles, messenger layouts, profile avatars, or card-by-card dialogue UI unless explicitly requested later.

## UX principles

1. The text itself is the focus.
2. Preview should feel like reading a novel, manuscript, essay, or literary archive.
3. The output should be one continuous vertical composition, not a collection of cards.
4. Editor controls should stay compact and secondary.
5. The site shell uses restrained iOS-like glass UI.
6. Avoid excessive gradients, giant rounded cards, decorative stickers, or playful social-media UI by default.

## Theme

### Light
- pale cool background
- sky-blue accent
- translucent white glass panels
- output paper is warm near-white

### Dark
- near-black neutral background
- muted champagne-gold accent
- charcoal glass panels
- output paper is warm deep charcoal, not pure black

Avoid saturated yellow/gold.

## Markdown

Rendering currently uses:

- `react-markdown`
- `remark-gfm`
- raw HTML disabled (`skipHtml`)

Support and preserve:

- headings
- paragraphs
- bold / italic
- blockquotes
- horizontal rules
- ordered/unordered lists
- links
- code / code blocks
- GFM tables
- task lists

Future Markdown improvements may include custom scene-break syntax or custom dialogue styling, but only if it still reads as continuous prose.

## Export requirements

Required export formats:

- PNG
- WEBP
- PDF

PNG/WEBP should export the entire continuous page as one tall image when browser canvas limits allow it.

PDF should paginate the rendered page into A4 pages automatically.

Do not upload user content to a server for export.

## Privacy

Keep content processing client-side. The current autosave uses localStorage only.

No analytics, backend, account system, cloud saving, or remote text processing should be added without explicit request.

## Development priorities

### Current
- Markdown long-form editor
- continuous typeset preview
- responsive UI
- theme toggle
- typography controls
- PNG / WEBP / PDF export

### Next useful improvements
1. Safer chunked PNG/WEBP export for extremely long documents that exceed browser canvas limits.
2. Custom background / paper presets while keeping text readability high.
3. Optional cover/header presets.
4. Import `.md` / `.txt` files.
5. Export/import project JSON.
6. Optional custom fonts with careful export compatibility.
7. Share-size presets, but never force the continuous document into chat bubbles.

## Quality bar

Before committing changes:

```bash
npm install
npm run build
```

Ensure GitHub Pages still works with the existing Vite base configuration and deployment workflow.
