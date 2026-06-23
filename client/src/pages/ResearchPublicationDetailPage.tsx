import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Button } from '../components/Button';

export function ResearchPublicationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['research-publications', 'public', slug],
    queryFn: () => api.getPublicResearchPublication(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <Section><p>Loading...</p></Section>;
  if (error || !data) return <Section><p className="form-error">Publication not found.</p></Section>;

  const { publication } = data;

  return (
    <Section>
      <Button to="/research" variant="ghost" size="sm" className="mb-4">← Back to Research</Button>
      <article className="prose">
        <h1>{publication.title}</h1>
        {publication.authors && (
          <p style={{ color: 'var(--pastel-lime-dark)', fontWeight: 500 }}>{publication.authors}</p>
        )}
        <div className="update-meta mb-4">
          {publication.author?.name && <span>{publication.author.name} · </span>}
          {publication.publishedAt && (
            <time dateTime={publication.publishedAt}>
              Published {new Date(publication.publishedAt).toLocaleDateString()}
            </time>
          )}
        </div>
        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-light)' }}>{publication.abstract}</div>
        {publication.fileUrl && (
          <div className="mt-4">
            <a
              href={publication.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              View / Download PDF{publication.fileName ? ` (${publication.fileName})` : ''}
            </a>
          </div>
        )}
      </article>
    </Section>
  );
}
