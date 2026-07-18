import type { GhostTextOptions, ResolvedGhostTextOptions } from '../types';
import { DEFAULT_OPTIONS } from '../types';
import { TextMask } from './dot-field';

/**
 * GhostTextRenderer — the public, framework-agnostic API.
 *
 * The ghost font illusion works by scrolling two identical dot grids
 * in opposing directions through a FIXED text mask:
 *
 * - Grid A (letter layer): dots only drawn WHERE they fall inside the text mask
 * - Grid B (background layer): dots only drawn WHERE they fall outside the text mask
 * - All dots are the same color and size
 * - The text mask never moves
 *
 * Result: in any single frame, you see a uniform field of identical dots.
 * The text is completely invisible when paused. It only emerges through
 * motion contrast — your brain perceives the boundary between the two
 * differently-moving groups of dots as forming letter shapes.
 *
 * Usage:
 * ```ts
 * const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
 * const renderer = new GhostTextRenderer(canvas, { text: 'HELLO' });
 * renderer.start();
 * ```
 */
export class GhostTextRenderer {
  private ctx: CanvasRenderingContext2D;
  private options: ResolvedGhostTextOptions;
  private textMask: TextMask;

  // Randomized dot positions — shared by both layers.
  // Using random positions instead of a uniform grid ensures that
  // paused frames never reveal the text boundary.
  private dotPositions: Float32Array = new Float32Array(0);
  private dotCount: number = 0;

  // Animation state
  private animationId: number | null = null;
  private letterOffset: number = 0;
  private bgOffset: number = 0;
  private isRunning: boolean = false;

  // Bound render method for rAF
  private boundRender: () => void;

  constructor(
    private canvas: HTMLCanvasElement,
    options: GhostTextOptions,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error(
        'GhostTextRenderer: Failed to get 2D rendering context. ' +
        'Ensure the canvas element is valid and not already using WebGL.',
      );
    }

    this.ctx = ctx;
    this.options = this.resolveOptions(options);
    this.textMask = new TextMask(canvas.width, canvas.height);
    this.boundRender = this.render.bind(this);

