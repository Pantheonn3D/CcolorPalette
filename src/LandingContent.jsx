import './LandingContent.css';

function LandingContent({ onBackToGenerator }) {
  return (
    <section className="landing-content" aria-label="About CColorPalette">
      {/* Hero Section */}
      <div className="landing-hero">
        <h1>Free Accessible Color Palette Generator</h1>
        <p className="landing-subtitle">
          Create beautiful, accessible color schemes with WCAG contrast
          checking, color blindness simulation, and one-click export to CSS,
          Tailwind, and more.
        </p>
      </div>

      {/* Visual Guide Section */}
      <div className="landing-guide">
        <h2>How It Works</h2>

        <div className="guide-step">
          <div className="guide-step-content">
            <div className="guide-step-number">1</div>
            <h3>Generate & Customize</h3>
            <p>
              Press <kbd>Space</kbd> to generate a new palette. Choose your
              harmony mode (monochromatic, analogous, complementary, etc.) and
              set the mood to get exactly the colors you need.
            </p>
          </div>
          <div className="guide-step-image">
            <img
              src="/guide-method.png"
              alt="Method panel showing harmony and mood options"
              loading="lazy"
            />
          </div>
        </div>

        <div className="guide-step reverse">
          <div className="guide-step-content">
            <div className="guide-step-number">2</div>
            <h3>Check Accessibility</h3>
            <p>
              Instantly see WCAG contrast ratios for every color. Simulate how
              your palette looks to people with color blindness—protanopia,
              deuteranopia, tritanopia, and more.
            </p>
          </div>
          <div className="guide-step-image">
            <img
              src="/guide-accessibility.png"
              alt="Accessibility panel showing contrast ratios and color blindness simulation"
              loading="lazy"
            />
          </div>
        </div>

        <div className="guide-step">
          <div className="guide-step-content">
            <div className="guide-step-number">3</div>
            <h3>Fine-tune Your Palette</h3>
            <p>
              Lock colors you love, add new colors between existing ones, and
              drag to reorder. Every action is undoable with <kbd>Ctrl</kbd>+
              <kbd>Z</kbd>.
            </p>
          </div>
          <div className="guide-step-image">
            <img
              src="/guide-add-color.png"
              alt="Adding a new color between existing colors"
              loading="lazy"
            />
          </div>
        </div>

        <div className="guide-step reverse">
          <div className="guide-step-content">
            <div className="guide-step-number">4</div>
            <h3>Export Anywhere</h3>
            <p>
              One-click export to CSS variables, Tailwind config, SCSS, JSON
              with full metadata, or download as PNG/SVG. Share your palette
              with a URL that preserves all settings.
            </p>
          </div>
          <div className="guide-step-image">
            <img
              src="/guide-panels.png"
              alt="Export panel with multiple format options"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="landing-features">
        <article className="landing-feature">
          <h2>Color Harmony Modes</h2>
          <p>
            Generate palettes using proven color theory: monochromatic for
            subtle elegance, analogous for natural flow, complementary for bold
            contrast, triadic for vibrant energy, and more.
          </p>
        </article>

        <article className="landing-feature">
          <h2>WCAG Accessibility</h2>
          <p>
            Built-in contrast checking shows AA and AAA compliance for every
            color. Set minimum contrast requirements to ensure your palette
            meets accessibility standards automatically.
          </p>
        </article>

        <article className="landing-feature">
          <h2>Color Blindness Testing</h2>
          <p>
            Preview your palette through protanopia, deuteranopia, tritanopia,
            and achromatopsia filters. Design inclusive color schemes that work
            for everyone, not just those with typical color vision.
          </p>
        </article>

        <article className="landing-feature">
          <h2>Developer-Ready Export</h2>
          <p>
            Export directly to CSS variables, Tailwind config, SCSS, or JSON
            with HSL values and contrast metadata. Download PNG/SVG for design
            tools. Choose semantic or numbered naming schemes.
          </p>
        </article>

        <article className="landing-feature">
          <h2>Shareable URLs</h2>
          <p>
            Every palette gets a unique URL that preserves colors, harmony mode,
            mood settings, and accessibility preferences. Share your exact
            configuration with teammates.
          </p>
        </article>

        <article className="landing-feature">
          <h2>Free Forever</h2>
          <p>
            No account required. No limits on palettes. No watermarks on
            exports. A powerful, free alternative to paid color tools, built for
            designers and developers who care about accessibility.
          </p>
        </article>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="landing-shortcuts">
        <h2>Keyboard Shortcuts</h2>
        <div className="shortcuts-grid">
          <div className="shortcut">
            <kbd>Space</kbd>
            <span>Generate new palette</span>
          </div>
          <div className="shortcut">
            <kbd>Ctrl</kbd> + <kbd>Z</kbd>
            <span>Undo</span>
          </div>
          <div className="shortcut">
            <kbd>Ctrl</kbd> + <kbd>Y</kbd>
            <span>Redo</span>
          </div>
          <div className="shortcut">
            <kbd>Esc</kbd>
            <span>Close all panels</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="landing-cta">
        <p>
          Press <kbd>Space</kbd> to generate your first accessible color
          palette.
          <br />
          <span className="cta-subtext">
            Free, instant, no signup required.
          </span>
        </p>
        <button className="cta-button" onClick={onBackToGenerator}>
          Start Generating →
        </button>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 CColorPalette</p>
        <p className="footer-tagline">
          Made for designers and developers who care about accessibility.
        </p>
      </footer>

      {/* Hidden SEO content */}
      <div className="sr-only">
        <h2>Color Tools and Resources</h2>
        <p>
          CColorPalette is a JavaScript color tool that combines color
          generation, accessibility checking, and export utilities. Compare to
          tools like Coolors, Adobe Color, Paletton, ColorHunt, and Khroma.
        </p>
      </div>
    </section>
  );
}

export default LandingContent;
