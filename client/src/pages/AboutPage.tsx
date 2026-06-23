import { Section } from '../components/Section';

const values = [
  { title: 'Relief of Suffering', desc: 'Every decision is measured against whether it reduces human suffering.' },
  { title: 'Honesty', desc: 'We say what we know, what we don\'t, and what we\'re still figuring out.' },
  { title: 'Scientific Rigor', desc: 'Claims require evidence. Research requires validation.' },
  { title: 'Transparency', desc: 'We commit to publishing progress, setbacks, and financial updates.' },
  { title: 'Stewardship', desc: 'Resources entrusted to us — money, time, talent — are handled with care.' },
  { title: 'Service', desc: 'Technology exists to serve people, not the other way around.' },
  { title: 'Courage', desc: 'We pursue ambitious goals because the stakes — human lives — demand it.' },
];

export function AboutPage() {
  return (
    <>
      <Section>
        <h1 className="section-title">About Celenisire</h1>
        <p className="section-subtitle">
          An early-stage charity initiative with a long-term vision for human resilience.
        </p>
        <div className="prose">
          <h2>Founder: Jens Roylance</h2>
          <p>
            Celenisire: Humankind Resilience Initiative was founded by Jens Roylance out of a conviction that
            engineering and research can do more to prevent and relieve human suffering. The initiative began as
            personal, self-funded research into technologies that could help people survive when systems fail —
            when supply chains break, when disaster strikes, when conflict displaces communities from the
            necessities of life.
          </p>
          <p>
            This is not a venture built on hype. It is a sincere, early-stage effort to channel technical skill
            toward humanitarian ends — with transparency about what exists today versus what we hope to build
            tomorrow.
          </p>

          <h2>Why We Exist</h2>
          <p>
            Preventable suffering persists on a massive scale. Celenisire exists to research and develop tools —
            both near-term practical products and long-term ambitious systems like Celenirises — that could help
            people access the bare necessities of life when the world breaks down.
          </p>
        </div>
      </Section>

      <Section>
        <h2 className="section-title">Our Values</h2>
        <div className="values-grid">
          {values.map((v) => (
            <div key={v.title} className="value-card">
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
        <div className="disclaimer">
          Celenisire: Humankind Resilience Initiative is currently an early-stage, self-funded initiative and has
          not yet completed legal nonprofit formation. Contributions at this stage may not be tax-deductible.
        </div>
      </Section>
    </>
  );
}
