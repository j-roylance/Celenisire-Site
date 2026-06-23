import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Hero } from '../components/Hero';
import { Section } from '../components/Section';
import { EmailSignupCompact } from '../components/EmailSignupCompact';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function LandingPage() {
  useScrollReveal();

  return (
    <>
      <Hero
        eyebrow="Celenisire: Humankind Resilience Initiative"
        title={
          <>
            Building technology to prevent catastrophe and{' '}
            <span className="accent-text">relieve human suffering</span>.
          </>
        }
        subtitle="Celenisire: Humankind Resilience Initiative is an early-stage charity project researching tools that could help people survive war, famine, disaster, and fragile supply chains — beginning with the long-term vision of Celenirises: compact systems for producing necessities of life when the world breaks down."
        actions={
          <>
            <Button to="/donate" size="lg">Support the Mission</Button>
            <Button to="/life-packs" variant="secondary" size="lg">Read the Vision</Button>
            <Button to="/join" variant="secondary" size="lg">Join the Email List</Button>
          </>
        }
      />

      <section className="section-band landing-section">
        <div className="container">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-subtitle">
            We research and develop technologies to prevent and relieve suffering — with humility, rigor, and transparency.
          </p>
          <div className="cards-grid">
            <Card glow>
              <h3 className="card-title">Research & Development</h3>
              <p className="card-body">
                We research and develop technologies to prevent and relieve human suffering through engineering,
                science, and practical humanitarian work.
              </p>
            </Card>
            <Card glow>
              <h3 className="card-title">The Celenirise Vision</h3>
              <p className="card-body">
                Our long-term focus is Celenirises: compact, backpack-sized mini-factory systems intended to produce
                survival necessities — an ambitious research direction, not an available product.
              </p>
            </Card>
            <Card glow>
              <h3 className="card-title">Near-Term Impact</h3>
              <p className="card-body">
                Our near-term focus is practical products, research, and tools that reduce suffering and improve the
                world today.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Section className="section-cream landing-section">
        <h2 className="section-title">The Problem</h2>
        <p className="section-subtitle">
          Human suffering from preventable causes remains far too common.
        </p>
        <div className="prose">
          <p>
            War displaces millions. Famine follows conflict and climate disruption. Natural disasters destroy
            infrastructure overnight. Corruption and fragile supply chains leave communities cut off from bare
            necessities. Much of this suffering is preventable — yet the tools to respond are too centralized,
            too expensive, or too slow.
          </p>
          <p>
            We believe engineering and research can help. Not with empty promises, but with rigorous work,
            transparent progress, and tools built in service of humanity.
          </p>
        </div>
      </Section>

      <Section id="celenirise" className="landing-section">
        <h2 className="section-title">The Celenirise Vision</h2>
        <p className="section-subtitle">
          An ambitious long-term research goal — not a finished product.
        </p>
        <div className="grid-2">
          <div className="prose">
            <p>
              A Celenirise is a conceptual backpack-sized mini-factory system designed to produce necessities for
              human survival — especially food and water — using waste and air as input sources.
            </p>
            <p>
              The intended use cases include disaster zones, war zones, famine conditions, remote communities, and
              emergency preparedness. We are researching technologies that <em>could</em> enable this vision.
            </p>
          </div>
          <Card className="status-card">
            <span className="badge badge-warning">Research Goal</span>
            <h3 className="card-title mt-2">Not an available product</h3>
            <p className="card-body">
              Celenirises represent our long-term ambitious research direction. We are committed to transparent
              progress updates and rigorous validation at every stage.
            </p>
          </Card>
        </div>
      </Section>

      <section className="section-cream landing-section">
        <div className="container">
          <h2 className="section-title">Current Stage</h2>
          <div className="status-card" style={{ maxWidth: 720, margin: '0 auto' }}>
            <span className="badge badge-lime">Early-Stage Initiative</span>
            <ul>
              <li>Personal research and early development, self-funded</li>
              <li>Not yet legally formed as a nonprofit organization</li>
              <li>Building public roadmap and accountability systems</li>
              <li>Looking for supporters, collaborators, researchers, and donors</li>
              <li>Contributions may not be tax-deductible at this stage</li>
            </ul>
          </div>
        </div>
      </section>

      <Section className="landing-section">
        <h2 className="section-title">How You Can Help</h2>
        <div className="cards-grid">
          <Card glow>
            <h3 className="card-title">Donate</h3>
            <p className="card-body">Help fund our work — research materials, prototyping, and operations.</p>
            <Button to="/donate" className="mt-2" size="sm">Support the Mission</Button>
          </Card>
          <Card glow>
            <h3 className="card-title">Join the Email List</h3>
            <p className="card-body">Stay updated on research progress, milestones, and ways to contribute.</p>
            <Button to="/join" className="mt-2" size="sm" variant="secondary">Subscribe</Button>
          </Card>
          <Card glow>
            <h3 className="card-title">Volunteer / Collaborate</h3>
            <p className="card-body">Researchers, engineers, and humanitarian workers — we want to hear from you.</p>
            <Button to="/contact" className="mt-2" size="sm" variant="secondary">Get in Touch</Button>
          </Card>
          <Card glow>
            <h3 className="card-title">Share the Mission</h3>
            <p className="card-body">Help others discover this work. Every share expands our reach.</p>
          </Card>
          <Card glow>
            <h3 className="card-title">Follow the Research</h3>
            <p className="card-body">Read our updates and transparency reports as we publish them.</p>
            <Button to="/updates" className="mt-2" size="sm" variant="secondary">View Updates</Button>
          </Card>
        </div>
      </Section>

      <Section className="section-cream landing-section">
        <EmailSignupCompact />
      </Section>

      <Section className="landing-section">
        <div className="cta-section">
          <h2>Help us build technology in service of humanity.</h2>
          <p>
            Every contribution — financial, intellectual, or simply spreading the word — helps us move forward
            with honesty and urgency.
          </p>
          <Button to="/donate" size="lg">Support the Mission</Button>
        </div>
      </Section>
    </>
  );
}
