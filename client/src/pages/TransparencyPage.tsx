import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function TransparencyPage() {
  const { data: reportsData } = useQuery({
    queryKey: ['financial-reports', 'public'],
    queryFn: () => api.getPublicFinancialReports(),
  });
  const { data: pubsData } = useQuery({
    queryKey: ['research-publications', 'public'],
    queryFn: () => api.getPublicResearchPublications(),
  });

  const latestReport = reportsData?.reports[0];
  const latestPublication = pubsData?.publications[0];

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
            reports are available on our dedicated reports page.
          </p>
          <p>
            We will never overstate our capabilities or understate our limitations. Every claim about our work will
            be backed by evidence or clearly labeled as aspiration.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Button to="/financial-reports">View Financial Reports</Button>
          <Button to="/research" variant="secondary">View Research Publications</Button>
        </div>
      </Section>

      {(latestReport || latestPublication) && (
        <Section>
          <h2 className="section-title">Latest Published Documents</h2>
          <div className="grid-2">
            {latestReport && (
              <Card>
                <h3 className="card-title">Latest Financial Report</h3>
                <p className="card-body" style={{ marginBottom: '0.5rem' }}>
                  <strong>{latestReport.title}</strong> — {latestReport.periodLabel}
                </p>
                {latestReport.summary && (
                  <p className="card-body" style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    {latestReport.summary.slice(0, 120)}
                    {latestReport.summary.length > 120 ? '...' : ''}
                  </p>
                )}
                <Link to={`/financial-reports/${latestReport.slug}`} style={{ fontSize: '0.875rem' }}>
                  Read more →
                </Link>
              </Card>
            )}
            {latestPublication && (
              <Card>
                <h3 className="card-title">Latest Research Publication</h3>
                <p className="card-body" style={{ marginBottom: '0.5rem' }}>
                  <strong>{latestPublication.title}</strong>
                </p>
                <p className="card-body" style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  {latestPublication.abstract.slice(0, 120)}
                  {latestPublication.abstract.length > 120 ? '...' : ''}
                </p>
                <Link to={`/research/${latestPublication.slug}`} style={{ fontSize: '0.875rem' }}>
                  Read more →
                </Link>
              </Card>
            )}
          </div>
        </Section>
      )}

      <Section>
        <div className="disclaimer">
          Celenisire: Humankind Resilience Initiative has not yet completed legal nonprofit formation.
          Contributions may not be tax-deductible.
        </div>
      </Section>
    </>
  );
}
