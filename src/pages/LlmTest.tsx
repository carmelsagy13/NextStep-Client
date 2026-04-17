import { useState } from 'react';
import apiClient from '../api/client';

export default function LlmTest() {
  const [endpoint, setEndpoint] = useState('/roadmap');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [body, setBody] = useState('{}');
  const [response, setResponse] = useState('');

  const send = async () => {
    setResponse('Loading...');
    try {
      const res = method === 'GET'
        ? await apiClient.get(endpoint)
        : await apiClient.post(endpoint, JSON.parse(body));
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      setResponse(JSON.stringify(error.response?.data ?? error.message, null, 2));
    }
  };

  return (
    <div>
      <h2>LLM / Generic API Test</h2>
      <div>
        <select value={method} onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')}>
          <option>GET</option>
          <option>POST</option>
        </select>
        <input style={{ width: 300 }} value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
        <button onClick={send}>Send</button>
      </div>
      {method === 'POST' && (
        <textarea rows={8} cols={60} value={body} onChange={(e) => setBody(e.target.value)} />
      )}
      <pre>{response}</pre>
    </div>
  );
}
