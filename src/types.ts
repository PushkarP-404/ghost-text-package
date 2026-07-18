/**
 * Configuration options for the GhostText renderer.
 *
 * Controls text appearance, dot-field density, scroll animation speeds,
 * and color scheme. All dots use the same color — the ghost illusion is
 * created purely through opposing-direction motion, not color.
 */
export interface GhostTextOptions {
  /** The text string to render as a ghost dot field. */
  text: string;

  /**
   * Font size in pixels used to sample the text shape.
   * Larger values produce more detailed dot representations.
   * @default 80
   */
  fontSize?: number;

  /**
   * Font family used to sample the text shape.
   * Must be a font available in the browser.
   * @default 'Arial'
   */
  fontFamily?: string;

  /**
   * Radius of each dot in pixels.
   * @default 1.5
   */
  dotSize?: number;

  /**
   * Spacing between dots in pixels (lower = denser).
   * Values 2-8 work best. 2 is very dense, 8 is sparse.
   * @default 4
   */
  dotSpacing?: number;

  /**
   * Color of all dots (both letter and background).
   * All dots are identical — the illusion is purely motion-based.
   * Any valid CSS color string.
   * @default '#ffffff'
   */
  dotColor?: string;

  /**
   * Scroll speed for letter dots in pixels per frame.
   * Positive = right/down, negative = left/up.
   * @default 0.5
   */
  letterScrollSpeed?: number;

  /**
   * Scroll speed for background dots in pixels per frame.
   * Positive = right/down, negative = left/up. Set opposite to letterScrollSpeed
   * for the classic ghost effect.
   * @default -0.3
   */
  bgScrollSpeed?: number;

  /**
   * Direction of the scrolling animation.
   * 'horizontal' moves dots left/right. 'vertical' moves dots up/down.
   * @default 'horizontal'
   */
  scrollDirection?: 'horizontal' | 'vertical';

  /**
   * Canvas background fill color.
   * Any valid CSS color string.
   * @default '#0a0a0f'
   */
  backgroundColor?: string;
}

/**
 * Resolved options with all defaults applied.
 */
export type ResolvedGhostTextOptions = Required<GhostTextOptions>;

/**
 * Default option values.
 */
export const DEFAULT_OPTIONS: Omit<ResolvedGhostTextOptions, 'text'> = {
  fontSize: 80,
  fontFamily: 'Arial',
  dotSize: 1.5,
  dotSpacing: 4,
  dotColor: '#ffffff',
  letterScrollSpeed: 0.5,
  bgScrollSpeed: -0.3,
  scrollDirection: 'horizontal',
  backgroundColor: '#0a0a0f',
};
