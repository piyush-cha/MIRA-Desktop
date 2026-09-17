import React, { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  Activity, Network, Layers, Building2, Search, Filter, RefreshCw, 
  ArrowRight, ShieldCheck, DollarSign, TrendingDown, Eye, CheckCircle2,
  AlertTriangle, Sparkles, ZoomIn, ZoomOut, Maximize2, Link2, SlidersHorizontal
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';

interface NodeItem {
  id: string;
  node_type: 'CPSE' | 'CNMC_GOLDEN' | 'LEGACY_MATERIAL';
  label: string;
  name: string;
  category?: string;
  ministry?: string;
  cpse_code?: string;
  unit_price_inr?: number;
  raw_uom?: string;
  base_ref_price_inr?: number;
  confidence_score?: number;
  mapping_status?: string;
  color: string;
  size: number;
}

interface EdgeItem {
  id: string;
  source: string;
  target: string;
  relation: string;
  confidence?: number;
  status?: string;
  color: string;
  style: string;
  width: number;
}

export const CrossCpseIntelPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: NodeItem[]; edges: EdgeItem[] }>({ nodes: [], edges: [] });
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCpse, setSelectedCpse] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [priceParity, setPriceParity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'parity' | 'savings'>('visualizer');
  
  // Remap Modal State
  const [remapModalOpen, setRemapModalOpen] = useState<boolean>(false);
  const [targetCnmcInput, setTargetCnmcInput] = useState<string>('CNMC-MEC-VLV-002150');
  const [remapNotes, setRemapNotes] = useState<string>('Verified technical equivalence via valve dimensions ASME B16.5.');
  const [remapSuccess, setRemapSuccess] = useState<string | null>(null);
  const [submittingRemap, setSubmittingRemap] = useState<boolean>(false);

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const cFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const cpFilter = selectedCpse === 'ALL' ? undefined : selectedCpse;
      const res = await api.getCrossCpseGraph(cFilter, cpFilter);
      setGraphData({ nodes: res.nodes || [], edges: res.edges || [] });

      const parityRes = await api.getPriceParity('CNMC-MEC-VLV-002150');
      setPriceParity(parityRes);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [selectedCategory, selectedCpse]);

  // Build ECharts Configuration
  const getOption = () => {
    const echartsNodes = graphData.nodes.map((n) => ({
      id: n.id,
      name: n.label,
      value: n.name,
      symbolSize: n.size,
      itemStyle: {
        color: n.color,
        borderColor: '#1e293b',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: n.color
      },
      label: {
        show: n.node_type !== 'LEGACY_MATERIAL' || n.size > 30,
        position: 'right',
        fontSize: 11,
        color: '#f8fafc',
        formatter: '{b}'
      },
      rawNode: n
    }));

    const echartsLinks = graphData.edges.map((e) => ({
      source: e.source,
      target: e.target,
      lineStyle: {
        color: e.color,
        width: e.width,
        type: e.style as any,
        curveness: 0.15
      }
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const raw = params.data.rawNode;
            return `
              <div style="font-family: inherit; font-size: 12px; padding: 4px;">
                <div style="font-weight: 700; color: ${raw.color};">${raw.label}</div>
                <div style="color: #94a3b8; font-size: 11px;">${raw.name}</div>
                <div style="margin-top: 4px; font-size: 11px;">
                  <b>Type:</b> ${raw.node_type.replace(/_/g, ' ')}
                </div>
                ${raw.unit_price_inr ? `<div><b>Price:</b> ₹${raw.unit_price_inr.toLocaleString()}</div>` : ''}
                ${raw.confidence_score ? `<div><b>Match Score:</b> ${(raw.confidence_score * 100).toFixed(1)}%</div>` : ''}
              </div>
            `;
          }
          return 'Inter-CPSE Link';
        }
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: echartsNodes,
          links: echartsLinks,
          roam: true,
          label: {
            position: 'right'
          },
          force: {
            repulsion: 220,
            edgeLength: [60, 140],
            gravity: 0.12,
            friction: 0.6
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4
            }
          }
        }
      ]
    };
  };

  const onChartClick = (params: any) => {
    if (params.dataType === 'node' && params.data.rawNode) {
      setSelectedNode(params.data.rawNode);
    }
  };

  const handleApplyRemap = async () => {
    if (!selectedNode || !targetCnmcInput) return;
    setSubmittingRemap(true);
    setRemapSuccess(null);
    try {
      const matId = selectedNode.id.replace('node-mat-', '');
      await api.remapNode({
        material_id: matId,
        target_cnmc_code: targetCnmcInput,
        expert_comment: remapNotes,
        expert_name: 'National Governance Specialist'
      });
      setRemapSuccess(`Successfully aligned ${selectedNode.label} to ${targetCnmcInput}!`);
      setTimeout(() => {
        setRemapModalOpen(false);
        fetchGraph();
      }, 1200);
    } catch (err) {
      alert(`Remap failed: ${getApiErrorMessage(err)}`);
    } finally {
      setSubmittingRemap(false);
    }
  };

  return (
    <AppShell 
      currentPage="cross-cpse" 
      onNavigate={onNavigate}
      title="Cross-CPSE Intelligence & Inter-CPSE Mapping"
      subtitle="Interactive Node-to-Node Graph Editor, Golden Alignment & Price Parity Engine"
    >
      <div className="gov-page-container">
        {/* Top Control Bar */}
        <div className="intel-top-bar">
          <div className="tab-pill-group">
            <button 
              className={`tab-pill ${activeTab === 'visualizer' ? 'active' : ''}`}
              onClick={() => setActiveTab('visualizer')}
            >
              <Network size={15} />
              <span>Node Graph Visualizer</span>
            </button>
            <button 
              className={`tab-pill ${activeTab === 'parity' ? 'active' : ''}`}
              onClick={() => setActiveTab('parity')}
            >
              <DollarSign size={15} />
              <span>Cross-CPSE Price Parity</span>
            </button>
            <button 
              className={`tab-pill ${activeTab === 'savings' ? 'active' : ''}`}
              onClick={() => setActiveTab('savings')}
            >
              <TrendingDown size={15} />
              <span>Demand Aggregation Simulator</span>
            </button>
          </div>

          <div className="intel-filters">
            {/* CPSE Filter */}
            <select 
              className="gov-select"
              value={selectedCpse}
              onChange={(e) => setSelectedCpse(e.target.value)}
            >
              <option value="ALL">All CPSE Silos</option>
              <option value="ONGC">ONGC</option>
              <option value="IOCL">IOCL</option>
              <option value="SAIL">SAIL</option>
              <option value="NTPC">NTPC</option>
              <option value="BHEL">BHEL</option>
              <option value="COALINDIA">Coal India</option>
            </select>

            {/* Category Filter */}
            <select 
              className="gov-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Material Domains</option>
              <option value="Valves & Flow Control">Valves & Flow Control</option>
              <option value="Bearings & Power Transmission">Bearings & Transmission</option>
              <option value="Pipes & Fittings">Pipes & Fittings</option>
            </select>

            <button className="gov-refresh-btn" onClick={fetchGraph} title="Reload Network">
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Node-to-Node Graph Editor */}
        {activeTab === 'visualizer' && (
          <div className="visualizer-layout">
            <div className="graph-canvas-card">
              {/* Legend overlay */}
              <div className="graph-legend-overlay">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                  <span>CPSE Entity</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#10b981' }}></span>
                  <span>CNMC Golden Record</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                  <span>Approved Legacy Code</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                  <span>Suggested / Under Review</span>
                </div>
              </div>

              {loading ? (
                <div className="chart-loading-state">
                  <RefreshCw size={24} className="spinning" />
                  <span>Computing Inter-CPSE Graph Physics & Topologies...</span>
                </div>
              ) : (
                <ReactECharts
                  option={getOption()}
                  style={{ height: '580px', width: '100%' }}
                  onEvents={{ click: onChartClick }}
                />
              )}
            </div>

            {/* Inspector Side Drawer */}
            <div className="node-inspector-card">
              <div className="inspector-header">
                <SlidersHorizontal size={16} />
                <span>Node Inspector & Editor</span>
              </div>

              {selectedNode ? (
                <div className="inspector-content">
                  <div className="node-type-badge" style={{ backgroundColor: `${selectedNode.color}22`, color: selectedNode.color }}>
                    {selectedNode.node_type.replace(/_/g, ' ')}
                  </div>

                  <h3 className="node-label-title">{selectedNode.label}</h3>
                  <p className="node-desc-text">{selectedNode.name}</p>

                  <div className="inspector-kv-list">
                    {selectedNode.cpse_code && (
                      <div className="kv-row">
                        <span className="kv-label">CPSE Owner:</span>
                        <span className="kv-val font-semibold">{selectedNode.cpse_code}</span>
                      </div>
                    )}
                    {selectedNode.category && (
                      <div className="kv-row">
                        <span className="kv-label">Domain:</span>
                        <span className="kv-val">{selectedNode.category}</span>
                      </div>
                    )}
                    {selectedNode.unit_price_inr && (
                      <div className="kv-row">
                        <span className="kv-label">Procurement Rate:</span>
                        <span className="kv-val text-emerald">₹{selectedNode.unit_price_inr.toLocaleString()} / {selectedNode.raw_uom || 'NOS'}</span>
                      </div>
                    )}
                    {selectedNode.confidence_score && (
                      <div className="kv-row">
                        <span className="kv-label">AI Match Confidence:</span>
                        <span className="kv-val text-amber">{(selectedNode.confidence_score * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {selectedNode.mapping_status && (
                      <div className="kv-row">
                        <span className="kv-label">Standardization:</span>
                        <span className={`status-pill ${selectedNode.mapping_status.toLowerCase()}`}>
                          {selectedNode.mapping_status}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedNode.node_type === 'LEGACY_MATERIAL' && (
                    <button 
                      className="remap-action-btn"
                      onClick={() => setRemapModalOpen(true)}
                    >
                      <Link2 size={14} />
                      <span>Remap / Align to Golden CNMC</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="inspector-empty">
                  <Eye size={28} opacity={0.4} />
                  <p>Click any node in the graph to inspect metadata, analyze cross-CPSE links, or modify alignments.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Cross-CPSE Price Parity Matrix */}
        {activeTab === 'parity' && (
          <div className="parity-container">
            {priceParity && (
              <>
                <div className="metric-cards-grid">
                  <div className="stat-card">
                    <div className="stat-card-title">Golden Standard Item</div>
                    <div className="stat-card-value font-mono text-sm">{priceParity.cnmc_code}</div>
                    <div className="stat-card-sub">{priceParity.golden_standard_name}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-title">Lowest Procurement Rate</div>
                    <div className="stat-card-value text-emerald">₹{priceParity.min_price_inr?.toLocaleString()}</div>
                    <div className="stat-card-sub">Best Price (IOCL)</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-title">Highest Procurement Rate</div>
                    <div className="stat-card-value text-rose">₹{priceParity.max_price_inr?.toLocaleString()}</div>
                    <div className="stat-card-sub">Highest Price (BHEL)</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-title">Cross-CPSE Price Delta</div>
                    <div className="stat-card-value text-amber">{priceParity.price_disparity_pct}%</div>
                    <div className="stat-card-sub">National Price Spread</div>
                  </div>
                </div>

                <div className="gov-table-card mt-4">
                  <div className="card-header-bar">
                    <h3 className="card-title">Identical Material Procurement Across 6 Central Public Sector Undertakings</h3>
                  </div>
                  <table className="gov-data-table">
                    <thead>
                      <tr>
                        <th>CPSE Entity</th>
                        <th>Local Material Code</th>
                        <th>Raw Item Description in ERP</th>
                        <th>ERP UOM</th>
                        <th>Procurement Rate (INR)</th>
                        <th>Delta vs Benchmark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceParity.records?.map((r: any, idx: number) => {
                        const delta = r.unit_price_inr - priceParity.min_price_inr;
                        const deltaPct = ((delta / priceParity.min_price_inr) * 100).toFixed(1);
                        return (
                          <tr key={idx}>
                            <td className="font-semibold text-primary">{r.cpse_name}</td>
                            <td><code>{r.legacy_item_code}</code></td>
                            <td>{r.raw_item_description}</td>
                            <td><span className="uom-pill">{r.raw_uom}</span></td>
                            <td className="font-bold">₹{r.unit_price_inr?.toLocaleString()}</td>
                            <td>
                              {delta === 0 ? (
                                <span className="status-pill approved">BEST RATE</span>
                              ) : (
                                <span className="status-pill high">+{deltaPct}% (₹{delta.toLocaleString()})</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Joint Demand Aggregation Simulator */}
        {activeTab === 'savings' && (
          <div className="savings-simulator-card">
            <div className="simulator-header">
              <Sparkles size={20} color="#10b981" />
              <div>
                <h3>National Demand Pooling & Framework Rate Agreement Engine</h3>
                <p>Simulate combined CPSE purchasing power for standardized CNMC catalog items.</p>
              </div>
            </div>

            <div className="simulator-grid">
              <div className="sim-panel">
                <h4>Aggregated Commodity: 2" Flanged Ball Valve (ASME Cl.150)</h4>
                <div className="sim-stats">
                  <div><b>Total Participating CPSEs:</b> 6 Entities (ONGC, IOCL, SAIL, NTPC, BHEL, CIL)</div>
                  <div><b>Combined Annual Volume:</b> 12,500 Units</div>
                  <div><b>Weighted Average Cost Today:</b> ₹8,686.00 / Unit</div>
                  <div><b>Target Master GeM Rate:</b> ₹7,450.00 / Unit</div>
                </div>

                <div className="savings-highlight-box">
                  <div className="saving-label">Estimated Sovereign Annual Savings</div>
                  <div className="saving-amount">₹1,54,50,000.00 (₹1.54 Crore)</div>
                  <div className="saving-sub">Achieved through cross-CPSE volume leverage & transparent rate parity</div>
                </div>
              </div>

              <div className="sim-panel">
                <h4>Recommended Governance Actions</h4>
                <div className="action-step-list">
                  <div className="step-item">
                    <span className="step-num">1</span>
                    <div><b>Initiate Framework Agreement:</b> Mandate Ministry of Petroleum & Power joint rate contract on GeM.</div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">2</span>
                    <div><b>Standardize Spec Sheets:</b> Align BHEL and Coal India requisition templates with `CNMC-MEC-VLV-002150`.</div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">3</span>
                    <div><b>Deploy SAP Auto-Routing:</b> Route all upcoming valve purchase requisitions through MIRA Copilot.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remap Modal Dialog */}
        {remapModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3>Align Legacy Item to Golden CNMC</h3>
                <button onClick={() => setRemapModalOpen(false)} className="close-btn">×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Selected Legacy Code</label>
                  <input type="text" className="gov-input" disabled value={selectedNode?.label || ''} />
                </div>
                <div className="form-group">
                  <label>Raw Item Description</label>
                  <textarea className="gov-textarea" disabled rows={2} value={selectedNode?.name || ''} />
                </div>
                <div className="form-group">
                  <label>Target CNMC Golden Standard Code</label>
                  <input 
                    type="text" 
                    className="gov-input font-mono" 
                    value={targetCnmcInput}
                    onChange={(e) => setTargetCnmcInput(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Expert Review Verification Notes</label>
                  <textarea 
                    className="gov-textarea" 
                    rows={2} 
                    value={remapNotes}
                    onChange={(e) => setRemapNotes(e.target.value)}
                  />
                </div>

                {remapSuccess && (
                  <div className="alert-success-banner">
                    <CheckCircle2 size={16} />
                    <span>{remapSuccess}</span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setRemapModalOpen(false)}>Cancel</button>
                <button 
                  className="btn-primary" 
                  onClick={handleApplyRemap}
                  disabled={submittingRemap}
                >
                  {submittingRemap ? 'Submitting...' : 'Commit Mapping to Database'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
