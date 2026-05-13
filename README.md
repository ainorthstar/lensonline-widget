# LensOnline chat widget

An embeddable customer-chat widget for [lensonline.be](https://lensonline.be).

Loads as a single `<script>` tag, mounts a floating chat bubble in the
bottom-right of the host page, and opens a chat panel powered by
[assistant-ui](https://www.assistant-ui.com/) on click.

The current build uses a mock chat adapter (canned responses) so the visual
flow can be demoed before the backend is live. When the LensOnline agent
runtime is deployed, the mock adapter is swapped for a real ADK runtime
adapter — no other code changes needed.

## Embed

One line, end of `<body>`:

```html
<script
  src="https://cdn.jsdelivr.net/gh/ainorthstar/lensonline-widget@v0.1.0/dist/widget.js"
  defer
></script>
```

Pin a version (`@v0.1.0`) for stable production embeds. Use `@main` only when
you want to track the latest commit — note jsdelivr caches branches for 12h.

## Local development

```bash
npm install
npm run build
# then serve the built artifact for browser testing:
python3 -m http.server 8765 --directory dist
# open http://127.0.0.1:8765/test.html
```

### Project layout

```
src/
  widget.tsx       LensOnlineWidget component (bubble + panel + Thread)
  mount.tsx        IIFE entrypoint — appends a host div, renders the widget
public/
  test.html        Local test page (copied into dist/ on build)
scripts/
  inline-css.mjs   Post-build step: inlines the vite-extracted CSS into widget.js
                   so the embed is a single JS file (no separate CSS request).
dist/
  widget.js        The build artifact. Served via jsdelivr.
```

### Build pipeline

`npm run build` runs:

1. `tsc -b` — type-check the source
2. `vite build` — IIFE bundle (`dist/widget.js`) + CSS (`dist/widget.css`)
3. `node scripts/inline-css.mjs` — inline the CSS into widget.js, delete widget.css
4. Copy `public/test.html` into `dist/` for local testing

Result: a single self-contained `dist/widget.js` (~530 KB, ~152 KB gzipped).

## Releasing a new version

```bash
# 1. update version in package.json
# 2. build and commit
npm run build
git add dist package.json
git commit -m "release v0.x.y"
# 3. tag and push
git tag v0.x.y
git push && git push --tags
```

jsdelivr will serve the new tag at
`https://cdn.jsdelivr.net/gh/ainorthstar/lensonline-widget@v0.x.y/dist/widget.js`.

## License

MIT. See [LICENSE](./LICENSE).
