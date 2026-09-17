import React, { useState, useEffect } from 'react';
import { 
  Cpu, CheckCircle2, RefreshCw, Server, ShieldCheck, 
  ExternalLink, Key, Zap, Check, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';

export const SapSettingsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testingCpse, setTestingCpse] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSapConfigs();
      setConfigs(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleTestConnection = async (cpseCode: string) => {
    setTestingCpse(cpseCode);
    try {
      const res = await api.testSapConnection(cpseCode);
      setTestResults((prev) => ({ ...prev, [cpseCode]: res }));
    } catch (err) {
      alert(`Ping test failed: ${getApiErrorMessage(err)}`);
    } finally {
      setTestingCpse(null);
    }
  };

  return (
    <AppShell
      currentPage="sap-settings"
      onNavigate={onNavigate}
      title="SAP S/4HANA Enterprise Gateway & MCP Hub"
      subtitle="OData Connectors, SAML Bearer Handshakes & Real-Time Material Management Gateways"
    >
      <div className="gov-page-container">
        <div className="intel-top-bar">
          <div className="flex items-center gap-2">
            <Cpu size={18} color="#10b981" />
            <span className="font-semibold text-sm">6 Connected Enterprise SAP ERP Instances</span>
          </div>

          <button className="gov-refresh-btn" onClick={fetchConfigs} title="Refresh Connectors">
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>
        </div>

        <div className="sap-configs-grid">
          {configs.map((cfg) => {
            const isTesting = testingCpse === cfg.cpse_code;
            const result = testResults[cfg.cpse_code];

            return (
              <div key={cfg.config_id} className="sap-config-card">
                <div className="sap-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="sap-logo-badge">{cfg.cpse_code}</div>
                    <div>
                      <h3 className="sap-card-title">{cfg.cpse_code} SAP Gateway</h3>
                      <div className="sap-auth-type">{cfg.auth_type}</div>
                    </div>
                  </div>
                  <span className={`status-pill ${cfg.last_sync_status.toLowerCase()}`}>
                    {cfg.last_sync_status}
                  </span>
                </div>

                <div className="sap-field-row">
                  <span className="sap-field-label">OData Service URL:</span>
                  <code className="sap-url-text">{cfg.gateway_url}</code>
                </div>

                <div className="sap-field-row">
                  <span className="sap-field-label">Linked Plant Codes:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: 600 }}>{cfg.plant_codes}</span>
                </div>

                <div className="sap-field-row">
                  <span className="sap-field-label">Delta Sync Interval:</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{cfg.sync_interval_mins} minutes</span>
                </div>

                {result && (
                  <div className="sap-diagnostic-box">
                    <div className="diagnostic-header">
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>Diagnostics: Latency {result.handshake_latency_ms}ms</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      Ready: {result.odata_services_ready?.slice(0, 2).join(', ')}...
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  <button 
                    className="gov-btn secondary small w-full"
                    disabled={isTesting}
                    onClick={() => handleTestConnection(cfg.cpse_code)}
                  >
                    {isTesting ? (
                      <RefreshCw size={13} className="spinning" />
                    ) : (
                      <Zap size={13} color="#f59e0b" />
                    )}
                    <span>{isTesting ? 'Pinging Gateway...' : 'Test Connection & SAML'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};
