import { useEffect, useState } from 'react';
import { api, ToolInfo, ModuleInfo } from '../lib/api';
import { ToolRow } from '../components/ToolRow';
import { Select } from '../components/Select';

export function Tools() {
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const loadTools = () => {
    setLoading(true);
    return api.getTools()
      .then((toolsRes) => {
        setModules(toolsRes.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdating(null);
    }
  };

  const updateScope = async (toolName: string, newScope: ToolInfo['scope']) => {
    setUpdating(toolName);
    try {
      await api.updateToolConfig(toolName, { scope: newScope });
      await loadTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdating(null);
    }
  };

  const bulkToggle = async (module: ModuleInfo, enabled: boolean) => {
    setUpdating(module.name);
    try {
      for (const tool of module.tools) {
        if (tool.enabled !== enabled) {
          await api.updateToolConfig(tool.name, { enabled });
        }
      }
      await loadTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdating(null);
    }
  };

  const bulkScope = async (module: ModuleInfo, scope: ToolInfo['scope']) => {
    setUpdating(module.name);
    try {
      for (const tool of module.tools) {
        if (tool.scope !== scope) {
          await api.updateToolConfig(tool.name, { scope });
        }
      }
      await loadTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const builtIn = modules.filter((m) => !m.isPlugin);
  const builtInCount = builtIn.reduce((sum, m) => sum + m.toolCount, 0);

  return (
    <div>
      <div className="header">
        <h1>Tools</h1>
        <p>{builtInCount} built-in tools across {builtIn.length} modules</p>
      </div>

      {error && (
        <div className="alert error" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-ghost btn-sm" onClick={() => setError(null)}>Dismiss</button>
            <button className="btn-sm" onClick={() => { setError(null); loadTools(); }}>Retry</button>
          </div>
        </div>
      )}

      {builtIn.map((module) => {
        const isExpanded = expandedModule === module.name;
        const someEnabled = module.tools.some((t) => t.enabled);
        const noneEnabled = module.tools.every((t) => !t.enabled);
        const scopes = new Set(module.tools.map((t) => t.scope));
        const mixedScope = scopes.size > 1;
        const commonScope = mixedScope ? '' : (scopes.values().next().value ?? 'always');
        const isBusy = updating === module.name;

        return (
          <div key={module.name} className="card" style={{ padding: 0 }}>
            <div
              onClick={() => setExpandedModule(isExpanded ? null : module.name)}
              className="accordion-header"
            >
              <span className="accordion-chevron">
                {isExpanded ? '\u25BC' : '\u25B6'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ margin: 0 }}>{module.name}</h2>
                  <span className="badge count">{module.toolCount} tools</span>
                  {noneEnabled && (
                    <span className="badge warn">Disabled</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                <Select
                  value={commonScope}
                  options={['', 'always', 'dm-only', 'group-only', 'admin-only']}
                  labels={[mixedScope ? 'Mixed' : 'Scope', 'All', 'DM only', 'Group only', 'Admin only']}
                  onChange={(v) => v && bulkScope(module, v as ToolInfo['scope'])}
                  style={{ minWidth: '110px' }}
                />
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={someEnabled}
                    onChange={() => bulkToggle(module, !someEnabled)}
                    disabled={isBusy}
                  />
                  <span className="toggle-track" />
                  <span className="toggle-thumb" />
                </label>
              </div>
            </div>

            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--separator)', padding: '10px 16px 16px' }}>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {module.tools.map((tool) => (
                    <ToolRow key={tool.name} tool={tool} updating={updating} onToggle={toggleEnabled} onScope={updateScope} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
