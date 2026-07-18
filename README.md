# @pushkar/ghost-text


The original idea and desing is by Eric Lu, founder of AI typography platform Mixfont
I have made an open-source tool which devs can use for thier project

**Animated dot-field text rendering for the web.** Text decomposed into opposing-direction scrolling particle fields that create a spectral "ghost font" illusion on Canvas2D.

> ⚠️ **This is not a font.** Ghost Text is a per-frame animated Canvas2D illusion. It needs a render loop, can't be indexed by search engines, won't work with SSR, and intentionally breaks if paused on a single frame.

## Installation

```bash
npm install @pushkar/ghost-text
```

## Quick Start

### React

```tsx
import { GhostText } from '@pushkar/ghost-text';

function App() {
  return (
    <GhostText
      text="HELLO"
      width={800}
      height={200}
      fontSize={80}
      dotSpacing={4}
      letterScrollSpeed={0.5}
      bgScrollSpeed={-0.3}
      letterDotColor="#ffffff"
      backgroundColor="#0a0a0f"
    />
  );
}
```

### Vanilla TypeScript / JavaScript

```ts
import { GhostTextRenderer } from '@pushkar/ghost-text';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 200;

const renderer = new GhostTextRenderer(canvas, {
  text: 'HELLO',
  fontSize: 80,
  dotSpacing: 4,
  letterScrollSpeed: 0.5,
  bgScrollSpeed: -0.3,
});

renderer.start();

// Update text dynamically:
renderer.updateText('WORLD');

// Update options without recreating:
renderer.updateOptions({ letterDotColor: '#ff6b6b', dotSpacing: 3 });

// Clean up:
renderer.destroy();
```

## API Reference

### `GhostTextOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | `string` | *required* | Text to render as ghost dots |
| `fontSize` | `number` | `80` | Font size for text sampling (px) |
| `fontFamily` | `string` | `'Arial'` | Font family for text sampling |
| `dotSize` | `number` | `1.5` | Radius of each dot (px) |
| `dotSpacing` | `number` | `4` | Gap between dots (px). Lower = denser |
| `letterDotColor` | `string` | `'#ffffff'` | Color of letter-shape dots |
| `bgDotColor` | `string` | `'rgba(255,255,255,0.08)'` | Color of background dots |
| `letterScrollSpeed` | `number` | `0.5` | Horizontal scroll speed for letter dots (px/frame) |
| `bgScrollSpeed` | `number` | `-0.3` | Horizontal scroll speed for background dots (px/frame) |
| `backgroundColor` | `string` | `'#0a0a0f'` | Canvas background color |

### `GhostTextRenderer` (Vanilla)

```ts
new GhostTextRenderer(canvas: HTMLCanvasElement, options: GhostTextOptions)
```

| Method | Description |
|--------|-------------|
| `start()` | Begin the animation loop |
| `stop()` | Pause the animation (last frame stays visible) |
| `updateText(text)` | Change displayed text (re-samples dot field) |
| `updateOptions(opts)` | Update one or more options |
| `resize(w, h)` | Resize canvas and regenerate dots |
| `destroy()` | Stop animation and release resources |
| `running` | (getter) Whether the animation loop is active |

### `<GhostText />` (React)

All `GhostTextOptions` are accepted as props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `600` | Canvas width (px) |
| `height` | `number` | `200` | Canvas height (px) |
| `className` | `string` | — | CSS class on wrapper div |
| `style` | `CSSProperties` | — | Inline styles on wrapper div |
| `ariaLabel` | `string` | `text` value | Screen reader label |

## How It Works

1. **Text is drawn** to an offscreen canvas at the specified font size
2. **Pixel data is sampled** via `getImageData()` — the alpha channel determines which grid positions are "inside" a letter glyph
3. **A dot grid** is generated across the full canvas. Each dot is tagged as a letter dot or background dot
4. **On each animation frame**, letter dots and background dots scroll horizontally in opposite directions, with wrapping. The illusion only resolves while the animation is running

## Performance Notes

- Canvas2D is used deliberately over WebGL — for typical text lengths and dot densities, it's more than fast enough and keeps the bundle tiny
- Dots are batched by color (2 draw passes per frame) to minimize Canvas2D state switches
- The offscreen text sampling only runs when the text or font changes, not every frame
- For extreme density (dotSpacing ≤ 2) on very large canvases, consider throttling or reducing canvas dimensions

## Development

```bash
# Install dependencies
npm install

# Run the demo site
cd demo && npm install && npm run dev

# Build the library
npm run build

# Type check
npx tsc --noEmit
```

## Publishing

```bash
# Bump version
npm version patch  # or minor, major

# Tag and push
git push --follow-tags

# GitHub Actions will build and publish to npm automatically
```

## License

MIT © pushkar
