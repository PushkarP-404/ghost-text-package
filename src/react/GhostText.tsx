import { useEffect, useRef, useCallback } from 'react';
import type { GhostTextOptions } from '../types';
import { GhostTextRenderer } from '../core/renderer';

/**
 * Props for the GhostText React component.
 *
 * Extends GhostTextOptions with React-specific props for styling
 * and canvas dimensions.
 */
export interface GhostTextProps extends Partial<Omit<GhostTextOptions, 'text'>> {
  /** The text string to render as a ghost dot field. Required. */
  text: string;

  /** CSS class name applied to the wrapper div. */
  className?: string;

  /** Inline styles applied to the wrapper div. */
  style?: React.CSSProperties;

  /** Canvas width in pixels. @default 600 */
  width?: number;

  /** Canvas height in pixels. @default 200 */
  height?: number;

  /**
   * Whether the animation is paused.
   * When paused, the dot field freezes — revealing a uniform grid
   * where the text is completely invisible.
   * @default false
   */
  paused?: boolean;

  /**
   * Accessible label for screen readers.
   * Defaults to the text prop value.
   */
  ariaLabel?: string;
}

/**
 * GhostText — React component that renders animated ghost-font text.
 *
 * Wraps a <canvas> element with a requestAnimationFrame loop that scrolls
 * two identical dot grids in opposing directions through a fixed text mask.
 * All dots are the same color — the text is only visible through motion.
 *
 * @example
 * ```tsx
 * <GhostText
 *   text="HELLO"
 *   width={800}
 *   height={200}
 *   letterScrollSpeed={0.8}
 *   dotSpacing={3}
 * />
 * ```
 *
 * ⚠️ This is NOT a CSS font. The text is a per-frame animated Canvas2D
 * illusion that is invisible when paused.
 */
export function GhostText({
  text,
  className,
  style,
  width = 600,
  height = 200,
  paused = false,
  ariaLabel,
  fontSize,
  fontFamily,
  dotSize,
  dotSpacing,
  dotColor,
  letterScrollSpeed,
  bgScrollSpeed,
  scrollDirection,
  backgroundColor,
}: GhostTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GhostTextRenderer | null>(null);

  // Collect the animation options into a stable reference
  const getOptions = useCallback(
    (): Partial<GhostTextOptions> => {
      const opts: Partial<GhostTextOptions> = {};
      if (fontSize !== undefined) opts.fontSize = fontSize;
      if (fontFamily !== undefined) opts.fontFamily = fontFamily;
      if (dotSize !== undefined) opts.dotSize = dotSize;
      if (dotSpacing !== undefined) opts.dotSpacing = dotSpacing;
      if (dotColor !== undefined) opts.dotColor = dotColor;
      if (letterScrollSpeed !== undefined) opts.letterScrollSpeed = letterScrollSpeed;
      if (bgScrollSpeed !== undefined) opts.bgScrollSpeed = bgScrollSpeed;
      if (scrollDirection !== undefined) opts.scrollDirection = scrollDirection;
      if (backgroundColor !== undefined) opts.backgroundColor = backgroundColor;
      return opts;
    },
    [
      fontSize,
      fontFamily,
      dotSize,
      dotSpacing,
      dotColor,
      letterScrollSpeed,
      bgScrollSpeed,
      scrollDirection,
      backgroundColor,
    ],
  );

  // Initialize renderer on mount, destroy on unmount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const renderer = new GhostTextRenderer(canvas, {
      text,
      ...getOptions(),
    });

    rendererRef.current = renderer;
    renderer.start();

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
    // We deliberately only run this on mount/unmount.
    // Text and option changes are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update text when it changes
  useEffect(() => {
    const renderer = rendererRef.current;
    if (renderer) {
      renderer.updateText(text);
    }
  }, [text]);

  // Update options when they change
  useEffect(() => {
    const renderer = rendererRef.current;
    if (renderer) {
      renderer.updateOptions(getOptions());
    }
  }, [getOptions]);

  // Handle pause/resume
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    if (paused) {
      renderer.stop();
    } else {
      renderer.start();
    }
  }, [paused]);

  // Handle resize
  useEffect(() => {
    const renderer = rendererRef.current;
    if (renderer) {
      renderer.resize(width, height);
    }
  }, [width, height]);

  return (
    <div
      className={className}
      style={{
        display: 'inline-block',
        lineHeight: 0,
        ...style,
      }}
      role="img"
      aria-label={ariaLabel || text}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </div>
  );
}
