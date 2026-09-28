import React, { useState, useEffect, useCallback } from 'react';

import {

  AlertTriangle, CheckCircle2, Clock, Database,

  Building2, FileCheck, Layers, Search, ChevronUp,

  ChevronDown, ChevronsUpDown, RefreshCw, ArrowRight,

  ExternalLink, Activity, TrendingUp, Info, XCircle

} from 'lucide-react';

import { AppShell } from '../components/layout/AppShell';

import { api, getApiErrorMessage } from '../api/client';



interface NavigationProps {

  onNavigate: (page: string) => void;

}



// ---------------------------------------------------------------------------

// Types matching the backend response shapes

// ---------------------------------------------------------------------------

interface AttentionItem {

  key: string;

  title: string;

  count: number;

  severity: 'HIGH' | 'MEDIUM' | 'LOW';

  action_route: string;

  description: string;

}



interface OverviewData {

  participating_cpses: number;

  total_material_records: number;

  cnmc_definitions: number;

  standardized_materials_count: number;

  cnmc_coverage_pct: number;

}



interface CpseRow {

  cpse_id: string;

  code: string;

  name: string;

  ministry: string;

  license_tier: string;

  status: string;

  material_records: number;

  cnmc_coverage_pct: number | null;

  standardized_count: number;

  pending_reviews: number;

  data_quality_issues: number;

  onboarded_at: string | null;

  last_sync: string | null;

}



interface CnmcStatusData {

  total_cnmc_definitions: number;

  mapping_status: {

    SUGGESTED: number;

    UNDER_REVIEW: number;

    APPROVED: number;

    REJECTED: number;

  };

}



interface ExpertReview {

  review_id: string;

  material_code: string;

  description: string;

  suggested_cnmc: string;

  cpse: string;

  confidence_score: number | null;

  risk_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

  age_days: number | null;

  status: string;

  assigned_expert: string | null;

}



interface DataQualityIssue {

  issue_id: string;

  issue_type: string;

  affected_cpse: string;

  affected_material_code: string;

  material_description: string;

  severity: 'HIGH' | 'MEDIUM' | 'LOW';

  details: string;

  detected_at: string;

  status: string;

}



interface Opportunity {

  opportunity_id: string;

  opportunity_type: string;

  cnmc_code: string;

  standard_name: string;

  participating_cpses: string;

  potential_savings_summary: string | null;

  evidence: string;

  detected_at: string;

}



interface ActivityLog {

  log_id: string;

  action: string;

  actor: string;

  target: string;

  details: string | null;

  timestamp: string;

}



// ---------------------------------------------------------------------------

// Utility hooks and components

// ---------------------------------------------------------------------------



type LoadState<T> = { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string } | { status: 'ok'; data: T };



function useApiData<T>(fetcher: () => Promise<any>, transform: (r: any) => T): [LoadState<T>, () => void] {

  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });



  const load = useCallback(async () => {

    setState({ status: 'loading' });

    try {

      const res = await fetcher();

      setState({ status: 'ok', data: transform(res) });

    } catch (err) {

      setState({ status: 'error', message: getApiErrorMessage(err) });

    }

  }, []);



  useEffect(() => { load(); }, [load]);



  return [state, load];

}



function SectionSkeleton({ rows = 3 }: { rows?: number }) {

  return (

    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>

      {Array.from({ length: rows }).map((_, i) => (

        <div key={i} className="skeleton" style={{ height: '20px', borderRadius: '4px', width: `${85 - i * 10}%` }} />

      ))}

    </div>

  );

}



function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {

  return (

    <div className="empty-state" style={{ gap: '8px' }}>

      <XCircle size={18} color="var(--status-red)" />

      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{message}</span>

      <button className="btn-ghost" onClick={onRetry} style={{ fontSize: '12px', marginTop: '4px' }}>

        <RefreshCw size={12} /> Retry

      </button>

    </div>

  );

}



