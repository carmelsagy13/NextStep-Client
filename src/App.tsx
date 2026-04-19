import { useState, type FormEvent } from 'react';
import FinancialReportUpload from './components/FinancialReportUpload';
import RoadmapCard from './components/RoadmapCard';
import GoalList from './components/GoalList';

const API_URL = 'http://localhost:3000/auth/register';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [responseText, setResponseText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setResponseText('');
    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const rawBody = await response.text();
      let parsedBody: unknown = rawBody;

      try {
        parsedBody = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        // Keep non-JSON responses as plain text for debugging.
      }

      const output = JSON.stringify(
        {
          status: response.status,
          ok: response.ok,
          body: parsedBody,
        },
        null,
        2,
      );

      setResponseText(output);

      if (!response.ok) {
        const serverMessage =
          typeof parsedBody === 'object' &&
          parsedBody !== null &&
          'message' in parsedBody &&
          typeof parsedBody.message === 'string'
            ? parsedBody.message
            : `Request failed with status ${response.status}`;

        setError(serverMessage);
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Request failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#111111', padding: 16 }}>
      <div style={{ maxWidth: 420, margin: '40px auto', padding: 16, border: '1px solid #ddd', borderRadius: 6 }}>
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 28 }}>Auth Test — Register</h1>
        <p style={{ marginTop: 0, marginBottom: 12 }}>
          Temporary backend test: POST {API_URL}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ padding: 8, border: '1px solid #aaa' }}
            />
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{ padding: 8, border: '1px solid #aaa' }}
            />
          </div>

          <button type="submit" disabled={isSubmitting} style={{ padding: '8px 12px' }}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        {error && (
          <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>
        )}

        {responseText && (
          <pre style={{ marginTop: 12, padding: 12, background: '#f6f6f6', overflowX: 'auto' }}>
            {responseText}
          </pre>
        )}

        <hr style={{ margin: '20px 0', borderColor: '#eee' }} />
        <FinancialReportUpload />
      </div>

      {/* Reactive roadmap + goals — rendered outside the auth card so they
          have full-width layout and appear immediately after analysis */}
      <div style={{ maxWidth: 520, margin: '32px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <RoadmapCard />
        <GoalList />
      </div>
    </div>
  );
}

export default App;
