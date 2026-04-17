import { useState } from 'react';
import { getSnapshot, getEvents } from '../api/finance.api';
import { getRoadmap } from '../api/roadmap.api';
import { getGoals, createGoal, deleteGoal } from '../api/goals.api';
import { getNotifications } from '../api/notifications.api';

type Fetcher = () => Promise<{ data: unknown }>;

const endpoints: Record<string, Fetcher> = {
  'GET /finance/snapshot': getSnapshot,
  'GET /events': getEvents,
  'GET /roadmap': getRoadmap,
  'GET /goals': getGoals,
  'GET /notifications': getNotifications,
};

export default function DataTest() {
  const [response, setResponse] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [deleteId, setDeleteId] = useState('');

  const fetch = async (key: string) => {
    setResponse('Loading...');
    try {
      const res = await endpoints[key]();
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      setResponse(JSON.stringify(error.response?.data ?? error.message, null, 2));
    }
  };

  const handleCreateGoal = async () => {
    setResponse('Loading...');
    try {
      const res = await createGoal(goalName, Number(goalAmount));
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      setResponse(JSON.stringify(error.response?.data ?? error.message, null, 2));
    }
  };

  const handleDeleteGoal = async () => {
    setResponse('Loading...');
    try {
      const res = await deleteGoal(deleteId);
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      setResponse(JSON.stringify(error.response?.data ?? error.message, null, 2));
    }
  };

  return (
    <div>
      <h2>Data Endpoints Test</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {Object.keys(endpoints).map((key) => (
          <button key={key} onClick={() => fetch(key)}>{key}</button>
        ))}
      </div>

      <h3>Create Goal</h3>
      <input placeholder="Goal name" value={goalName} onChange={(e) => setGoalName(e.target.value)} />
      <input placeholder="Target amount" type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} />
      <button onClick={handleCreateGoal}>Create</button>

      <h3>Delete Goal</h3>
      <input placeholder="Goal ID" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} />
      <button onClick={handleDeleteGoal}>Delete</button>

      <pre>{response}</pre>
    </div>
  );
}
