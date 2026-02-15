import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Tool {
  name: string;
  description: string;
  scope: 'always' | 'dm-only' | 'group-only' | 'admin-only';
  enabled: boolean;
}

interface Module {
  name: string;
  toolCount: number;
  tools: Tool[];
  isPlugin: boolean;
}

function ModuleCard({
  module,
  updating,
  onToggle,
  onScope,
}: {
  module: Module;
  updating: string | null;
  onToggle: (name: string, enabled: boolean) => void;
  onScope: (name: string, scope: Tool['scope']) => void;
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2>{module.name}</h2>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{module.toolCount} tools</span>
      </div>
      <div style={{ display: 'grid', gap: '6px' }}>
        {module.tools.map((tool) => (
          <div
            key={tool.name}
            className="tool-row"
            style={{
              opacity: tool.enabled ? 1 : 0.5,
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div className="tool-name">{tool.name}</div>
              <div className="tool-desc">{tool.description}</div>
            </div>

            {/* Scope segmented control */}
            <div className={`scope-seg${!tool.enabled || updating === tool.name ? ' disabled' : ''}`}>
              {(['always', 'dm-only', 'group-only', 'admin-only'] as const).map((s) => (
                <button
                  key={s}
                  className={tool.scope === s ? 'active' : ''}
                  disabled={!tool.enabled || updating === tool.name}
                  onClick={() => onScope(tool.name, s)}
                >
                  {s === 'always' ? 'All' : s === 'dm-only' ? 'DM' : s === 'group-only' ? 'Group' : 'Admin'}
                </button>
              ))}
            </div>

            {/* Enable/Disable toggle */}
            <label className="toggle">
              <input
                type="checkbox"
                checked={tool.enabled}
                onChange={() => onToggle(tool.name, tool.enabled)}
                disabled={updating === tool.name}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Tools() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadTools = () => {
    setLoading(true);
    return api
      .getTools()
      .then((res) => {
        setModules(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTools();
  }, []);

  const toggleEnabled = async (toolName: string, currentEnabled: boolean) => {
    setUpdating(toolName);
    try {
      await api.updateToolConfig(toolName, { enabled: !currentEnabled });
      await loadTools();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const updateScope = async (toolName: string, newScope: Tool['scope']) => {
    setUpdating(toolName);
    try {
      await api.updateToolConfig(toolName, { scope: newScope });
      await loadTools();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert error">{error}</div>;

  const builtIn = modules.filter((m) => !m.isPlugin);
  const builtInCount = builtIn.reduce((sum, m) => sum + m.toolCount, 0);

  return (
    <div>
      <div className="header">
        <h1>Tools</h1>
        <p>Configure built-in tool availability and policies ({builtInCount} tools)</p>
      </div>

      {builtIn.map((module) => (
        <ModuleCard
          key={module.name}
          module={module}
          updating={updating}
          onToggle={toggleEnabled}
          onScope={updateScope}
        />
      ))}
    </div>
  );
}
