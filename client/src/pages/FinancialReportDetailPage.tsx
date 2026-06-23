import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Button } from '../components/Button';

export function FinancialReportDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['financial-reports', 'public', slug],
    queryFn: () => api.getPublicFinancialReport(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <Section><p>Loading...</p></Section>;
  if (error || !data) return <Section><p className="form-error">Report not found.</p></Section>;

  const { report } = data;

  return (
    <Section>
      <Button to="/financial-reports" variant="ghost" size="sm" className="mb-4">← Back to Reports</Button>
      <article className="prose">
        <p className="hero-eyebrow" style={{ marginBottom: '0.5rem' }}>{report.periodLabel}</p>
        <h1>{report.title}</h1>
        <div className="update-meta mb-4">
          {report.author?.name && <span>{report.author.name} · </span>}
          {report.publishedAt && (
            <time dateTime={report.publishedAt}>
              Published {new Date(report.publishedAt).toLocaleDateString()}
            </time>
          )}
        </div>
        {report.summary && <p>{report.summary}</p>}
        {report.fileUrl && (
          <div className="mt-4">
            <a
              href={report.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              View / Download PDF{report.fileName ? ` (${report.fileName})` : ''}
            </a>
          </div>
        )}
      </article>
      <div className="disclaimer">
        Celenisire: Humankind Resilience Initiative has not yet completed legal nonprofit formation.
        Contributions may not be tax-deductible.
      </div>
    </Section>
  );
}
