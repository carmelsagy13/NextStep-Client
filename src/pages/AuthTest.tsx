import { useState, type FormEvent } from 'react';
import { register, login, logout } from '../api/auth.api';

export default function AuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState<string>('');
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');

  const handle = async (action: 'register' | 'login' | 'logout', e?: FormEvent) => {
    e?.preventDefault();
    setResponse('Loading...');
    try {
      let res;
      if (action === 'register') res = await register(email, password);
      else if (action === 'login') res = await login(email, password);
      else res = await logout();

      const data = res.data;
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        setToken(data.accessToken);
      }
      if (action === 'logout') {
        localStorage.removeItem('accessToken');
        setToken('');
      }
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      setResponse(JSON.stringify(error.response?.data ?? error.message, null, 2));
    }
  };

  return (
    <div>
      <h2>Auth Test</h2>
      <form onSubmit={(e) => handle('login', e)}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
        <button type="button" onClick={(e) => handle('register', e)}>Register</button>
        <button type="button" onClick={() => handle('logout')}>Logout</button>
      </form>
      <p><strong>Stored token:</strong> {token ? `${token.slice(0, 30)}...` : 'none'}</p>
      <pre>{response}</pre>
    </div>
  );
}
