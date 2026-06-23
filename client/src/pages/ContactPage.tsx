import { useState } from 'react';
import { api, ApiError } from '../api/client';
import { Section } from '../components/Section';
import { FormInput } from '../components/FormInput';
import { FormTextarea } from '../components/FormTextarea';
import { FormSelect } from '../components/FormSelect';
import { Button } from '../components/Button';

const topicOptions = [
  { value: 'general', label: 'General Message' },
  { value: 'collaboration', label: 'Collaboration Inquiry' },
  { value: 'media', label: 'Media Inquiry' },
];

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('general');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.contact({ name, email, topic, message });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof ApiError ? err.message : 'Failed to send message');
    }
  }

  return (
    <Section>
      <h1 className="section-title">Contact Us</h1>
      <p className="section-subtitle">
        Whether you want to collaborate, cover our work, or just say hello — we&apos;d love to hear from you.
      </p>

      {status === 'success' ? (
        <div className="form-success">Your message has been received. We&apos;ll get back to you soon.</div>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
          <FormInput label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <FormInput label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormSelect
            label="Topic"
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            options={topicOptions}
          />
          <FormTextarea label="Message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} />
          {errorMsg && <p className="form-error">{errorMsg}</p>}
          <Button type="submit" className="mt-3">Send Message</Button>
        </form>
      )}
    </Section>
  );
}
