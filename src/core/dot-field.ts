import type { ResolvedGhostTextOptions } from '../types';

/**
 * TextMask — renders text to an offscreen canvas and exposes per-pixel
 * "inside letter" queries.
 *
 * The mask is FIXED — it never moves. The renderer queries it with
 * scrolled dot positions each frame to determine which dots fall
 * inside the text shape and which fall outside.
 */
export class TextMask {
  private maskData: Uint8ClampedArray | null = null;
  private maskWidth: number = 0;
  private maskHeight: number = 0;

  /**
   * Create a new TextMask.
   * @param canvasWidth - Width of the target canvas in pixels.
   * @param canvasHeight - Height of the target canvas in pixels.
   */
  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
  ) {}

  /**
   * (Re)generate the text mask for the given options.
   * Renders text to an offscreen canvas and stores the pixel data
   * for fast per-pixel queries.
   */
  generate(options: ResolvedGhostTextOptions): void {
    const { text, fontSize, fontFamily } = options;

    const offscreen = document.createElement('canvas');
    offscreen.width = this.canvasWidth;
    offscreen.height = this.canvasHeight;

    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('TextMask: Failed to get 2D context for offscreen canvas');
    }

    // Clear to transparent
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Configure and draw text centered
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, this.canvasWidth / 2, this.canvasHeight / 2);

    // Store the pixel data for fast lookups
    const imageData = ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
    this.maskData = imageData.data;
    this.maskWidth = this.canvasWidth;
    this.maskHeight = this.canvasHeight;
  }

  /**
   * Check if a given (x, y) position falls inside the text shape.
   *
   * Checks the alpha channel of the mask at the given position.
   * Returns true if alpha > 128 (inside a letter glyph).
   *
   * This is called per-dot per-frame by the renderer, so it must be fast.
   * Direct array access with no allocations.
   */
  isInside(x: number, y: number): boolean {
    if (!this.maskData) return false;

    // Floor to nearest pixel
    const px = Math.floor(x);
    const py = Math.floor(y);

    // Bounds check
    if (px < 0 || px >= this.maskWidth || py < 0 || py >= this.maskHeight) {
      return false;
    }

    // Alpha channel is every 4th byte: index = (y * width + x) * 4 + 3
    const index = (py * this.maskWidth + px) * 4 + 3;
    return this.maskData[index] > 128;
  }

  /**
   * Update canvas dimensions. Invalidates the current mask.
   */
  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.maskData = null;
  }
}
