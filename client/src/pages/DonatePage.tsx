import { useState } from 'react';
import { api, ApiError } from '../api/client';
import { Section } from '../components/Section';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { FormTextarea } from '../components/FormTextarea';
import { Button } from '../components/Button';

const tiers = [
  { amount: 5, label: 'Help spread the mission' },
  { amount: 25, label: 'Support research tools' },
  { amount: 100, label: 'Fund prototype materials' },
  { amount: 500, label: 'Sponsor a research sprint' },
];

const priorities = [
  'Research materials and lab supplies',
  'Prototyping equipment and components',
  'Website and operational costs',
  'Legal nonprofit formation',
  'Public education and outreach',
];

export function DonatePage() {
  const [amount, setAmount] = useState<number | ''>(25);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acknowledged) {
      setErrorMsg('You must acknowledge the legal status.');
      return;
    }
    try {
      await api.createPledge({
        name,
        email,
        amount: Number(amount),
        message: message || undefined,
        acknowledgedStatus: true,
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof ApiError ? err.message : 'Failed to submit pledge');
    }
  }

  return (
    <>
      <Section>
        <h1 className="section-title">Support the Mission</h1>
        <p className="section-subtitle">
          Help fund our research, development, and operations. This is not a tax-deductible charitable donation at
          this stage — it is support for an early-stage initiative doing important work.
        </p>

        <div className="grid-2">
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Funding Priorities</h2>
            <Card>
              <ul style={{ listStyle: 'none' }}>
                {priorities.map((p) => (
                  <li key={p} style={{ padding: '0.5rem 0', paddingLeft: '1.25rem', position: 'relative', color: 'var(--text-light)' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--pastel-lime-dark)' }}>→</span>
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div>
            {status === 'success' ? (
              <Card>
                <h3 className="card-title">Thank you for your pledge!</h3>
                <p className="card-body">
                  We&apos;ve recorded your contribution intent. We&apos;ll follow up with next steps for completing
                  your support. No payment has been processed at this time.
                </p>
              </Card>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ marginBottom: '1rem' }}>Choose an Amount</h2>
                <div className="tier-grid">
                  {tiers.map((tier) => (
                    <button
                      key={tier.amount}
                      type="button"
                      className={`tier-btn ${amount === tier.amount ? 'selected' : ''}`}
                      onClick={() => setAmount(tier.amount)}
                    >
                      <span className="amount">${tier.amount}</span>
                      <span className="label">{tier.label}</span>
                    </button>
                  ))}
                </div>

                <FormInput
                  label="Custom Amount ($)"
                  name="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  required
                />
                <FormInput label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                <FormInput label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <FormTextarea label="Message (optional)" name="message" value={message} onChange={(e) => setMessage(e.target.value)} />

                <label className="form-checkbox">
                  <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
                  <span>
                    I understand that Celenisire has not yet completed legal nonprofit formation and that my
                    contribution may not be tax-deductible.
                  </span>
                </label>

                {errorMsg && <p className="form-error mt-2">{errorMsg}</p>}

                <Button type="submit" className="mt-3" size="lg">
                  Submit Pledge
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="disclaimer">
          Celenisire: Humankind Resilience Initiative has not yet completed legal nonprofit formation. Contributions
          may not be tax-deductible. Funds are currently used to support research, development, operations, and
          formation costs. No payment is processed through this form — it records your pledge intent.
        </div>
      </Section>
    </>
  );
}