function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {

  return (

    <div className="empty-state">

      {icon || <Info size={18} color="var(--text-muted)" />}

      <span>{message}</span>

    </div>

  );

}



function RiskChip({ level }: { level: string }) {

  const map: Record<string, string> = {

    HIGH: 'chip-red', MEDIUM: 'chip-amber', LOW: 'chip-green', UNKNOWN: 'chip-gray'

  };

  return <span className={`chip ${map[level] || 'chip-gray'}`}>{level}</span>;

}



function SeverityChip({ level }: { level: string }) {

  const map: Record<string, string> = {

    HIGH: 'chip-red', MEDIUM: 'chip-amber', LOW: 'chip-green'

  };

  return <span className={`chip ${map[level] || 'chip-gray'}`}>{level}</span>;

}



// ---------------------------------------------------------------------------

// Section: Requires Attention

// ---------------------------------------------------------------------------

function AttentionSection({ onNavigate }: NavigationProps) {

  const [state, reload] = useApiData<AttentionItem[]>(

    api.getAttention,

    (r) => r.data

  );



  return (

    <div className="section-block">

      <div className="section-header">

        <div className="section-title">Requires Attention</div>

        <button className="btn-ghost icon-only" onClick={reload} title="Refresh"><RefreshCw size={13} /></button>

      </div>

      {state.status === 'loading' && <SectionSkeleton rows={2} />}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}

      {state.status === 'ok' && state.data.length === 0 && (

        <div className="attention-clear">

          <CheckCircle2 size={16} color="var(--status-green)" />

          <span>Nothing requires attention.</span>

        </div>

      )}

      {state.status === 'ok' && state.data.length > 0 && (

        <div className="attention-list">

          {state.data.map((item) => (

            <div key={item.key} className={`attention-item sev-${item.severity.toLowerCase()}`}>

              <div className="attention-item-icon">

                <AlertTriangle size={14} />

              </div>

              <div style={{ flex: 1, minWidth: 0 }}>

                <div className="attention-item-title">{item.title}</div>

                <div className="attention-item-desc">{item.description}</div>

              </div>

              <div className="attention-count">{item.count}</div>

              <button className="btn-ghost icon-only" title="Go to section"><ArrowRight size={13} /></button>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}



// ---------------------------------------------------------------------------

// Section: National Snapshot

// ---------------------------------------------------------------------------

function SnapshotSection() {

  const [state, reload] = useApiData<OverviewData>(api.getOverview, (r) => r.data);



  const metrics = state.status === 'ok' ? [

    { label: 'Participating CPSEs', value: state.data.participating_cpses.toString(), sub: 'Registered enterprises' },

    { label: 'Material Records', value: state.data.total_material_records.toLocaleString(), sub: 'Across all CPSEs' },

    { label: 'MIRA Definitions', value: state.data.cnmc_definitions.toLocaleString(), sub: 'National standard codes' },

    { label: 'MIRA Coverage', value: `${state.data.cnmc_coverage_pct}%`, sub: `${state.data.standardized_materials_count.toLocaleString()} standardized` },

  ] : [];



  return (

    <div className="section-block">

      <div className="section-header">

        <div className="section-title">National Snapshot</div>

        <button className="btn-ghost icon-only" onClick={reload} title="Refresh"><RefreshCw size={13} /></button>

      </div>

      {state.status === 'loading' && (

        <div className="metric-row">

          {[1, 2, 3, 4].map(i => (

            <div key={i} className="metric-card">

              <div className="skeleton" style={{ height: '12px', width: '60%', marginBottom: '8px', borderRadius: '4px' }} />

              <div className="skeleton" style={{ height: '24px', width: '40%', borderRadius: '4px' }} />

            </div>

          ))}

        </div>

      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}

      {state.status === 'ok' && (

        <div className="metric-row">

          {metrics.map((m) => (

            <div key={m.label} className="metric-card">

              <div className="metric-label">{m.label}</div>

              <div className="metric-value">{m.value}</div>

              <div className="metric-sub">{m.sub}</div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}



// ---------------------------------------------------------------------------

// Section: CPSE Comparison Table

// ---------------------------------------------------------------------------

type SortKey = 'name' | 'material_records' | 'cnmc_coverage_pct' | 'pending_reviews' | 'data_quality_issues';



function CpseTableSection({ onNavigate }: NavigationProps) {

  const [state, reload] = useApiData<CpseRow[]>(api.getCpses, (r) => r.data);

  const [search, setSearch] = useState('');

  const [sortKey, setSortKey] = useState<SortKey>('name');

  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');



  const handleSort = (key: SortKey) => {

    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');

    else { setSortKey(key); setSortDir('asc'); }

  };



  const sorted = state.status === 'ok' ? [...state.data]

    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()))

    .sort((a, b) => {

      const av = a[sortKey] ?? -1;

      const bv = b[sortKey] ?? -1;

      if (av < bv) return sortDir === 'asc' ? -1 : 1;

      if (av > bv) return sortDir === 'asc' ? 1 : -1;

      return 0;

    }) : [];



  function SortIcon({ col }: { col: SortKey }) {

    if (sortKey !== col) return <ChevronsUpDown size={11} color="var(--text-muted)" />;

    return sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />;

  }



  function th(label: string, col: SortKey) {

    return (

      <th onClick={() => handleSort(col)} style={{ cursor: 'pointer', userSelect: 'none' }}>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>

          {label} <SortIcon col={col} />

        </span>

      </th>

    );

  }



  return (

    <div className="section-block">

      <div className="section-header">

        <div className="section-title">CPSE Comparison</div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

          <div className="search-inline">

            <Search size={12} />

            <input

              value={search}

              onChange={e => setSearch(e.target.value)}

              placeholder="Search CPSEs..."

            />

          </div>

          <button className="btn-ghost icon-only" onClick={reload} title="Refresh"><RefreshCw size={13} /></button>

          <button className="btn-outline" onClick={() => onNavigate('onboarding')} style={{ fontSize: '11px' }}>

            + Onboard CPSE

          </button>

        </div>

      </div>



      {state.status === 'loading' && <SectionSkeleton rows={4} />}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}

      {state.status === 'ok' && sorted.length === 0 && (

        <EmptyState

          message={search ? 'No CPSEs match your search.' : 'No CPSEs have been onboarded yet. Use the button above to register the first CPSE.'}

          icon={<Building2 size={18} color="var(--text-muted)" />}

        />

      )}

      {state.status === 'ok' && sorted.length > 0 && (

        <div style={{ overflowX: 'auto' }}>

          <table className="data-table">

            <thead>

              <tr>

                {th('CPSE', 'name')}

                <th>Ministry</th>

                {th('Materials', 'material_records')}

                {th('MIRA Coverage', 'cnmc_coverage_pct')}

                {th('Pending Reviews', 'pending_reviews')}

                {th('DQ Issues', 'data_quality_issues')}

                <th>Last Sync</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {sorted.map((cpse) => (

                <tr key={cpse.cpse_id}>

                  <td>

                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{cpse.name}</div>

                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>{cpse.code}</div>

                  </td>

                  <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{cpse.ministry}</td>

                  <td style={{ fontSize: '13px', fontWeight: 500 }}>{(Number(cpse?.material_records) || 0).toLocaleString()}</td>

                  <td>

                    {cpse.cnmc_coverage_pct !== null

                      ? <span style={{ fontSize: '13px', fontWeight: 600 }}>{cpse.cnmc_coverage_pct}%</span>

                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}

                  </td>

                  <td>

                    {cpse.pending_reviews > 0

                      ? <span className="chip chip-amber">{cpse.pending_reviews}</span>

                      : <span style={{ color: 'var(--text-muted)' }}>0</span>}

                  </td>

                  <td>

                    {cpse.data_quality_issues > 0

                      ? <span className="chip chip-red">{cpse.data_quality_issues}</span>

                      : <span style={{ color: 'var(--text-muted)' }}>0</span>}

                  </td>

                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>

                    {cpse.last_sync || '—'}

                  </td>

                  <td>

                    <span className={`chip ${cpse.status === 'Active' ? 'chip-green' : 'chip-gray'}`}>{cpse.status}</span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}



// ---------------------------------------------------------------------------

// Section: Harmonization Trend + MIRA Status (side by side)

// ---------------------------------------------------------------------------

function HarmonizationAndCnmc() {

  const [trendState, reloadTrend] = useApiData<{ trend_available: boolean; message: string; data: any[] }>(

    api.getHarmonizationTrend,

    (r) => r

  );

  const [cnmcState, reloadCnmc] = useApiData<CnmcStatusData>(api.getCnmcStatus, (r) => r.data);



  return (

    <div className="two-col-row">

      {/* Harmonization Trend */}

      <div className="section-block" style={{ flex: '1 1 0' }}>

        <div className="section-header">

          <div className="section-title">Harmonization Trend</div>

          <button className="btn-ghost icon-only" onClick={reloadTrend} title="Refresh"><RefreshCw size={13} /></button>

        </div>

        {trendState.status === 'loading' && <SectionSkeleton rows={3} />}

        {trendState.status === 'error' && <ErrorState message={trendState.message} onRetry={reloadTrend} />}

        {trendState.status === 'ok' && !trendState.data.trend_available && (

          <EmptyState

            message={trendState.data.message}

            icon={<TrendingUp size={18} color="var(--text-muted)" />}

          />

        )}

      </div>



      {/* MIRA Governance Status */}

      <div className="section-block" style={{ flex: '1 1 0' }}>

        <div className="section-header">

          <div className="section-title">MIRA Mapping Status</div>

          <button className="btn-ghost icon-only" onClick={reloadCnmc} title="Refresh"><RefreshCw size={13} /></button>

        </div>

        {cnmcState.status === 'loading' && <SectionSkeleton rows={4} />}

        {cnmcState.status === 'error' && <ErrorState message={cnmcState.message} onRetry={reloadCnmc} />}

        {cnmcState.status === 'ok' && (

          <div style={{ padding: '8px 16px 16px' }}>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>

              {cnmcState.data.total_cnmc_definitions} national standard definitions

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

              {Object.entries(cnmcState.data.mapping_status).map(([st, cnt]) => {

                const chipMap: Record<string, string> = {

                  APPROVED: 'chip-green', UNDER_REVIEW: 'chip-amber', SUGGESTED: 'chip-blue', REJECTED: 'chip-red'

                };

                const total = Object.values(cnmcState.data.mapping_status).reduce((a, b) => a + b, 0);

                const pct = total > 0 ? Math.round(cnt / total * 100) : 0;

                return (

                  <div key={st} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                    <span className={`chip ${chipMap[st] || 'chip-gray'}`} style={{ minWidth: '100px', justifyContent: 'center' }}>

                      {st.replace('_', ' ')}

                    </span>

                    <div className="progress-bar-track" style={{ flex: 1 }}>

                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />

                    </div>

                    <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '28px', textAlign: 'right' }}>{cnt}</span>

                  </div>

                );

              })}

            </div>

          </div>

        )}

      </div>

    </div>

  );

}



// ---------------------------------------------------------------------------

// Section: Expert Review Queue

// ---------------------------------------------------------------------------

function ExpertReviewSection() {

  const [state, reload] = useApiData<ExpertReview[]>(api.getExpertReviews, (r) => r.data);



  return (

    <div className="section-block">

      <div className="section-header">

        <div className="section-title">Expert Review Queue</div>

        <button className="btn-ghost icon-only" onClick={reload} title="Refresh"><RefreshCw size={13} /></button>

      </div>

      {state.status === 'loading' && <SectionSkeleton rows={3} />}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}

      {state.status === 'ok' && state.data.length === 0 && (

        <EmptyState message="No expert reviews require attention." icon={<FileCheck size={18} color="var(--text-muted)" />} />

      )}

      {state.status === 'ok' && state.data.length > 0 && (

        <div style={{ overflowX: 'auto' }}>

          <table className="data-table">

            <thead>

              <tr>

                <th>Material Code</th>

                <th>Description</th>

                <th>Suggested MIRA</th>

                <th>CPSE</th>

                <th>Risk</th>

                <th>Age</th>

                <th>Status</th>

                <th>Assigned Expert</th>

              </tr>

            </thead>

            <tbody>

              {state.data.map((r) => (

                <tr key={r.review_id}>

                  <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>{r.material_code}</td>

                  <td style={{ maxWidth: '240px' }}>

                    <div style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.description}>

                      {r.description}

                    </div>

                  </td>

                  <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>{r.suggested_cnmc}</td>

                  <td style={{ fontSize: '12px' }}>{r.cpse}</td>

                  <td><RiskChip level={r.risk_level} /></td>

                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>

                    {r.age_days !== null ? `${r.age_days}d` : '—'}

                  </td>

                  <td><span className="chip chip-amber">{r.status.replace('_', ' ')}</span></td>

                  <td style={{ fontSize: '12px', color: r.assigned_expert ? 'var(--text-primary)' : 'var(--text-muted)' }}>

                    {r.assigned_expert || 'Unassigned'}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}



// ---------------------------------------------------------------------------

// Section: Data Quality Issues

// ---------------------------------------------------------------------------

function DataQualitySection() {

  const [state, reload] = useApiData<DataQualityIssue[]>(api.getDataQuality, (r) => r.data);



  return (

    <div className="section-block">

      <div className="section-header">

        <div className="section-title">Data Quality Issues</div>

        <button className="btn-ghost icon-only" onClick={reload} title="Refresh"><RefreshCw size={13} /></button>

      </div>

      {state.status === 'loading' && <SectionSkeleton rows={3} />}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}

      {state.status === 'ok' && state.data.length === 0 && (

        <EmptyState message="No open data quality issues detected." icon={<CheckCircle2 size={18} color="var(--status-green)" />} />

      )}

      {state.status === 'ok' && state.data.length > 0 && (

        <div style={{ overflowX: 'auto' }}>

          <table className="data-table">

            <thead>

              <tr>

                <th>Issue Type</th>

                <th>Affected CPSE</th>

                <th>Material Code</th>

                <th>Details</th>

                <th>Severity</th>

                <th>Detected</th>

              </tr>

            </thead>

            <tbody>

              {state.data.map((issue) => (

                <tr key={issue.issue_id}>

                  <td style={{ fontSize: '12px', fontWeight: 600 }}>{issue.issue_type}</td>

                  <td style={{ fontSize: '12px' }}>{issue.affected_cpse}</td>

                  <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{issue.affected_material_code}</td>

                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '220px' }}>

                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }} title={issue.details}>

                      {issue.details}

                    </span>

                  </td>

                  <td><SeverityChip level={issue.severity} /></td>

                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>

                    {issue.detected_at ? new Date(issue.detected_at).toLocaleDateString('en-IN') : '—'}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}



// ---------------------------------------------------------------------------

// Section: Cross-CPSE Opportunities

// ---------------------------------------------------------------------------

function OpportunitiesSection() {

  const [state, reload] = useApiData<Opportunity[]>(api.getOpportunities, (r) => r.data);



  return (

    <div className="section-block">

      <div className="section-header">

        <div className="section-title">Cross-CPSE Intelligence</div>

        <button className="btn-ghost icon-only" onClick={reload} title="Refresh"><RefreshCw size={13} /></button>

      </div>

      {state.status === 'loading' && <SectionSkeleton rows={2} />}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}

      {state.status === 'ok' && state.data.length === 0 && (

        <EmptyState

          message="No cross-CPSE intelligence opportunities detected. Opportunities are identified once multiple CPSEs are connected and material data is synchronized."

          icon={<Layers size={18} color="var(--text-muted)" />}

        />

      )}

      {state.status === 'ok' && state.data.length > 0 && (

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 16px 16px' }}>

          {state.data.map((opp) => (

            <div key={opp.opportunity_id} className="opportunity-card">

              <div className="opportunity-header">

                <span className="chip chip-blue">{opp.opportunity_type.replace(/_/g, ' ')}</span>

                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>{opp.cnmc_code}</span>

              </div>

              <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '6px' }}>{opp.standard_name}</div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>

                <strong>CPSEs:</strong> {opp.participating_cpses}

              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>

                <strong>Evidence:</strong> {opp.evidence}

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}



// ---------------------------------------------------------------------------

// Section: National Activity Timeline

// ---------------------------------------------------------------------------

function ActivitySection() {

  const [state, reload] = useApiData<ActivityLog[]>(api.getActivity, (r) => r.data);



  function actionLabel(action: string) {

    const map: Record<string, { icon: React.ReactNode; label: string }> = {

      CPSE_ONBOARDED: { icon: <Building2 size={12} />, label: 'CPSE Onboarded' },

      ROLE_ASSIGNED: { icon: <FileCheck size={12} />, label: 'Role Assigned' },

      CNMC_APPROVED: { icon: <CheckCircle2 size={12} />, label: 'MIRA Approved' },

    };

    return map[action] || { icon: <Activity size={12} />, label: action.replace(/_/g, ' ') };

  }



  return (

    <div className="section-block">

      <div className="section-header">

        <div className="section-title">Recent Governance Activity</div>

        <button className="btn-ghost icon-only" onClick={reload} title="Refresh"><RefreshCw size={13} /></button>

      </div>

      {state.status === 'loading' && <SectionSkeleton rows={4} />}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}

      {state.status === 'ok' && state.data.length === 0 && (

        <EmptyState message="No governance activity yet." icon={<Activity size={18} color="var(--text-muted)" />} />

      )}

      {state.status === 'ok' && state.data.length > 0 && (

        <div className="activity-timeline">

          {state.data.map((log) => {

            const { icon, label } = actionLabel(log.action);

            return (

              <div key={log.log_id} className="activity-item">

                <div className="activity-dot">{icon}</div>

                <div style={{ flex: 1, minWidth: 0 }}>

                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{label}: <span style={{ fontWeight: 400 }}>{log.target}</span></div>

                  {log.details && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{log.details}</div>}

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>

                    by {log.actor} · {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : '—'}

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>

  );

}



// ---------------------------------------------------------------------------

// Main Page

// ---------------------------------------------------------------------------

export const NationalGovernancePage: React.FC<NavigationProps> = ({ onNavigate }) => {

  return (

    <AppShell currentPage="national" onNavigate={onNavigate} title="National Governance">

      <div className="page-header">

        <div>

          <h1 className="page-title">National Governance</h1>

          <p className="page-subtitle">National oversight of material standardization, harmonization, and MIRA governance.</p>

        </div>

        <button className="btn-outline" onClick={() => onNavigate('onboarding')}>

          + Onboard CPSE

        </button>

      </div>



      <AttentionSection onNavigate={onNavigate} />

      <SnapshotSection />

      <CpseTableSection onNavigate={onNavigate} />

      <HarmonizationAndCnmc />

      <ExpertReviewSection />



      <div className="two-col-row">

        <div style={{ flex: '1 1 0' }}><DataQualitySection /></div>

        <div style={{ flex: '1 1 0' }}><OpportunitiesSection /></div>

      </div>



      <ActivitySection />

    </AppShell>

  );

};
