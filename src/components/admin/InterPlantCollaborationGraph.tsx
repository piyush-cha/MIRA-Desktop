import React, { useState, useEffect } from 'react';
import { 
  Network, ArrowRightLeft, ShieldCheck, Zap, PackageCheck, 
  Building2, Layers, AlertCircle, TrendingDown, ArrowRight, RefreshCw, Send, CheckCircle2
} from 'lucide-react';
import { api, getApiErrorMessage } from '../../api/client';

interface InterPlantCollaborationGraphProps {
  cpseName: string;
}

export const InterPlantCollaborationGraph: React.FC<InterPlantCollaborationGraphProps> = ({ cpseName }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Transfer Modal State
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [selectedSourcePlant, setSelectedSourcePlant] = useState<string>('6001-SECL-GEV');
  const [selectedTargetPlant, setSelectedTargetPlant] = useState<string>('5001-HAR');
  const [materialCodeInput, setMaterialCodeInput] = useState<string>('CNMC-MEC-VLV-002150');
  const [transferQty, setTransferQty] = useState<number>(15);
  const [transferUrgency, setTransferUrgency] = useState<string>('CRITICAL');
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [submittingTransfer, setSubmittingTransfer] = useState<boolean>(false);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInterPlantCollaborationGraph(cpseName);
      setData(res);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [cpseName]);

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTransfer(true);
    setTransferSuccess(null);
    try {
      const res = await api.triggerInterPlantTransfer(cpseName, {
        source_plant: selectedSourcePlant,
        target_plant: selectedTargetPlant,
        material_code: materialCodeInput,
        quantity: transferQty,
        uom: 'NOS',
        urgency: transferUrgency,
      });
      setTransferSuccess(res.message);
      setTimeout(() => {
        setTransferModalOpen(false);
        setTransferSuccess(null);
        fetchGraphData();
      }, 2000);
    } catch (err) {
      alert(`Transfer request failed: ${getApiErrorMessage(err)}`);
    } finally {
      setSubmittingTransfer(false);
    }
  };

  if (loading) {
    return (
      <div className="section-block" style={{ padding: '40px', textAlign: 'center' }}>
        <RefreshCw size={20} className="spinning" color="#3b82f6" />
        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Loading Inter-Plant Collaboration Graph...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={18} color="#2563eb" />
            <span>Inter-Plant & Inter-CPSE Collaboration Canvas (Node-to-Node Cards)</span>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Live card-to-card connections showing active surplus stock sharing, joint demand aggregation & emergency material transfers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="gov-btn primary" onClick={() => setTransferModalOpen(true)}>
            <ArrowRightLeft size={14} />
            <span>Request Surplus Transfer</span>
          </button>
          <button className="gov-refresh-btn" onClick={fetchGraphData} title="Refresh Network">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Interactive Card-to-Card Grid */}
      <div className="panel-card" style={{ padding: '20px', background: '#090D16', border: '1px solid #1E293B', borderRadius: '12px', position: 'relative' }}>
        {/* Network Metrics Top Overlay */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #1E293B' }}>
          <div style={{ color: '#F8FAFC', fontSize: '12px' }}>
            <span style={{ color: '#94A3B8' }}>Active Plant Nodes:</span> <b>{data?.nodes?.length || 4} Cards</b>
          </div>
          <div style={{ color: '#F8FAFC', fontSize: '12px' }}>
            <span style={{ color: '#94A3B8' }}>Connected Transfer Corridors:</span> <b style={{ color: '#10B981' }}>{data?.links?.length || 3} Active</b>
          </div>
          <div style={{ color: '#F8FAFC', fontSize: '12px' }}>
            <span style={{ color: '#94A3B8' }}>Annual Inter-Plant Savings:</span> <b style={{ color: '#F59E0B' }}>₹59.3 Lakhs</b>
          </div>
        </div>

        {/* Card-to-Card Canvas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', position: 'relative' }}>
          {data?.nodes?.map((node: any) => (
            <div key={node.id} style={{ 
              background: '#0F172A', 
              border: `1.5px solid ${node.color || '#334155'}`, 
              borderRadius: '10px', 
              padding: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{node.cpse}</div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginTop: '2px' }}>{node.title}</h4>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#60A5FA', marginTop: '1px' }}>{node.code}</div>
                </div>
                <span className="status-pill" style={{ background: node.health === 'Optimal' ? '#064E3B' : '#78350F', color: node.health === 'Optimal' ? '#6EE7B7' : '#FDE68A' }}>
                  {node.health}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#1E293B', padding: '10px', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>Surplus Items</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{node.surplus_items} Units</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>Surplus Value</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#34D399' }}>{node.surplus_val_inr}</div>
                </div>
              </div>

              <div style={{ fontSize: '11.5px', color: '#CBD5E1' }}>
                <span style={{ color: '#94A3B8' }}>Shared Demand Pool:</span> <b>{node.demand_pool}</b>
              </div>

              <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#64748B' }}>Node ID: {node.id}</span>
                <button 
                  style={{ background: 'transparent', border: '1px solid #334155', color: '#93C5FD', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedSourcePlant(node.code);
                    setTransferModalOpen(true);
                  }}
                >
                  Initiate Transfer →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Active Inter-Plant Corridor Connections */}
        <div style={{ marginTop: '24px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#F8FAFC', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="#F59E0B" />
            <span>Active Card-to-Card Transfer Corridors</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data?.links?.map((link: any) => (
              <div key={link.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E293B', padding: '10px 14px', borderRadius: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F8FAFC' }}>
                  <span style={{ background: '#3B82F6', color: '#FFFFFF', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 700 }}>
                    {link.status.replace('_', ' ')}
                  </span>
                  <b>{link.label}</b>
                </div>

                <div style={{ display: 'flex', gap: '16px', color: '#94A3B8', fontSize: '11.5px' }}>
                  <span>Flow: <b style={{ color: '#E2E8F0' }}>{link.flow_rate}</b></span>
                  <span>Est. Savings: <b style={{ color: '#34D399' }}>{link.savings_inr}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transfer Request Modal */}
      {transferModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRightLeft size={18} color="#2563eb" />
                <h3>Request Inter-Plant Surplus Stock Transfer</h3>
              </div>
              <button onClick={() => setTransferModalOpen(false)} className="close-btn">×</button>
            </div>

            <form onSubmit={handleTransferSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {transferSuccess ? (
                  <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', padding: '14px', borderRadius: '6px', color: '#15803D', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <CheckCircle2 size={16} />
                    <span>{transferSuccess}</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label className="sap-field-label">Source Plant (Providing Stock):</label>
                        <select className="gov-select" style={{ width: '100%' }} value={selectedSourcePlant} onChange={e => setSelectedSourcePlant(e.target.value)}>
                          <option value="6001-SECL-GEV">6001-SECL-GEV (Gevra Open Cast)</option>
                          <option value="6002-BCCL-JHA">6002-BCCL-JHA (Jharia Washery)</option>
                          <option value="5001-HAR">5001-HAR (BHEL Haridwar)</option>
                          <option value="3001-BHI">3001-BHI (SAIL Bhilai)</option>
                        </select>
                      </div>

                      <div>
                        <label className="sap-field-label">Target Plant (Receiving Stock):</label>
                        <select className="gov-select" style={{ width: '100%' }} value={selectedTargetPlant} onChange={e => setSelectedTargetPlant(e.target.value)}>
                          <option value="5001-HAR">5001-HAR (BHEL Haridwar)</option>
                          <option value="6001-SECL-GEV">6001-SECL-GEV (SECL Gevra)</option>
                          <option value="6002-BCCL-JHA">6002-BCCL-JHA (BCCL Jharia)</option>
                          <option value="3001-BHI">3001-BHI (SAIL Bhilai)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="sap-field-label">CNMC Golden / Material Code:</label>
                      <input type="text" className="gov-search-input" style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px' }} value={materialCodeInput} onChange={e => setMaterialCodeInput(e.target.value)} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label className="sap-field-label">Transfer Quantity:</label>
                        <input type="number" className="gov-search-input" style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px' }} value={transferQty} onChange={e => setTransferQty(Number(e.target.value))} required />
                      </div>

                      <div>
                        <label className="sap-field-label">Urgency Tier:</label>
                        <select className="gov-select" style={{ width: '100%' }} value={transferUrgency} onChange={e => setTransferUrgency(e.target.value)}>
                          <option value="CRITICAL">CRITICAL (Zero Inventory Risk)</option>
                          <option value="HIGH">HIGH (Prevent Breakdown)</option>
                          <option value="NORMAL">NORMAL (Scheduled Buffer Sync)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="gov-btn secondary" onClick={() => setTransferModalOpen(false)}>Cancel</button>
                <button type="submit" className="gov-btn primary" disabled={submittingTransfer}>
                  {submittingTransfer ? <RefreshCw size={13} className="spinning" /> : <Send size={13} />}
                  <span>{submittingTransfer ? 'Dispatching Request...' : 'Confirm Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
