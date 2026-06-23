import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Section } from '../components/Section';

export function UpdatesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['updates', 'public'],
    queryFn: () => api.getPublicUpdates(),
  });

  return (
    <Section>
      <h1 className="section-title">Updates</h1>
      <p className="section-subtitle">
        Progress reports, research notes, and news from Celenisire.
      </p>

      {isLoading && <p>Loading updates...</p>}
      {error && <p className="form-error">Failed to load updates.</p>}

      {!isLoading && data?.updates.length === 0 && (
        <p>No updates published yet. Check back soon.</p>
      )}

      {data?.updates.map((update) => (
        <Link key={update.id} to={`/updates/${update.slug}`} className="update-list-item">
          <h3>{update.title}</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>{update.excerpt}</p>
          <div className="update-meta">
            {update.author?.name && <span>{update.author.name} · </span>}
            {update.publishedAt && (
              <time dateTime={update.publishedAt}>
                {new Date(update.publishedAt).toLocaleDateString()}
              </time>
            )}
          </div>
        </Link>
      ))}
    </Section>
  );
}
