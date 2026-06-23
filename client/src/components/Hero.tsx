interface HeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: string;
  actions?: React.ReactNode;
}

export function Hero({ eyebrow, title, subtitle, actions }: HeroProps) {
  return (
    <section className="hero landing-section visible">
      <img src="/logo.svg" alt="" className="hero-watermark" aria-hidden="true" />
      <div className="container">
        <div className="hero-content">
          {eyebrow && <p className="hero-eyebrow">{eyebrow}</p>}
          <h1 className="hero-title">{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
          {actions && <div className="hero-actions">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
