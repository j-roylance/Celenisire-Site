import { useState } from 'react';
import { api, ApiError } from '../api/client';
import { Section } from '../components/Section';
import { FormInput } from '../components/FormInput';
import { FormTextarea } from '../components/FormTextarea';
import { FormSelect } from '../components/FormSelect';
import { Button } from '../components/Button';

const interestOptions = [
  { value: 'donor', label: 'Donor' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'general', label: 'General Supporter' },
  { value: 'media', label: 'Media' },
];

export function JoinPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interestArea, setInterestArea] = useState('general');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setErrorMsg('You must consent to receive updates.');
      return;
    }
    try {
      await api.subscribe({
        name,
        email,
        interestArea,
        message: message || undefined,
        consent: true,
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof ApiError ? err.message : 'Failed to subscribe');
    }
  }

  return (
    <Section>
      <h1 className="section-title">Join the Email List</h1>
      <p className="section-subtitle">
        Stay connected with our research progress, milestones, and opportunities to help.
      </p>

      {status === 'success' ? (
        <div className="form-success">Thank you for subscribing! We&apos;ll be in touch.</div>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
          <FormInput label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <FormInput label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormSelect
            label="Interest Area"
            name="interestArea"
            value={interestArea}
            onChange={(e) => setInterestArea(e.target.value)}
            options={interestOptions}
          />
          <FormTextarea label="Message (optional)" name="message" value={message} onChange={(e) => setMessage(e.target.value)} />
          <label className="form-checkbox">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I consent to receive updates from Celenisire: Humankind Resilience Initiative.</span>
          </label>
          {errorMsg && <p className="form-error mt-2">{errorMsg}</p>}
          <Button type="submit" className="mt-3">Subscribe</Button>
        </form>
      )}
    </Section>
  );
}
