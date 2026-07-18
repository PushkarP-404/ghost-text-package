import { useState, useCallback } from 'react';
import { GhostText } from '@pushkar/ghost-text';

const PRESETS = [
  'GHOST',
  'HELLO WORLD',
  'PHANTOM',
  'SPECTRAL',
  'ETHEREAL',
  'WRAITH',
];

function App() {
  const [text, setText] = useState('GHOST');
  const [dotSpacing, setDotSpacing] = useState(4);
  const [dotSize, setDotSize] = useState(1.5);
  const [letterSpeed, setLetterSpeed] = useState(0.5);
  const [bgSpeed, setBgSpeed] = useState(-0.3);
  const [dotColor, setDotColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#0a0a0f');
  const [fontSize, setFontSize] = useState(80);
  const [canvasWidth] = useState(800);
  const [canvasHeight] = useState(220);
  const [showCode, setShowCode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  const handlePreset = useCallback((preset: string) => {
    setText(preset);
  }, []);

  const codeSnippet = `import { GhostText } from '@pushkar/ghost-text';

<GhostText
  text="${text}"
  width={${canvasWidth}}
  height={${canvasHeight}}
  fontSize={${fontSize}}
  dotSpacing={${dotSpacing}}
  dotSize={${dotSize}}
  letterScrollSpeed={${letterSpeed}}
  bgScrollSpeed={${bgSpeed}}
  scrollDirection="${scrollDirection}"
  dotColor="${dotColor}"
  backgroundColor="${bgColor}"
/>`;

  return (
    <div className="app">
      {/* Background glow elements */}
      <div className="bg-glow bg-glow--1" />
      <div className="bg-glow bg-glow--2" />

      {/* Header */}
      <header className="header">
        <div className="header__badge">Canvas2D</div>
        <h1 className="header__title">
          <span className="header__title-ghost">Ghost</span>Text
        </h1>
        <p className="header__subtitle">
          Animated dot-field text rendering. Two identical dot grids scroll in
          opposing directions — text emerges purely from motion contrast.
          Pause the animation and the text vanishes.
        </p>
        <div className="header__install">
          <code>npm install @pushkar/ghost-text</code>
        </div>
      </header>

      {/* Main demo canvas */}
      <section className="demo">
        <div className="demo__canvas-wrap">
          <GhostText
            text={text}
            width={canvasWidth}
            height={canvasHeight}
            fontSize={fontSize}
            dotSpacing={dotSpacing}
            dotSize={dotSize}
            letterScrollSpeed={letterSpeed}
            bgScrollSpeed={bgSpeed}
            scrollDirection={scrollDirection}
            dotColor={dotColor}
            backgroundColor={bgColor}
            paused={paused}
          />
          <button
            className={`pause-btn ${paused ? 'pause-btn--paused' : ''}`}
            onClick={() => setPaused(!paused)}
            aria-label={paused ? 'Resume animation' : 'Pause animation'}
          >
            <span className="pause-btn__icon">{paused ? '▶' : '⏸'}</span>
            <span className="pause-btn__label">{paused ? 'Play' : 'Pause'}</span>
          </button>
          {paused && (
            <div className="pause-overlay">
              <span className="pause-overlay__text">Text is invisible — only motion reveals it</span>
            </div>
          )}
        </div>
      </section>

      {/* Controls panel */}
      <section className="controls">
        <div className="controls__panel">
          <h2 className="controls__title">Configure</h2>

          {/* Text input */}
          <div className="control-group">
            <label className="control-label" htmlFor="text-input">Text</label>
            <input
              id="text-input"
              className="control-input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              maxLength={20}
              placeholder="Enter text..."
            />
          </div>

          {/* Presets */}
          <div className="control-group">
            <label className="control-label">Presets</label>
            <div className="presets">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  className={`preset-btn ${p === text ? 'preset-btn--active' : ''}`}
                  onClick={() => handlePreset(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Direction toggle */}
          <div className="control-group">
            <label className="control-label">Direction</label>
            <div className="presets">
              <button
                className={`preset-btn ${scrollDirection === 'horizontal' ? 'preset-btn--active' : ''}`}
                onClick={() => setScrollDirection('horizontal')}
              >
                Horizontal
              </button>
              <button
                className={`preset-btn ${scrollDirection === 'vertical' ? 'preset-btn--active' : ''}`}
                onClick={() => setScrollDirection('vertical')}
              >
                Vertical
              </button>
            </div>
          </div>

          {/* Sliders row */}
          <div className="controls__grid">
            <div className="control-group">
              <label className="control-label" htmlFor="font-size">
                Font Size <span className="control-value">{fontSize}px</span>
              </label>
              <input
                id="font-size"
                className="control-slider"
                type="range"
                min={30}
                max={160}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label className="control-label" htmlFor="dot-spacing">
                Dot Spacing <span className="control-value">{dotSpacing}px</span>
              </label>
              <input
                id="dot-spacing"
                className="control-slider"
                type="range"
                min={2}
                max={10}
                step={1}
                value={dotSpacing}
                onChange={(e) => setDotSpacing(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label className="control-label" htmlFor="dot-size">
                Dot Size <span className="control-value">{dotSize}px</span>
              </label>
              <input
                id="dot-size"
                className="control-slider"
                type="range"
                min={0.5}
                max={5}
                step={0.25}
                value={dotSize}
                onChange={(e) => setDotSize(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label className="control-label" htmlFor="letter-speed">
                Letter Speed <span className="control-value">{letterSpeed}</span>
              </label>
              <input
                id="letter-speed"
                className="control-slider"
                type="range"
                min={-2}
                max={2}
                step={0.1}
                value={letterSpeed}
                onChange={(e) => setLetterSpeed(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label className="control-label" htmlFor="bg-speed">
                BG Speed <span className="control-value">{bgSpeed}</span>
              </label>
              <input
                id="bg-speed"
                className="control-slider"
                type="range"
                min={-2}
                max={2}
                step={0.1}
                value={bgSpeed}
                onChange={(e) => setBgSpeed(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Colors */}
          <div className="controls__colors">
            <div className="control-group control-group--color">
              <label className="control-label" htmlFor="dot-color">Dot Color</label>
              <div className="color-input-wrap">
                <input
                  id="dot-color"
                  className="control-color"
                  type="color"
                  value={dotColor}
                  onChange={(e) => setDotColor(e.target.value)}
                />
                <span className="color-hex">{dotColor}</span>
              </div>
            </div>

            <div className="control-group control-group--color">
              <label className="control-label" htmlFor="bg-color">Background</label>
              <div className="color-input-wrap">
                <input
                  id="bg-color"
                  className="control-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
                <span className="color-hex">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Code snippet */}
        <div className="controls__panel controls__panel--code">
          <button
            className="code-toggle"
            onClick={() => setShowCode(!showCode)}
          >
            <span className="code-toggle__icon">{showCode ? '▼' : '▶'}</span>
            {showCode ? 'Hide' : 'Show'} React Code
          </button>
          {showCode && (
            <pre className="code-block">
              <code>{codeSnippet}</code>
            </pre>
          )}
        </div>
      </section>

      {/* Warning banner */}
      <section className="warning">
        <div className="warning__content">
          <span className="warning__icon">⚠️</span>
          <div>
            <strong>This is not a font.</strong> Ghost Text is a per-frame animated Canvas2D illusion.
            All dots are identical — the text is invisible in any single frame and only
            emerges through the motion contrast between two opposing dot layers.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          <a href="https://github.com/pushkar/ghost-text-package" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {' · '}
          <a href="https://www.npmjs.com/package/@pushkar/ghost-text" target="_blank" rel="noopener noreferrer">
            npm
          </a>
          {' · '}
          MIT License
        </p>
      </footer>
    </div>
  );
}

export default App;
