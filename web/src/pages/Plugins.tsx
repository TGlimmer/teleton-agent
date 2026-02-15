import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Tool {
  name: string;
  description: string;
  scope: 'always' | 'dm-only' | 'group-only' | 'admin-only';
  enabled: boolean;
}

interface PluginModule {
  name: string;
  toolCount: number;
  tools: Tool[];
  isPlugin: boolean;
}

interface PluginManifest {
  name: string;
  version: string;
  author?: string;
  description?: string;
  dependencies?: string[];
  sdkVersion?: string;
}

export function Plugins() {
  const [manifests, setManifests] = useState<PluginManifest[]>([]);
  const [pluginModules, setPluginModules] = useState<PluginModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    return Promise.all([api.getPlugins(), api.getTools()])
      .then(([pluginsRes, toolsRes]) => {
        setManifests(pluginsRes.data);
        setPluginModules(toolsRes.data.filter((m: PluginModule) => m.isPlugin));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleEnabled = async (toolName: string, currentEnabled: boolean) => {
    setUpdating(toolName);
    try {
      await api.updateToolConfig(toolName, { enabled: !currentEnabled });
      await loadData();
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
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert error">{error}</div>;

  if (manifests.length === 0) {
    return (
      <div>
        <div className="header">
          <h1>Plugins</h1>
          <p>External plugins and their tools</p>
        </div>
        <div className="empty">No plugins loaded</div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1>Plugins</h1>
        <p>External plugins and their tools</p>
      </div>

      {manifests.map((plugin) => {
        const module = pluginModules.find((m) => m.name === plugin.name);
        return (
          <div key={plugin.name} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h2>{plugin.name}</h2>
              {module && (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {module.toolCount} tools
                </span>
              )}
            </div>
            <div className="plugin-meta">
              v{plugin.version} {plugin.author && <span>by {plugin.author}</span>}
              {plugin.sdkVersion && <span> · SDK {plugin.sdkVersion}</span>}
            </div>
            {plugin.description && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                {plugin.description}
              </p>
            )}

            {module && module.tools.length > 0 && (
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

                    <div className={`scope-seg${!tool.enabled || updating === tool.name ? ' disabled' : ''}`}>
                      {(['always', 'dm-only', 'group-only', 'admin-only'] as const).map((s) => (
                        <button
                          key={s}
                          className={tool.scope === s ? 'active' : ''}
                          disabled={!tool.enabled || updating === tool.name}
                          onClick={() => updateScope(tool.name, s)}
                        >
                          {s === 'always' ? 'All' : s === 'dm-only' ? 'DM' : s === 'group-only' ? 'Group' : 'Admin'}
                        </button>
                      ))}
                    </div>

                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={tool.enabled}
                        onChange={() => toggleEnabled(tool.name, tool.enabled)}
                        disabled={updating === tool.name}
                      />
                      <span className="toggle-track" />
                      <span className="toggle-thumb" />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
