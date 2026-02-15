import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const SOUL_FILES = ['SOUL.md', 'SECURITY.md', 'STRATEGY.md', 'MEMORY.md'] as const;

export function Soul() {
  const [activeTab, setActiveTab] = useState<string>(SOUL_FILES[0]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadFile = async (filename: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.getSoulFile(filename);
      setContent(res.data.content);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.updateSoulFile(activeTab, content);
      setMessage({ type: 'success', text: res.data.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadFile(activeTab);
  }, [activeTab]);

  return (
    <div>
      <div className="header">
        <h1>Soul Editor</h1>
        <p>Edit system prompt files</p>
      </div>

      {message && (
        <div className={`alert ${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <div className="tabs">
          {SOUL_FILES.map((file) => (
            <button
              key={file}
              className={`tab ${activeTab === file ? 'active' : ''}`}
              onClick={() => setActiveTab(file)}
            >
              {file}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Edit ${activeTab}...`}
            />
            <div style={{ marginTop: '14px' }}>
              <button onClick={saveFile} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
