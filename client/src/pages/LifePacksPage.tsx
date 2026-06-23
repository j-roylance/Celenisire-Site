import { Section } from '../components/Section';
import { Card } from '../components/Card';

const useCases = [
  { title: 'Disaster Relief', desc: 'When earthquakes, floods, or hurricanes destroy infrastructure, decentralized production could provide essentials while supply chains recover.' },
  { title: 'War & Refugee Crises', desc: 'Conflict zones often lack reliable access to food and water. Portable systems could support displaced populations.' },
  { title: 'Famine', desc: 'When agricultural systems fail, alternative production methods could bridge critical gaps.' },
  { title: 'Remote Communities', desc: 'Communities far from supply networks face chronic access challenges that decentralized tools could address.' },
  { title: 'Emergency Preparedness', desc: 'Households and institutions preparing for disruption need reliable, compact resilience tools.' },
];

const roadmap = [
  { phase: '1', title: 'Research Phase', desc: 'Literature review, feasibility analysis, and initial experiments on core production pathways.' },
  { phase: '2', title: 'Prototype Phase', desc: 'Building and testing early hardware prototypes to validate key assumptions.' },
  { phase: '3', title: 'Validation Phase', desc: 'Independent testing, peer review, and rigorous measurement of outputs and safety.' },
  { phase: '4', title: 'Manufacturing Phase', desc: 'Developing scalable, low-cost manufacturing processes for validated designs.' },
  { phase: '5', title: 'Deployment Phase', desc: 'Field testing in real humanitarian contexts with partner organizations.' },
];

export function LifePacksPage() {
  return (
    <>
      <Section>
        <h1 className="section-title">Celenirises</h1>
        <p className="section-subtitle">
          Compact systems for producing necessities of life — an ambitious research direction.
        </p>
        <div className="prose">
          <h2>What is a Celenirise?</h2>
          <p>
            A Celenirise is a conceptual backpack-sized mini-factory system designed to produce necessities for
            human survival — especially food and water — using waste and air as input fuel sources. The name reflects
            our hope: systems that help life rise even in the hardest conditions.
          </p>
          <p>
            This is not a product you can buy today. It is a long-term research goal that guides our engineering
            direction and inspires our near-term work.
          </p>

          <h2>Why Decentralizing Necessities Matters</h2>
          <p>
            Centralized supply chains are efficient until they break. When they do — through war, disaster, corruption,
            or climate disruption — communities without alternatives suffer most. Decentralized production of bare
            necessities could reduce dependence on fragile systems and improve resilience for the most vulnerable.
          </p>
        </div>
      </Section>

      <Section>
        <h2 className="section-title">Potential Use Cases</h2>
        <div className="grid-2">
          {useCases.map((uc) => (
            <Card key={uc.title} glow>
              <h3 className="card-title">{uc.title}</h3>
              <p className="card-body">{uc.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="section-title">Scientific & Engineering Roadmap</h2>
        <div className="roadmap">
          {roadmap.map((item) => (
            <div key={item.phase} className="roadmap-item">
              <div className="roadmap-phase">{item.phase}</div>
              <div className="roadmap-content">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="disclaimer">
          This is an ambitious research direction, not a finished product. We are committed to transparent progress
          updates and rigorous validation.
        </div>
      </Section>
    </>
  );
}