    // Initial setup
    this.generateDots();
    this.textMask.generate(this.options);
  }

  /**
   * Start the animation loop.
   * Idempotent — calling start() when already running is a no-op.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animationId = requestAnimationFrame(this.boundRender);
  }

  /**
   * Stop the animation loop.
   * The last rendered frame remains visible on the canvas — which shows
   * a uniform dot field with no visible text (the whole point).
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Update the displayed text. Re-generates the text mask.
   */
  updateText(text: string): void {
    this.options.text = text;
    this.textMask.generate(this.options);
  }

  /**
   * Update one or more options without recreating the renderer.
   * If text, fontSize, fontFamily change, the text mask is regenerated.
   * If dotSpacing changes, the grid is recomputed.
   */
  updateOptions(opts: Partial<GhostTextOptions>): void {
    const needsMaskRegen =
      opts.text !== undefined ||
      opts.fontSize !== undefined ||
      opts.fontFamily !== undefined;

    const needsGridRecompute = opts.dotSpacing !== undefined;

    Object.assign(this.options, opts);

    if (needsMaskRegen) {
      this.textMask.generate(this.options);
    }
    if (needsGridRecompute) {
      this.generateDots();
    }
  }

  /**
   * Resize the canvas and regenerate everything.
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.textMask.resize(width, height);
    this.textMask.generate(this.options);
    this.generateDots();
  }

  /**
   * Clean up all resources. Stops animation, nullifies references.
   * The renderer cannot be reused after destroy().
   */
  destroy(): void {
    this.stop();
  }

  /**
   * Check if the animation loop is currently running.
   */
  get running(): boolean {
    return this.isRunning;
  }

  // ---------------------------------------------------------------------------
  // Private methods
  // ---------------------------------------------------------------------------

  /**
   * Merge user options with defaults.
   */
  private resolveOptions(opts: GhostTextOptions): ResolvedGhostTextOptions {
    return { ...DEFAULT_OPTIONS, ...opts } as ResolvedGhostTextOptions;
  }

  /**
   * Generate randomized dot positions.
   *
   * Instead of a uniform grid, we scatter dots randomly across the canvas.
   * Both the letter layer and background layer use the SAME random positions
   * (each shifted by their own scroll offset). This means:
   *
   * - When animated: motion contrast reveals the text (dots inside/outside
   *   the mask move in different directions)
   * - When paused: the two layers produce an arbitrary random scatter.
   *   Since there's no grid structure, there's no visible "seam" at the
   *   text boundary. The text is truly invisible.
   *
   * Positions are stored as a flat Float32Array [x0, y0, x1, y1, ...]
   * for cache-friendly iteration.
   */
  private generateDots(): void {
    const { dotSpacing } = this.options;
    const { width, height } = this.canvas;

    // Target the same dot count as the uniform grid would have
    const cols = Math.ceil(width / dotSpacing);
    const rows = Math.ceil(height / dotSpacing);
    this.dotCount = cols * rows;

    // Allocate flat array: [x0, y0, x1, y1, ...]
    this.dotPositions = new Float32Array(this.dotCount * 2);

    // Seed a simple deterministic PRNG so dot positions are stable
    // across re-renders but still look random.
    // Using a mulberry32-style PRNG seeded from dotSpacing + dimensions.
    let seed = (dotSpacing * 2654435761 + width * 340573321 + height * 119473733) >>> 0;
    const rand = (): number => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    for (let i = 0; i < this.dotCount; i++) {
      this.dotPositions[i * 2] = rand() * width;
      this.dotPositions[i * 2 + 1] = rand() * height;
    }
  }

  /**
   * Core render loop — called once per animation frame.
   *
   * The text mask is FIXED. Two copies of the same random dot scatter
   * scroll horizontally in opposing directions. For each dot:
   *   - Letter layer: shift x by letterOffset, draw only INSIDE the mask
   *   - Background layer: shift x by bgOffset, draw only OUTSIDE the mask
   *
   * All dots are the same color and randomly placed. In any single frozen
   * frame, the combined field is just "random dots everywhere" — no
   * visible text boundary.
   */
  private render(): void {
    if (!this.isRunning) return;

    const {
      letterScrollSpeed,
      bgScrollSpeed,
      dotColor,
      backgroundColor,
      dotSize,
      scrollDirection,
    } = this.options;

    const { width, height } = this.canvas;

    // 1. Update scroll offsets
    this.letterOffset += letterScrollSpeed;
    this.bgOffset += bgScrollSpeed;

    // Wrap offsets to prevent floating-point overflow on long-running animations
    const wrapSize = scrollDirection === 'vertical' ? height : width;
    if (Math.abs(this.letterOffset) > wrapSize) {
      this.letterOffset %= wrapSize;
    }
    if (Math.abs(this.bgOffset) > wrapSize) {
      this.bgOffset %= wrapSize;
    }

    // 2. Clear canvas
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    // 3. Draw dots — all same color, single fillStyle set
    this.ctx.fillStyle = dotColor;

    const twoPi = Math.PI * 2;
    const positions = this.dotPositions;
    const count = this.dotCount;

    const isVertical = scrollDirection === 'vertical';

    // --- Letter layer: scroll by letterOffset, draw only INSIDE mask ---
    for (let i = 0; i < count; i++) {
      const baseX = positions[i * 2];
      const baseY = positions[i * 2 + 1];

      let x = baseX;
      let y = baseY;

      if (isVertical) {
        y = baseY + this.letterOffset;
        y = ((y % height) + height) % height;
      } else {
        x = baseX + this.letterOffset;
        x = ((x % width) + width) % width;
      }

      if (this.textMask.isInside(x, y)) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, dotSize, 0, twoPi);
        this.ctx.fill();
      }
    }

    // --- Background layer: scroll by bgOffset, draw only OUTSIDE mask ---
    for (let i = 0; i < count; i++) {
      const baseX = positions[i * 2];
      const baseY = positions[i * 2 + 1];

      let x = baseX;
      let y = baseY;

      if (isVertical) {
        y = baseY + this.bgOffset;
        y = ((y % height) + height) % height;
      } else {
        x = baseX + this.bgOffset;
        x = ((x % width) + width) % width;
      }

      if (!this.textMask.isInside(x, y)) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, dotSize, 0, twoPi);
        this.ctx.fill();
      }
    }

    // 4. Schedule next frame
    this.animationId = requestAnimationFrame(this.boundRender);
  }
}
