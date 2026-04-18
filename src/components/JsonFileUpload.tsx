import { useRef, useState } from 'react';
import { uploadFinancialReport } from '../api/openfinance.api';

type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

export default function JsonFileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setStatus('error');
      setMessage('Please select a valid .json file.');
      return;
    }

    setFileName(file.name);
    setStatus('loading');
    setMessage('');

    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setStatus('error');
      setMessage('Invalid JSON file.');
      return;
    }

    try {
      await uploadFinancialReport(parsed);
      setStatus('success');
      setMessage('Report uploaded successfully.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const serverMsg = error.response?.data?.message ?? error.message ?? 'Upload failed.';
      setStatus('error');
      setMessage(serverMsg);
    } finally {
      // Reset input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ fontWeight: 600 }}>Upload Financial Report (JSON)</label>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        disabled={status === 'loading'}
        style={{ cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
      />
      {fileName && status !== 'idle' && (
        <p style={{ margin: 0, fontSize: 13, color: '#555' }}>File: {fileName}</p>
      )}
      {status === 'loading' && (
        <p style={{ margin: 0, color: '#555' }}>Uploading…</p>
      )}
      {status === 'success' && (
        <p style={{ margin: 0, color: '#2a7a2a' }}>{message}</p>
      )}
      {status === 'error' && (
        <p style={{ margin: 0, color: '#c0392b' }}>{message}</p>
      )}
    </div>
  );
}
