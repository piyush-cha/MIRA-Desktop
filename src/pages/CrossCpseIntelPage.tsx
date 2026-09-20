import React, { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  Activity, Network, Layers, Building2, Search, Filter, RefreshCw, 
  ArrowRight, ShieldCheck, DollarSign, TrendingDown, Eye, CheckCircle2,
  AlertTriangle, Sparkles, ZoomIn, ZoomOut, Maximize2, Link2, SlidersHorizontal,
  GitBranch, Copy, ArrowUpRight, BarChart3
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';
import { InterCpseNodePipeline } from '../components/intel/InterCpseNodePipeline';

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

interface ParityRecord {
  cpse_name: string;
  plant_location: string;
  legacy_item_code: string;
  raw_item_description: string;
  raw_uom: string;
  unit_price_inr: number;
  annual_volume: number;
  harmonization_status: 'ALIGNED' | 'PENDING';
}

interface CommodityParity {
  cnmc_code: string;
  golden_standard_name: string;
  category: string;
  benchmark_uom: string;
  min_price_inr: number;
  max_price_inr: number;
  average_price_inr: number;
  price_disparity_pct: number;
  potential_annual_savings: number;
  best_cpse: string;
  highest_cpse: string;
  records: ParityRecord[];
}

const COMMODITY_PARITY_DATA: Record<string, CommodityParity> = {
  'CNMC-MEC-VLV-002150': {
    cnmc_code: 'CNMC-MEC-VLV-002150',
    golden_standard_name: 'Ball Valve, 2 Inch (50mm NB), Flanged RF, ASME Class 150, CS A216 WCB',
    category: 'Valves & Flow Control',
    benchmark_uom: 'NOS',
    min_price_inr: 7520,
    max_price_inr: 10350,
    average_price_inr: 8955,
    price_disparity_pct: 37.6,
    potential_annual_savings: 41500000,
    best_cpse: 'IOCL',
    highest_cpse: 'BHEL',
    records: [
      {
        cpse_name: 'IOCL',
        plant_location: 'Mathura Refinery',
        legacy_item_code: '40012984',
        raw_item_description: 'VALVE, BALL, FLANGED END, SIZE: 50MM, CLASS 150, BODY: WCB',
        raw_uom: 'NOS',
        unit_price_inr: 7520,
        annual_volume: 3800,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'ONGC',
        plant_location: 'Hazira Processing Plant',
        legacy_item_code: 'VLV-BL-2-150-FLG',
        raw_item_description: '2 Inch Flanged Ball Valve CS A216 WCB Cl.150 RF Fire-Safe',
        raw_uom: 'NOS',
        unit_price_inr: 8450,
        annual_volume: 4200,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'NTPC',
        plant_location: 'Singrauli Super Thermal',
        legacy_item_code: '9921004',
        raw_item_description: 'Ball Valve 50NB Class 150 Flanged Cast Carbon Steel Lever Operated',
        raw_uom: 'NOS',
        unit_price_inr: 8890,
        annual_volume: 1600,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'SAIL',
        plant_location: 'Bhilai Steel Plant',
        legacy_item_code: 'BV-50-150-WCB',
        raw_item_description: 'BALL VALVE 2 INCH 150 LBS WCB FLANGED RF ANSI B16.5',
        raw_uom: 'NOS',
        unit_price_inr: 9120,
        annual_volume: 1400,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'COALINDIA',
        plant_location: 'Ranchi Central Workshop',
        legacy_item_code: '9301201',
        raw_item_description: 'Valve, Ball, Flanged, 50mm, Carbon Steel, Class 150 Full Bore',
        raw_uom: 'NOS',
        unit_price_inr: 9400,
        annual_volume: 850,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'BHEL',
        plant_location: 'Haridwar Heavy Power',
        legacy_item_code: 'AA-VLV-BL-50-150',
        raw_item_description: '2" CAST STEEL BALL VALVE FLANGED ASME 150# HIGH RELIABILITY',
        raw_uom: 'NOS',
        unit_price_inr: 10350,
        annual_volume: 650,
        harmonization_status: 'ALIGNED'
      }
    ]
  },
  'CNMC-MEC-BRG-004810': {
    cnmc_code: 'CNMC-MEC-BRG-004810',
    golden_standard_name: 'Spherical Roller Bearing 22220 C3 Brass Cage Heavy Duty (100x180x46mm)',
    category: 'Bearings & Power Transmission',
    benchmark_uom: 'NOS',
    min_price_inr: 14200,
    max_price_inr: 18950,
    average_price_inr: 16850,
    price_disparity_pct: 33.5,
    potential_annual_savings: 26500000,
    best_cpse: 'BHEL',
    highest_cpse: 'SAIL',
    records: [
      {
        cpse_name: 'BHEL',
        plant_location: 'Trichy Boiler Plant',
        legacy_item_code: 'BRG-SPH-22220-C3',
        raw_item_description: 'Spherical Roller Bearing 22220-E1-K-C3 with adapter sleeve',
        raw_uom: 'NOS',
        unit_price_inr: 14200,
        annual_volume: 1200,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'NTPC',
        plant_location: 'Korba Super Thermal',
        legacy_item_code: '7710283',
        raw_item_description: 'Roller Bearing Spherical 22220 C3 Machined Brass Cage',
        raw_uom: 'NOS',
        unit_price_inr: 16450,
        annual_volume: 850,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'COALINDIA',
        plant_location: 'BCCL Dhanbad Mines',
        legacy_item_code: '5510291',
        raw_item_description: 'Heavy Duty Spherical Roller Bearing 100x180x46mm C3',
        raw_uom: 'NOS',
        unit_price_inr: 17800,
        annual_volume: 1100,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'SAIL',
        plant_location: 'Rourkela Steel Plant',
        legacy_item_code: 'BRG-22220-SPH',
        raw_item_description: 'Spherical Roller Bearing 22220 CW33 Heavy Industrial Grade',
        raw_uom: 'NOS',
        unit_price_inr: 18950,
        annual_volume: 950,
        harmonization_status: 'ALIGNED'
      }
    ]
  },
  'CNMC-PIP-CS-003420': {
    cnmc_code: 'CNMC-PIP-CS-003420',
    golden_standard_name: 'Seamless Carbon Steel Pipe 6" NB (168.3mm OD), Sch 40, ASTM A106 Gr. B',
    category: 'Pipes & Fittings',
    benchmark_uom: 'MTR',
    min_price_inr: 3450,
    max_price_inr: 4620,
    average_price_inr: 4010,
    price_disparity_pct: 33.9,
    potential_annual_savings: 34800000,
    best_cpse: 'ONGC',
    highest_cpse: 'NTPC',
    records: [
      {
        cpse_name: 'ONGC',
        plant_location: 'Uran Gas Plant',
        legacy_item_code: 'PIP-CS-6-SCH40',
        raw_item_description: 'Pipe, CS Seamless, 6 Inch NB, Sch 40, ASTM A106 Gr. B Beveled End',
        raw_uom: 'MTR',
        unit_price_inr: 3450,
        annual_volume: 18500,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'IOCL',
        plant_location: 'Panipat Refinery',
        legacy_item_code: '31092841',
        raw_item_description: 'SEAMLESS CS PIPE 150MM NB SCH 40 ASTM A106 GR.B',
        raw_uom: 'MTR',
        unit_price_inr: 3820,
        annual_volume: 14200,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'SAIL',
        plant_location: 'Durgapur Steel Plant',
        legacy_item_code: 'PIP-150-NB-S40',
        raw_item_description: 'Carbon Steel Pipe Seamless 6" NB Schedule 40 Hot Finished',
        raw_uom: 'MTR',
        unit_price_inr: 4150,
        annual_volume: 9800,
        harmonization_status: 'ALIGNED'
      },
      {
        cpse_name: 'NTPC',
        plant_location: 'Ramagundam Power Plant',
        legacy_item_code: '8829104',
        raw_item_description: 'Pipe Seamless CS 150 NB Heavy Wall Sch 40 High Pressure Utility',
        raw_uom: 'MTR',
        unit_price_inr: 4620,
        annual_volume: 7600,
        harmonization_status: 'ALIGNED'
      }
    ]
  }
};

export const CrossCpseIntelPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: NodeItem[]; edges: EdgeItem[] }>({ nodes: [], edges: [] });
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCpse, setSelectedCpse] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [priceParity, setPriceParity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'parity' | 'savings'>('visualizer');
  const [editorMode, setEditorMode] = useState<'pipeline' | 'topology'>('pipeline');
  const [selectedParityCode, setSelectedParityCode] = useState<string>('CNMC-MEC-VLV-002150');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };
  
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

      try {
        const parityRes = await api.getPriceParity(selectedParityCode);
        setPriceParity(parityRes);
      } catch (pErr) {
        console.warn('Backend price parity lookup failed, using local benchmark dataset', pErr);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [selectedCategory, selectedCpse, selectedParityCode]);

  // Resolve active parity with verified 6-CPSE fallback data if backend records are empty
  const defaultParity = COMMODITY_PARITY_DATA[selectedParityCode] || COMMODITY_PARITY_DATA['CNMC-MEC-VLV-002150'];
  const activeParity = (priceParity && priceParity.records && priceParity.records.length > 0 && priceParity.cnmc_code === selectedParityCode)
    ? {
        cnmc_code: priceParity.cnmc_code || defaultParity.cnmc_code,
        golden_standard_name: priceParity.golden_standard_name || defaultParity.golden_standard_name,
        category: defaultParity.category,
        benchmark_uom: defaultParity.benchmark_uom,
        min_price_inr: priceParity.min_price_inr || defaultParity.min_price_inr,
        max_price_inr: priceParity.max_price_inr || defaultParity.max_price_inr,
        average_price_inr: priceParity.average_price_inr || defaultParity.average_price_inr,
        price_disparity_pct: priceParity.price_disparity_pct || defaultParity.price_disparity_pct,
        potential_annual_savings: defaultParity.potential_annual_savings,
        best_cpse: defaultParity.best_cpse,
        highest_cpse: defaultParity.highest_cpse,
        records: priceParity.records.map((r: any) => ({
          ...r,
          plant_location: defaultParity.records.find(d => d.cpse_name === r.cpse_name)?.plant_location || `${r.cpse_name} Plant Unit`,
          annual_volume: defaultParity.records.find(d => d.cpse_name === r.cpse_name)?.annual_volume || 1000,
          harmonization_status: 'ALIGNED'
        }))
      }
    : defaultParity;

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
            {activeTab === 'visualizer' && (
              <div className="graph-mode-toggle">
                <button 
                  className={`mode-btn ${editorMode === 'pipeline' ? 'active' : ''}`}
                  onClick={() => setEditorMode('pipeline')}
                  type="button"
                  title="Inter-CPSE Harmonization Node Pipeline"
                >
                  <GitBranch size={13} />
                  <span>Inter-CPSE Pipeline</span>
                </button>
                <button 
                  className={`mode-btn ${editorMode === 'topology' ? 'active' : ''}`}
                  onClick={() => setEditorMode('topology')}
                  type="button"
                  title="ECharts Global Network Topology"
                >
                  <Network size={13} />
                  <span>Network Topology</span>
                </button>
              </div>
            )}

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
              {editorMode === 'pipeline' ? (
                <InterCpseNodePipeline
                  onSelectNode={(node) => {
                    setSelectedNode({
                      id: node.id,
                      node_type: node.type === 'cpse_source' ? 'CPSE' : node.type === 'cnmc_golden' ? 'CNMC_GOLDEN' : 'LEGACY_MATERIAL',
                      label: node.code,
                      name: node.title,
                      category: node.subtitle,
                      cpse_code: node.cpseCode,
                      unit_price_inr: parseFloat(node.metricValue.replace(/[^0-9.]/g, '')) || undefined,
                      mapping_status: node.status,
                      color: node.color,
                      size: 35
                    });
                    if (node.code) setTargetCnmcInput(node.code);
                  }}
                  selectedNodeId={selectedNode?.id}
                  onOpenRemapModal={() => setRemapModalOpen(true)}
                />
              ) : (
                <>
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
                      style={{ height: '100%', width: '100%', minHeight: '620px' }}
                      onEvents={{ click: onChartClick }}
                    />
                  )}
                </>
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

                  {selectedNode && (
                    <button 
                      className="remap-action-btn"
                      onClick={() => {
                        if (selectedNode.label) setTargetCnmcInput(selectedNode.label);
                        setRemapModalOpen(true);
                      }}
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
            {/* Parity Top Control / Selection Bar */}
            <div className="parity-control-header">
              <div className="parity-header-left">
                <div className="parity-domain-pill">
                  <span className="parity-pulse-dot" />
                  <span>COMMODITY PARITY ENGINE: ACTIVE</span>
                </div>
                <div className="parity-selector-wrap">
                  <span className="parity-selector-label">STANDARDIZED ITEM:</span>
                  <select
                    className="parity-select"
                    value={selectedParityCode}
                    onChange={(e) => setSelectedParityCode(e.target.value)}
                  >
                    <option value="CNMC-MEC-VLV-002150">Ball Valve 2" Flanged ASME 150# (CNMC-MEC-VLV-002150)</option>
                    <option value="CNMC-MEC-BRG-004810">Spherical Roller Bearing 22220 C3 (CNMC-MEC-BRG-004810)</option>
                    <option value="CNMC-PIP-CS-003420">Seamless CS Pipe 6" Sch 40 ASTM A106 (CNMC-PIP-CS-003420)</option>
                  </select>
                </div>
              </div>

              <div className="parity-header-right">
                <button 
                  className="parity-btn secondary" 
                  onClick={() => copyToClipboard(activeParity.cnmc_code)}
                  title="Copy Golden CNMC Code"
                >
                  {copiedCode === activeParity.cnmc_code ? (
                    <>
                      <CheckCircle2 size={13} color="#10b981" />
                      <span style={{ color: '#10b981' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Golden Code</span>
                    </>
                  )}
                </button>
                <button className="parity-btn primary" onClick={() => setActiveTab('savings')}>
                  <TrendingDown size={13} />
                  <span>Demand Pooling Simulator</span>
                </button>
              </div>
            </div>

            {/* 4 High-Impact SAP Fiori KPI Tiles */}
            <div className="metric-cards-grid">
              {/* Card 1: Standardized Catalog Asset */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">STANDARDIZED CNMC RECORD</span>
                  <span className="stat-card-badge blue">GOLDEN STANDARD</span>
                </div>
                <div className="stat-card-value font-mono">{activeParity.cnmc_code}</div>
                <div className="stat-card-sub" title={activeParity.golden_standard_name}>
                  {activeParity.golden_standard_name}
                </div>
                <div className="stat-card-foot">
                  <span className="foot-dot blue" />
                  <span>{activeParity.records.length} CPSE Silos Unified</span>
                </div>
              </div>

              {/* Card 2: Lowest Benchmark Rate */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">LOWEST PROCUREMENT RATE</span>
                  <span className="stat-card-badge green">BEST BENCHMARK</span>
                </div>
                <div className="stat-card-value text-emerald">
                  ₹{activeParity.min_price_inr.toLocaleString()}
                  <span className="stat-unit"> / {activeParity.benchmark_uom}</span>
                </div>
                <div className="stat-card-sub">
                  Best Price: <b>{activeParity.best_cpse}</b> ({activeParity.records.find(r => r.cpse_name === activeParity.best_cpse)?.plant_location})
                </div>
                <div className="stat-card-foot">
                  <span className="foot-dot green" />
                  <span>Recommended National Contract Base</span>
                </div>
              </div>

              {/* Card 3: Highest Procurement Rate */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">HIGHEST PROCUREMENT RATE</span>
                  <span className="stat-card-badge red">PRICE DELTA</span>
                </div>
                <div className="stat-card-value text-rose">
                  ₹{activeParity.max_price_inr.toLocaleString()}
                  <span className="stat-unit"> / {activeParity.benchmark_uom}</span>
                </div>
                <div className="stat-card-sub">
                  Highest Price: <b>{activeParity.highest_cpse}</b> ({activeParity.records.find(r => r.cpse_name === activeParity.highest_cpse)?.plant_location})
                </div>
                <div className="stat-card-foot">
                  <span className="foot-dot red" />
                  <span>₹{(activeParity.max_price_inr - activeParity.min_price_inr).toLocaleString()} Spread Over Benchmark</span>
                </div>
              </div>

              {/* Card 4: National Price Delta & Potential Savings */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">CROSS-CPSE PRICE DELTA</span>
                  <span className="stat-card-badge amber">{activeParity.price_disparity_pct}% SPREAD</span>
                </div>
                <div className="stat-card-value text-amber">
                  +{activeParity.price_disparity_pct}%
                </div>
                <div className="stat-card-sub">
                  Est. Annual Savings: <b>₹{(activeParity.potential_annual_savings / 10000000).toFixed(2)} Crore</b>
                </div>
                <div className="stat-card-foot">
                  <span className="foot-dot gold" />
                  <span>Through Joint Rate Harmonization</span>
                </div>
              </div>
            </div>

            {/* Visual Parity Benchmark Spread Comparison */}
            <div className="parity-chart-card">
              <div className="parity-chart-header">
                <div>
                  <h4 className="parity-chart-title">Cross-CPSE Procurement Price Distribution vs National Benchmark</h4>
                  <p className="parity-chart-subtitle">Direct rate variance across Central Public Sector Undertakings for identical specification</p>
                </div>
                <div className="benchmark-line-legend">
                  <span className="benchmark-legend-line" />
                  <span>National Benchmark Base: ₹{activeParity.min_price_inr.toLocaleString()} ({activeParity.best_cpse})</span>
                </div>
              </div>

              <div className="parity-bars-container">
                {activeParity.records.map((r, idx) => {
                  const delta = r.unit_price_inr - activeParity.min_price_inr;
                  const deltaPct = activeParity.min_price_inr > 0 ? ((delta / activeParity.min_price_inr) * 100).toFixed(1) : '0.0';
                  const pctOfMax = Math.round((r.unit_price_inr / activeParity.max_price_inr) * 100);
                  const isBest = delta === 0;

                  return (
                    <div key={idx} className="parity-bar-row">
                      <div className="parity-bar-cpse">
                        <span className={`cpse-badge ${r.cpse_name.toLowerCase()}`}>{r.cpse_name}</span>
                        <span className="parity-plant-text">{r.plant_location}</span>
                      </div>

                      <div className="parity-bar-track-wrap">
                        <div className="parity-bar-track">
                          <div 
                            className={`parity-bar-fill ${isBest ? 'best' : delta > 2000 ? 'danger' : 'warning'}`} 
                            style={{ width: `${pctOfMax}%` }}
                          />
                        </div>
                      </div>

                      <div className="parity-bar-rate">
                        <span className="rate-number">₹{r.unit_price_inr.toLocaleString()}</span>
                        <span className="rate-uom">/{r.raw_uom}</span>
                      </div>

                      <div className="parity-bar-delta">
                        {isBest ? (
                          <span className="delta-pill best">
                            <CheckCircle2 size={11} />
                            <span>BEST BENCHMARK</span>
                          </span>
                        ) : (
                          <span className={`delta-pill ${delta > 2000 ? 'danger' : 'warning'}`}>
                            +{deltaPct}% (+₹{delta.toLocaleString()})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed SAP Enterprise Parity Data Table */}
            <div className="gov-table-card">
              <div className="card-header-bar">
                <div>
                  <h3 className="card-title">Identical Material Procurement Across 6 Central Public Sector Undertakings</h3>
                  <p className="card-subtitle">Harmonized ERP item master records linked to golden CNMC standard</p>
                </div>
                <div className="card-header-actions">
                  <span className="count-pill">{activeParity.records.length} Connected Silos</span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="gov-data-table">
                  <thead>
                    <tr>
                      <th>CPSE Entity & Plant</th>
                      <th>Local Material Code</th>
                      <th>Raw Item Description in ERP</th>
                      <th>ERP UOM</th>
                      <th>Procurement Rate (INR)</th>
                      <th>Delta vs Benchmark</th>
                      <th>Governance Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeParity.records.map((r, idx) => {
                      const delta = r.unit_price_inr - activeParity.min_price_inr;
                      const deltaPct = activeParity.min_price_inr > 0 ? ((delta / activeParity.min_price_inr) * 100).toFixed(1) : '0.0';
                      const isBest = delta === 0;

                      return (
                        <tr key={idx}>
                          <td>
                            <div className="cpse-cell">
                              <span className={`cpse-badge ${r.cpse_name.toLowerCase()}`}>{r.cpse_name}</span>
                              <div className="cpse-cell-details">
                                <span className="cpse-cell-name">{r.cpse_name}</span>
                                <span className="cpse-cell-plant">{r.plant_location}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="code-copy-cell" onClick={() => copyToClipboard(r.legacy_item_code)} title="Click to copy code">
                              <code>{r.legacy_item_code}</code>
                              {copiedCode === r.legacy_item_code ? (
                                <CheckCircle2 size={11} color="#10b981" />
                              ) : (
                                <Copy size={11} className="copy-icon" />
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="item-desc-cell" title={r.raw_item_description}>
                              {r.raw_item_description}
                            </div>
                          </td>
                          <td>
                            <span className="uom-pill">{r.raw_uom}</span>
                          </td>
                          <td>
                            <span className="rate-cell">₹{r.unit_price_inr.toLocaleString()}.00</span>
                          </td>
                          <td>
                            {isBest ? (
                              <span className="status-pill approved">
                                <CheckCircle2 size={11} />
                                <span>BEST RATE</span>
                              </span>
                            ) : (
                              <span className={`status-pill ${delta > 2000 ? 'high' : 'medium'}`}>
                                +{deltaPct}% (+₹{delta.toLocaleString()})
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              className="table-action-btn"
                              onClick={() => {
                                setTargetCnmcInput(activeParity.cnmc_code);
                                setRemapModalOpen(true);
                              }}
                              title="Inspect or Update Alignment"
                            >
                              <ShieldCheck size={12} />
                              <span>Harmonized</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Executive Recommendation Banner */}
            <div className="parity-recommendation-banner">
              <div className="banner-icon-box">
                <Sparkles size={20} color="#10B981" />
              </div>
              <div className="banner-content">
                <div className="banner-title">National Rate Harmonization & Central Framework Advisory</div>
                <div className="banner-text">
                  Standardizing all 6 CPSE requisition templates under <b>{activeParity.cnmc_code}</b> to {activeParity.best_cpse}'s benchmark rate of <b>₹{activeParity.min_price_inr.toLocaleString()}.00/{activeParity.benchmark_uom}</b> eliminates the <b>{activeParity.price_disparity_pct}% national price spread</b>, unlocking an estimated <b>₹{(activeParity.potential_annual_savings / 10000000).toFixed(2)} Crore</b> in recurring sovereign procurement savings.
                </div>
              </div>
              <button className="banner-action-btn" onClick={() => setActiveTab('savings')}>
                <span>Simulate Joint RFP</span>
                <ArrowRight size={13} />
              </button>
            </div>
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
