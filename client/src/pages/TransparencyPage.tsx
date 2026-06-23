import { Section } from '../components/Section';
import { Card } from '../components/Card';

export function TransparencyPage() {
  return (
    <>
      <Section>
        <h1 className="section-title">Transparency</h1>
        <p className="section-subtitle">
          We believe trust is earned through openness. Here is where we stand today.
        </p>
      </Section>

      <Section>
        <div className="grid-2">
          <Card glow>
            <h3 className="card-title">Legal Status</h3>
            <p className="card-body">
              Celenisire: Humankind Resilience Initiative is an early-stage, self-funded charity initiative. We
              have not yet completed legal nonprofit formation. We are working toward formal 501(c)(3) status but
              cannot claim it today.
            </p>
          </Card>
          <Card glow>
            <h3 className="card-title">Funding Status</h3>
            <p className="card-body">
              Current work is primarily self-funded by the founder. We accept contribution pledges to support
              research, prototyping, operations, and legal formation. Contributions may not be tax-deductible at
              this stage.
            </p>
          </Card>
          <Card glow>
            <h3 className="card-title">Research Progress</h3>
            <p className="card-body">
              We are in the early research phase. The Celenirise concept is an ambitious long-term direction — not
              a finished product. We publish updates on our progress, setbacks, and learnings through our Updates
              page.
            </p>
          </Card>
          <Card glow>
            <h3 className="card-title">Public Roadmap</h3>
            <p className="card-body">
              Our roadmap includes: completing foundational research, building early prototypes, pursuing legal
              nonprofit formation, establishing public financial reporting, and developing near-term humanitarian
              tools alongside long-term Celenirise research.
            </p>
          </Card>
        </div>
      </Section>

      <Section>
        <h2 className="section-title">Financial Transparency Commitment</h2>
        <div className="prose">
          <p>
            As we grow, we commit to publishing regular financial updates showing how funds are used. Internal
            accounting systems are already in place to track income and expenses by category. Public financial
            reports will be published once we have meaningful activity to report.
          </p>
          <p>
            We will never overstate our capabilities or understate our limitations. Every claim about our work will
            be backed by evidence or clearly labeled as aspiration.
          </p>
        </div>
        <div className="disclaimer">
          Celenisire: Humankind Resilience Initiative has not yet completed legal nonprofit formation.
          Contributions may not be tax-deductible.
        </div>
      </Section>
    </>
  );
}
