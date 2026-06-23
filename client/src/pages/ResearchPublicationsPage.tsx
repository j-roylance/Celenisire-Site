import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Section } from '../components/Section';

export function ResearchPublicationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['research-publications', 'public'],
    queryFn: () => api.getPublicResearchPublications(),
  });

  return (
    <Section>
      <h1 className="section-title">Research Publications</h1>
      <p className="section-subtitle">
        Open research notes, publications, and documents from Celenisire&apos;s research work.
      </p>

      {isLoading && <p>Loading publications...</p>}
      {error && <p className="form-error">Failed to load publications.</p>}

      {!isLoading && data?.publications.length === 0 && (
        <div className="status-card text-center">
          <p>No research publications have been published yet. Check back as we share our work.</p>
        </div>
      )}

      {data?.publications.map((pub) => (
        <Link key={pub.id} to={`/research/${pub.slug}`} className="update-list-item">
          <h3>{pub.title}</h3>
          {pub.authors && (
            <p style={{ color: 'var(--pastel-lime-dark)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {pub.authors}
            </p>
          )}
          <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>
            {pub.abstract.slice(0, 200)}{pub.abstract.length > 200 ? '...' : ''}
          </p>
          <div className="update-meta">
            {pub.author?.name && <span>{pub.author.name} · </span>}
            {pub.publishedAt && (
              <time dateTime={pub.publishedAt}>
                {new Date(pub.publishedAt).toLocaleDateString()}
              </time>
            )}
          </div>
        </Link>
      ))}
    </Section>
  );
}
