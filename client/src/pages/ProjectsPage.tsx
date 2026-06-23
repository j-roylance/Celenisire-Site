import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Section } from '../components/Section';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';

export function ProjectsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', 'public'],
    queryFn: () => api.getPublicProjects(),
  });

  return (
    <Section>
      <h1 className="section-title">Projects</h1>
      <p className="section-subtitle">
        Current and planned research initiatives at Celenisire.
      </p>

      {isLoading && <p>Loading projects...</p>}
      {error && <p className="form-error">Failed to load projects.</p>}

      <div className="grid-2">
        {data?.projects.map((project) => (
          <Card key={project.id} glow>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <h3 className="card-title">{project.title}</h3>
              <StatusBadge status={project.status} />
            </div>
            <p className="card-body">{project.description}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--pastel-lime-dark)', marginTop: '0.75rem' }}>
              Impact: {project.impactArea}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
