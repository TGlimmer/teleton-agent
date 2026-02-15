import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Tools } from './pages/Tools';
import { Plugins } from './pages/Plugins';
import { Soul } from './pages/Soul';
import { Memory } from './pages/Memory';
import { Logs } from './pages/Logs';
import { getAuthToken, setAuthToken } from './lib/api';
import { logStore } from './lib/log-store';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      setAuthToken(urlToken);
      setIsAuthenticated(true);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (getAuthToken()) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      logStore.connect();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (tokenInput.trim()) {
      setAuthToken(tokenInput.trim());
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Teleton</h1>
          <p>Enter your authentication token to access the dashboard.</p>
          <div className="form-group">
            <label>Token</label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Paste token from server logs..."
              style={{ width: '100%' }}
            />
          </div>
          <button onClick={handleLogin} style={{ width: '100%' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tools" element={<Tools />} />
            <Route path="plugins" element={<Plugins />} />
            <Route path="soul" element={<Soul />} />
            <Route path="memory" element={<Memory />} />
            <Route path="logs" element={<Logs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
