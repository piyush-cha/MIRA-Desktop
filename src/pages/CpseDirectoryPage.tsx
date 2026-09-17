import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, RefreshCw, Layers, ShieldCheck, ChevronRight, 
  MapPin, CheckCircle, Clock, Search, ArrowUpRight, FolderTree, Database
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';

export const CpseDirectoryPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [cpses, setCpses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Hierarchy Modal
  const [selectedHierarchy, setSelectedHierarchy] = useState<any | null>(null);
  const [hierarchyLoading, setHierarchyLoading] = useState<boolean>(false);

  const fetchCpses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCpses();
      setCpses(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCpses();
  }, []);

  const openHierarchy = async (cpseCode: string) => {
    setHierarchyLoading(true);
    try {
      const res = await api.getHierarchy(cpseCode);
      setSelectedHierarchy(res.data);
    } catch (err) {
      alert(`Could not load hierarchy: ${getApiErrorMessage(err)}`);
    } finally {
      setHierarchyLoading(false);
    }
  };

  const filteredCpses = cpses.filter((c) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ministry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell
      currentPage="onboarding"
      onNavigate={onNavigate}
      title="Central Public Sector Enterprises (CPSEs)"
      subtitle="Connected Sovereign Entities, Organizational Trees & ERP Sync Health"
    >
      <div className="gov-page-container">
        {/* Header Action Bar */}
        <div className="intel-top-bar">
          <div className="search-box-wrapper">
            <Search size={15} />
            <input 
              type="text" 
              className="gov-search-input"
              placeholder="Search CPSE by name, code, or ministry..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="intel-filters">
            <button className="gov-btn primary" onClick={() => onNavigate('onboard-new')}>
              <Plus size={15} />
              <span>Onboard New CPSE</span>
            </button>
            <button className="gov-refresh-btn" onClick={fetchCpses} title="Refresh Directory">
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="cpse-cards-grid">
          {filteredCpses.map((cpse) => (
            <div key={cpse.cpse_id} className="cpse-profile-card">
              <div className="cpse-card-header">
                <div className="cpse-badge-circle">
                  {cpse.code.substring(0, 2)}
                </div>
                <div className="cpse-meta">
                  <div className="cpse-code-row">
                    <span className="cpse-code-tag">{cpse.code}</span>
                    <span className="status-pill active">{cpse.status}</span>
                  </div>
                  <h3 className="cpse-name-heading">{cpse.name}</h3>
                  <div className="cpse-ministry-text">{cpse.ministry}</div>
                </div>
              </div>

              <div className="cpse-stats-row">
                <div className="cpse-stat">
                  <div className="stat-label">Materials</div>
                  <div className="stat-num">{cpse.material_records.toLocaleString()}</div>
                </div>
                <div className="cpse-stat">
                  <div className="stat-label">CNMC Harmonized</div>
                  <div className="stat-num text-emerald">{cpse.standardized_count.toLocaleString()}</div>
                </div>
                <div className="cpse-stat">
                  <div className="stat-label">Alignment</div>
                  <div className="stat-num text-amber">{cpse.cnmc_coverage_pct ?? 0}%</div>
                </div>
              </div>

              <div className="cpse-progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${cpse.cnmc_coverage_pct || 15}%` }}
                />
              </div>

              <div className="cpse-card-footer">
                <button 
                  className="cpse-action-btn secondary"
                  onClick={() => openHierarchy(cpse.code)}
                >
                  <FolderTree size={14} />
                  <span>Hierarchy Tree</span>
                </button>
                <button 
                  className="cpse-action-btn primary"
                  onClick={() => onNavigate('cross-cpse')}
                >
                  <span>Intelligence</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Hierarchy Modal */}
        {selectedHierarchy && (
          <div className="modal-backdrop">
            <div className="modal-dialog large">
              <div className="modal-header">
                <div className="flex items-center gap-2">
                  <FolderTree size={18} color="#3b82f6" />
                  <h3>{selectedHierarchy.cpse_name} — Organizational Node Hierarchy</h3>
                </div>
                <button onClick={() => setSelectedHierarchy(null)} className="close-btn">×</button>
              </div>
              <div className="modal-body">
                <div className="hierarchy-tree-view">
                  {selectedHierarchy.tree?.map((node: any, idx: number) => (
                    <div key={idx} className="tree-node-item">
                      <div className="tree-node-row">
                        <span className="node-type-badge holding">{node.type_code}</span>
                        <span className="node-name-text"><b>{node.unit_name}</b> ({node.unit_code})</span>
                        <span className="node-location"><MapPin size={12} /> {node.location || 'Headquarters'}</span>
                      </div>
                      {node.children?.length > 0 && (
                        <div className="tree-children-container">
                          {node.children.map((child: any, cidx: number) => (
                            <div key={cidx} className="tree-node-child">
                              <span className="node-type-badge area">{child.type_code}</span>
                              <span>{child.unit_name} (<code>{child.unit_code}</code>)</span>
                              <span className="node-location"><MapPin size={11} /> {child.location}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedHierarchy(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
