import React, { useState, useEffect } from 'react';
import { 
  FileCode, Search, RefreshCw, Filter, Layers, ArrowRight, 
  CheckCircle2, Sparkles, Building2, Tag
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';

export const LegacyCodesPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await api.getLegacyCodes(searchQuery, undefined, s);
      setCodes(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [statusFilter]);

  return (
    <AppShell
      currentPage="legacy-codes"
      onNavigate={onNavigate}
      title="Legacy Material Codes & Harmonization Mapping"
      subtitle="Cross-CPSE Heterogeneous Part Numbers Aligned to Master CNMC Taxonomy"
    >
      <div className="gov-page-container" style={{ gap: '10px', paddingTop: '14px', paddingBottom: '36px' }}>
        
        <div style={{ marginBottom: '0px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={19} color="#2563eb" />
            Legacy Material Codes & Harmonization Mapping
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={13} />
            Cross-CPSE Heterogeneous Part Numbers Aligned to Master CNMC Taxonomy
          </p>
        </div>
        
        {/* Top Control Bar */}

        <div className="intel-top-bar" style={{ margin: 0 }}>
          <div className="search-box-wrapper" style={{ padding: '6px 12px' }}>
            <Search size={14} />
            <input 
              type="text" 
              className="gov-search-input"
              placeholder="Search legacy codes, descriptions, or MIRA..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCodes()}
            />
          </div>

          <div className="intel-filters" style={{ gap: '8px' }}>
            <select 
              className="gov-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '6px 12px', height: '34px' }}
            >
              <option value="ALL">All Mapping Statuses</option>
              <option value="APPROVED">Approved Golden</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SUGGESTED">AI Suggested</option>
            </select>

            <button className="gov-refresh-btn" onClick={fetchCodes} title="Refresh Codes" style={{ width: '34px', height: '34px' }}>
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Legacy Master Table */}
        <div className="gov-table-card" style={{ overflowX: 'auto', maxWidth: '100%', marginTop: 0 }}>
          <table className="gov-data-table" style={{ width: '100%', minWidth: '780px' }}>
            <thead>
              <tr>
                <th>Legacy Item Code</th>
                <th>Originating CPSE</th>
                <th>Raw ERP Description</th>
                <th>UOM & Price</th>
                <th>Aligned CNMC Golden Code</th>
                <th>Harmonization Status</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted">
                    {loading ? 'Fetching legacy codes...' : 'No legacy codes match the specified query.'}
                  </td>
                </tr>
              ) : (
                codes.map((c) => (
                  <tr key={c.material_id}>
                    <td>
                      <code className="font-bold text-sm text-primary">{c.legacy_item_code}</code>
                    </td>
                    <td className="font-semibold text-sm">{c.cpse_name.split('(')[0]}</td>
                    <td className="max-w-xs text-xs">{c.raw_item_description}</td>
                    <td>
                      <div className="text-xs">
                        <span className="font-bold">₹{c.unit_price_inr?.toLocaleString()}</span> / {c.raw_uom}
                      </div>
                    </td>
                    <td>
                      
                      {c.ground_truth_cnmc === 'UNMAPPED' ? (
                        <div className="font-mono text-xs font-bold text-muted">UNMAPPED</div>
                      ) : (
                        <div className="font-mono text-xs font-bold text-emerald">{c.ground_truth_cnmc}</div>
                      )}

                      <div className="text-xs text-muted max-w-xs truncate">{c.golden_standard_name}</div>
                    </td>
                    <td>
                      <span className={`status-pill ${(c.mapping_status || 'SUGGESTED').toLowerCase()} ${c.mapping_status === 'ISOLATED' ? 'high' : ''}`}>
                        {c.mapping_status || 'SUGGESTED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};
