import { PrismaClient, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

const projects = [
  {
    title: 'Celenirise Research',
    slug: 'celenirise-research',
    status: ProjectStatus.researching,
    impactArea: 'Survival Technology',
    description:
      'Core research into compact mini-factory systems that could produce necessities from waste and air. This is our long-term ambitious research direction.',
    isPublic: true,
  },
  {
    title: 'Humanitarian Product Development',
    slug: 'humanitarian-product-development',
    status: ProjectStatus.active,
    impactArea: 'Humanitarian Aid',
    description:
      'Developing practical products and tools that can reduce suffering in the near term while we pursue longer-term research goals.',
    isPublic: true,
  },
  {
    title: 'Disaster Resilience Research',
    slug: 'disaster-resilience-research',
    status: ProjectStatus.researching,
    impactArea: 'Disaster Preparedness',
    description:
      'Studying how decentralized production systems could improve resilience during disasters, supply chain failures, and humanitarian crises.',
    isPublic: true,
  },
  {
    title: 'Open Research Notes',
    slug: 'open-research-notes',
    status: ProjectStatus.concept,
    impactArea: 'Transparency',
    description:
      'Building a system for publishing open research notes and progress updates so supporters can follow our work with full transparency.',
    isPublic: true,
  },
  {
    title: 'Suffering Reduction Tools',
    slug: 'suffering-reduction-tools',
    status: ProjectStatus.prototyping,
    impactArea: 'Direct Impact',
    description:
      'Identifying and prototyping tools that can measurably reduce human suffering today, independent of the Celenirise long-term vision.',
    isPublic: true,
  },
];

async function main() {
  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }

  console.log('Seeded placeholder projects.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
