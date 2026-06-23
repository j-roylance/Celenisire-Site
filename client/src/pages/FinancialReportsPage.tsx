import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Section } from '../components/Section';

export function FinancialReportsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['financial-reports', 'public'],
    queryFn: () => api.getPublicFinancialReports(),
  });

  return (
    <Section>
      <h1 className="section-title">Financial Reports</h1>
      <p className="section-subtitle">
        Public financial transparency reports published by Celenisire. These are curated summaries — not raw
        internal ledger exports.
      </p>

      {isLoading && <p>Loading reports...</p>}
      {error && <p className="form-error">Failed to load reports.</p>}

      {!isLoading && data?.reports.length === 0 && (
        <div className="status-card text-center">
          <p>No financial reports have been published yet. We will post reports here as our work grows.</p>
        </div>
      )}

      {data?.reports.map((report) => (
        <Link key={report.id} to={`/financial-reports/${report.slug}`} className="update-list-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h3>{report.title}</h3>
              <p style={{ color: 'var(--pastel-lime-dark)', fontWeight: 500, marginBottom: '0.5rem' }}>
                {report.periodLabel}
              </p>
              {report.summary && (
                <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>{report.summary}</p>
              )}
              <div className="update-meta">
                {report.author?.name && <span>{report.author.name} · </span>}
                {report.publishedAt && (
                  <time dateTime={report.publishedAt}>
                    {new Date(report.publishedAt).toLocaleDateString()}
                  </time>
                )}
              </div>
            </div>
            {report.fileUrl && (
              <span className="badge badge-lime">PDF Available</span>
            )}
          </div>
        </Link>
      ))}
    </Section>
  );
}
