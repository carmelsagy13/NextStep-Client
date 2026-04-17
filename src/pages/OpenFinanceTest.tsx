import { useState } from 'react';
import { connectBank, syncBank } from '../api/openfinance.api';

export default function OpenFinanceTest() {
  const [userId, setUserId] = useState('');
  const [response, setResponse] = useState('');

  const handleConnect = async () => {
    setResponse('Loading...');
    try {
      const res = await connectBank(userId);
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      setResponse(JSON.stringify(error.response?.data ?? error.message, null, 2));
    }
  };

  const handleSync = async () => {
    setResponse('Loading...');
    try {
      const res = await syncBank();
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      setResponse(JSON.stringify(error.response?.data ?? error.message, null, 2));
    }
  };

  return (
    <div>
      <h2>Open Finance Test</h2>
      <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
      <button onClick={handleConnect}>Connect Bank</button>
      <button onClick={handleSync}>Sync Transactions</button>
      <pre>{response}</pre>
    </div>
  );
}
