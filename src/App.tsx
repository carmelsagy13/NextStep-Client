import { Routes, Route, Link } from 'react-router-dom';
import AuthTest from './pages/AuthTest';
import QuestionnaireTest from './pages/QuestionnaireTest';
import OpenFinanceTest from './pages/OpenFinanceTest';
import LlmTest from './pages/LlmTest';
import DataTest from './pages/DataTest';

const navStyle: React.CSSProperties = {
  display: 'flex', gap: 12, padding: 12,
  borderBottom: '1px solid #ccc', marginBottom: 16, flexWrap: 'wrap',
};

function App() {
  return (
    <div style={{ fontFamily: 'monospace', padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h1>NextStep — API Test Client</h1>
      <nav style={navStyle}>
        <Link to="/">Auth</Link>
        <Link to="/questionnaire">Questionnaire</Link>
        <Link to="/openfinance">Open Finance</Link>
        <Link to="/llm">LLM / Generic</Link>
        <Link to="/data">Data Endpoints</Link>
      </nav>
      <Routes>
        <Route path="/" element={<AuthTest />} />
        <Route path="/questionnaire" element={<QuestionnaireTest />} />
        <Route path="/openfinance" element={<OpenFinanceTest />} />
        <Route path="/llm" element={<LlmTest />} />
        <Route path="/data" element={<DataTest />} />
      </Routes>
    </div>
  );
}

export default App;
