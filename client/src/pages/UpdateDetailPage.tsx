import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Button } from '../components/Button';

export function UpdateDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['updates', 'public', slug],
    queryFn: () => api.getPublicUpdate(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <Section><p>Loading...</p></Section>;
  if (error || !data) return <Section><p className="form-error">Update not found.</p></Section>;

  const { update } = data;

  return (
    <Section>
      <Button to="/updates" variant="ghost" size="sm" className="mb-4">← Back to Updates</Button>
      <article className="prose">
        <h1>{update.title}</h1>
        <div className="update-meta mb-4">
          {update.author?.name && <span>{update.author.name} · </span>}
          {update.publishedAt && (
            <time dateTime={update.publishedAt}>
              {new Date(update.publishedAt).toLocaleDateString()}
            </time>
          )}
        </div>
        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-light)' }}>{update.body}</div>
      </article>
    </Section>
  );
}
