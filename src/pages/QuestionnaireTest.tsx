import { useState } from 'react';
import { submitQuestionnaire } from '../api/questionnaire.api';

const SAMPLE_ANSWERS = {
  age: 24,
  occupation: 'Software Developer',
  riskTolerance: 'moderate',
  knowledgeLevel: 'basic',
  hasEmergencyFund: false,
  monthlyRent: 3500,
  hasTuition: true,
  goals: ['save for trip', 'buy a car'],
};

export default function QuestionnaireTest() {
  const [json, setJson] = useState(JSON.stringify(SAMPLE_ANSWERS, null, 2));
  const [response, setResponse] = useState('');

  const submit = async () => {
    setResponse('Loading...');
    try {
      const answers = JSON.parse(json);
      const res = await submitQuestionnaire(answers);
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      setResponse(JSON.stringify(error.response?.data ?? error.message, null, 2));
    }
  };

  return (
    <div>
      <h2>Questionnaire Test</h2>
      <textarea rows={12} cols={60} value={json} onChange={(e) => setJson(e.target.value)} />
      <br />
      <button onClick={submit}>Submit Questionnaire</button>
      <pre>{response}</pre>
    </div>
  );
}
