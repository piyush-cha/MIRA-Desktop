import React, { useState, useRef } from 'react';



import { 



  Database, GitBranch, Cpu, ShieldCheck, CheckCircle2, ArrowRight,



  Plus, RotateCcw, ZoomIn, ZoomOut, Maximize2, Building2, Tag,



  Layers, Sliders, Sparkles, Activity, Link2, ExternalLink, X, Copy, Check



} from 'lucide-react';







export interface InterCpseNode {



  id: string;



  nodeNumber: string;



  type: 'cpse_source' | 'normalization' | 'ai_matcher' | 'governance' | 'cnmc_golden' | 'inter_cpse_pool';



  title: string;



  subtitle: string;



  code: string;



  cpseCode?: string;



  stage: string;



  metricLabel: string;



  metricValue: string;



  status: 'active' | 'synced' | 'pending' | 'optimal' | 'breach';



  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'rose';



  position: { x: number; y: number };



  inputs: number;



  outputs: number;



  rawDetails?: any;



}







export interface InterCpseConnection {



  id: string;



  from: string;



  to: string;



  label?: string;



  animated?: boolean;



  color?: string;



}







const NODE_WIDTH = 230;



const NODE_HEIGHT = 135;







// Color maps for node styling (crisp solid enterprise theme without blur)



const colorTheme: Record<string, {



  border: string;



  badgeBg: string;



  badgeText: string;



  headerBar: string;



  glow: string;



  pin: string;



}> = {



  blue: {



    border: '#3b82f6',



    badgeBg: '#1e3a8a',



    badgeText: '#93c5fd',



    headerBar: '#2563eb',



    glow: 'rgba(37, 99, 235, 0.35)',



    pin: '#60a5fa',



  },



  emerald: {



    border: '#10b981',



    badgeBg: '#064e3b',



    badgeText: '#a7f3d0',



    headerBar: '#059669',



    glow: 'rgba(16, 185, 129, 0.35)',



    pin: '#34d399',



  },



  amber: {



    border: '#f59e0b',



    badgeBg: '#78350f',



    badgeText: '#fde68a',



    headerBar: '#d97706',



    glow: 'rgba(217, 119, 6, 0.35)',



    pin: '#fbbf24',



  },



  purple: {



    border: '#a855f7',



    badgeBg: '#581c87',



    badgeText: '#e9d5ff',



    headerBar: '#9333ea',



    glow: 'rgba(147, 51, 234, 0.35)',



    pin: '#c084fc',



  },



  cyan: {



    border: '#06b6d4',



    badgeBg: '#164e63',



    badgeText: '#a5f3fc',



    headerBar: '#0891b2',



    glow: 'rgba(8, 145, 178, 0.35)',



    pin: '#22d3ee',



  },



  rose: {



    border: '#f43f5e',



    badgeBg: '#881337',



    badgeText: '#fecdd3',



    headerBar: '#e11d48',



    glow: 'rgba(225, 29, 72, 0.35)',



    pin: '#fb7185',



  }



};







// Preset Scenarios for Inter-CPSE Mapping



const PRESET_SCENARIOS: Record<string, { nodes: InterCpseNode[]; connections: InterCpseConnection[] }> = {



  'valves': {



    nodes: [



      {



        id: 'node-ongc',



        nodeNumber: '01',



        type: 'cpse_source',



        title: 'ONGC Hazira Plant',



        subtitle: 'Ball Valve 2" Cl.150 Flanged',



        code: 'VLV-BL-2-150-FLG',



        cpseCode: 'ONGC',



        stage: 'ERP SOURCE',



        metricLabel: 'Procurement Rate',



        metricValue: '₹14,200 / NOS',



        status: 'synced',



        color: 'blue',



        position: { x: 30, y: 40 },



        inputs: 0,



        outputs: 1,



      },



      {



        id: 'node-iocl',



        nodeNumber: '02',



        type: 'cpse_source',



        title: 'IOCL Mathura Refinery',



        subtitle: 'Ball Valve 50mm Class 150 RF',



        code: 'VALV-BALL-50MM-150#',



        cpseCode: 'IOCL',



        stage: 'ERP SOURCE',



        metricLabel: 'Procurement Rate',



        metricValue: '₹12,800 / Unit (Lowest)',



        status: 'optimal',



        color: 'blue',



        position: { x: 30, y: 210 },



        inputs: 0,



        outputs: 1,



      },



      {



        id: 'node-bhel',



        nodeNumber: '03',



        type: 'cpse_source',



        title: 'BHEL Haridwar Unit',



        subtitle: '2" 150# Floating Ball Valve',



        code: 'BHEL-MEC-BV-002',



        cpseCode: 'BHEL',



        stage: 'ERP SOURCE',



        metricLabel: 'Procurement Rate',



        metricValue: '₹15,100 / NOS',



        status: 'synced',



        color: 'blue',



        position: { x: 30, y: 380 },



        inputs: 0,



        outputs: 1,



      },



      {



        id: 'node-sail',



        nodeNumber: '04',



        type: 'cpse_source',



        title: 'SAIL Bhilai Steel',



        subtitle: 'Valve Ball 2 In 150 Lb WCB',



        code: 'SAIL-BSP-VLV-2',



        cpseCode: 'SAIL',



        stage: 'ERP SOURCE',



        metricLabel: 'Procurement Rate',



        metricValue: '₹16,500 / NOS (Highest)',



        status: 'breach',



        color: 'blue',



        position: { x: 30, y: 550 },



        inputs: 0,



        outputs: 1,



      },



      // Intermediate Harmonization Pipeline Stages



      {



        id: 'node-norm',



        nodeNumber: '05',



        type: 'normalization',



        title: 'UOM & Spec Normalizer',



        subtitle: 'ISO Standardization & Flange Map',



        code: 'STAGE: SPEC_NORM',



        stage: 'TRANSFORM',



        metricLabel: 'Normalized Standard',



        metricValue: 'ASME B16.5 / Cl.150 RF',



        status: 'active',



        color: 'purple',



        position: { x: 340, y: 120 },



        inputs: 2,



        outputs: 1,



      },



      {



        id: 'node-matcher',



        nodeNumber: '06',



        type: 'ai_matcher',



        title: 'AI Semantic Vector Matcher',



        subtitle: 'Taxonomy Embedding Similarity',



        code: 'ENGINE: COSINE_EMBED',



        stage: 'AI HARMONIZATION',



        metricLabel: 'Confidence Score',



        metricValue: '98.4% Match Equivalence',



        status: 'active',



        color: 'cyan',



        position: { x: 340, y: 460 },



        inputs: 2,



        outputs: 1,



      },



      {



        id: 'node-gov',



        nodeNumber: '07',



        type: 'governance',



        title: 'Zero-Trust Policy Gate',



        subtitle: 'DPE Compliance & SHA-256 Audit',



        code: 'RULE: POL_STRICT_UOM',



        stage: 'GOVERNANCE',



        metricLabel: 'Integrity Seal',



        metricValue: 'Enforced & Tamper-Evident',



        status: 'active',



        color: 'amber',



        position: { x: 650, y: 290 },



        inputs: 2,



        outputs: 2,



      },



      // Sovereign Golden Output Nodes



      {



        id: 'node-cnmc-golden',



        nodeNumber: '08',



        type: 'cnmc_golden',



        title: 'MIRA Sovereign Standard',



        subtitle: '2-Inch Flanged Ball Valve WCB 150#',



        code: 'MIRA-MEC-VLV-002150',



        stage: 'SOVEREIGN GOLDEN',



        metricLabel: 'Master National Benchmark',



        metricValue: '₹13,500.00 / Unit',



        status: 'optimal',



        color: 'emerald',



        position: { x: 960, y: 150 },



        inputs: 1,



        outputs: 1,



      },



      {



        id: 'node-pool',



        nodeNumber: '09',



        type: 'inter_cpse_pool',



        title: 'Inter-CPSE Parity Pool',



        subtitle: 'Cross-CPSE Benchmark & Inventory',



        code: 'DISTRIBUTOR: 4 CPSEs',



        stage: 'COLLABORATION',



        metricLabel: 'Arbitrage Opportunity',



        metricValue: '₹3,700 / unit (₹1.54 Cr/yr)',



        status: 'active',



        color: 'emerald',



        position: { x: 960, y: 430 },



        inputs: 1,



        outputs: 0,



      },



    ],



    connections: [



      { id: 'c1', from: 'node-ongc', to: 'node-norm', color: '#60a5fa' },



      { id: 'c2', from: 'node-iocl', to: 'node-norm', color: '#60a5fa' },



      { id: 'c3', from: 'node-bhel', to: 'node-matcher', color: '#60a5fa' },



      { id: 'c4', from: 'node-sail', to: 'node-matcher', color: '#60a5fa' },



      { id: 'c5', from: 'node-norm', to: 'node-gov', color: '#c084fc' },



      { id: 'c6', from: 'node-matcher', to: 'node-gov', color: '#22d3ee' },



      { id: 'c7', from: 'node-gov', to: 'node-cnmc-golden', color: '#10b981' },



      { id: 'c8', from: 'node-gov', to: 'node-pool', color: '#10b981' },



    ]



  },



  'bearings': {



    nodes: [



      {



        id: 'node-bhel-brg',



        nodeNumber: '01',



        type: 'cpse_source',



        title: 'BHEL Heavy Plant',



        subtitle: 'Spherical Roller Bearing 22220',



        code: 'BHEL-BRG-22220E',



        cpseCode: 'BHEL',



        stage: 'ERP SOURCE',



        metricLabel: 'Procurement Rate',



        metricValue: '₹12,450 / Unit',



        status: 'synced',



        color: 'blue',



        position: { x: 40, y: 80 },



        inputs: 0,



        outputs: 1,



      },



      {



        id: 'node-ntpc-brg',



        nodeNumber: '02',



        type: 'cpse_source',



        title: 'NTPC Thermal Unit',



        subtitle: 'Bearing Roller 22220-E1-K',



        code: 'NTPC-MECH-BRG-22',



        cpseCode: 'NTPC',



        stage: 'ERP SOURCE',



        metricLabel: 'Procurement Rate',



        metricValue: '₹11,900 / Unit',



        status: 'optimal',



        color: 'blue',



        position: { x: 40, y: 300 },



        inputs: 0,



        outputs: 1,



      },



      {



        id: 'node-cil-brg',



        nodeNumber: '03',



        type: 'cpse_source',



        title: 'Coal India Mining',



        subtitle: 'Roller Bearing 22220-C3',



        code: 'CIL-HEMM-22220',



        cpseCode: 'COALINDIA',



        stage: 'ERP SOURCE',



        metricLabel: 'Procurement Rate',



        metricValue: '₹14,200 / Unit',



        status: 'breach',



        color: 'blue',



        position: { x: 40, y: 520 },



        inputs: 0,



        outputs: 1,



      },



      {



        id: 'node-align-brg',



        nodeNumber: '04',



        type: 'ai_matcher',



        title: 'Dimensional Vector Equivalence',



        subtitle: 'Bore 100mm, OD 180mm, Width 46mm',



        code: 'ISO: 15-1998',



        stage: 'AI HARMONIZATION',



        metricLabel: 'Mechanical Parity',



        metricValue: '100% Direct Replacement',



        status: 'active',



        color: 'cyan',



        position: { x: 420, y: 260 },



        inputs: 3,



        outputs: 1,



      },



      {



        id: 'node-golden-brg',



        nodeNumber: '05',



        type: 'cnmc_golden',



        title: 'CNMC Golden Standard',



        subtitle: 'Spherical Roller Bearing 22220-E1-K-C3',



        code: 'MIRA-MEC-BRG-222',



        stage: 'SOVEREIGN GOLDEN',



        metricLabel: 'National Benchmark',



        metricValue: '₹12,150.00 / Unit',



        status: 'optimal',



        color: 'emerald',



        position: { x: 860, y: 260 },



        inputs: 1,



        outputs: 0,



      }



    ],



    connections: [



      { id: 'b1', from: 'node-bhel-brg', to: 'node-align-brg', color: '#60a5fa' },



      { id: 'b2', from: 'node-ntpc-brg', to: 'node-align-brg', color: '#60a5fa' },



      { id: 'b3', from: 'node-cil-brg', to: 'node-align-brg', color: '#60a5fa' },



      { id: 'b4', from: 'node-align-brg', to: 'node-golden-brg', color: '#10b981' },



    ]



  }



};







interface InterCpseNodePipelineProps {



  onSelectNode: (node: any) => void;



  selectedNodeId?: string | null;



  onOpenRemapModal?: (node?: InterCpseNode) => void;



}







export const InterCpseNodePipeline: React.FC<InterCpseNodePipelineProps> = ({ 



  onSelectNode, 



  selectedNodeId,



  onOpenRemapModal 



}) => {



  const [selectedScenario, setSelectedScenario] = useState<string>('valves');



  const [nodes, setNodes] = useState<InterCpseNode[]>(PRESET_SCENARIOS['valves'].nodes);



  const [connections, setConnections] = useState<InterCpseConnection[]>(PRESET_SCENARIOS['valves'].connections);



  const [zoomLevel, setZoomLevel] = useState<number>(1);



  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);







  const canvasRef = useRef<HTMLDivElement>(null);







  // Node inspection state & clipboard feedback



  const [inspectingNode, setInspectingNode] = useState<InterCpseNode | null>(null);



  const [copiedCode, setCopiedCode] = useState<string | null>(null);







  const handleCopyCode = (code: string) => {



    navigator.clipboard.writeText(code);



    setCopiedCode(code);



    setTimeout(() => setCopiedCode(null), 2000);



  };







  const handleNodeClick = (node: InterCpseNode) => {



    setInspectingNode(node);



    const theme = colorTheme[node.color] || colorTheme.blue;



    onSelectNode({



      id: node.id,



      label: node.code,



      name: node.title,



      node_type: node.type === 'cpse_source' ? 'CPSE' : node.type === 'cnmc_golden' ? 'CNMC_GOLDEN' : 'LEGACY_MATERIAL',



      cpse_code: node.cpseCode,



      category: node.subtitle,



      unit_price_inr: parseFloat(node.metricValue.replace(/[^0-9.]/g, '')) || undefined,



      confidence_score: 0.984,



      mapping_status: node.status === 'optimal' || node.status === 'synced' ? 'APPROVED' : 'SUGGESTED',



      color: theme.headerBar,



    });



  };







  // Switch scenario



  const handleScenarioChange = (scenarioKey: string) => {



    setSelectedScenario(scenarioKey);



    const scenario = PRESET_SCENARIOS[scenarioKey];



    if (scenario) {



      setNodes(scenario.nodes);



      setConnections(scenario.connections);



    }



  };







  // Smooth, reliable drag tracking with window event attachment (never gets stuck)



  const handleNodePointerDown = (nodeId: string, e: React.PointerEvent) => {



    if (e.button !== 0) return; // Left-click only



    e.stopPropagation();







    const node = nodes.find((n) => n.id === nodeId);



    if (!node) return;







    let hasDragged = false;



    const startX = e.clientX;



    const startY = e.clientY;



    const nodeStartX = node.position.x;



    const nodeStartY = node.position.y;







    const onPointerMove = (moveEvent: PointerEvent) => {



      const dx = (moveEvent.clientX - startX) / zoomLevel;



      const dy = (moveEvent.clientY - startY) / zoomLevel;







      // Only enter dragging mode if moved > 5 pixels



      if (!hasDragged && Math.hypot(dx, dy) > 5) {



        hasDragged = true;



        setDraggingNodeId(nodeId);



      }







      if (hasDragged) {



        const newX = Math.max(10, Math.round(nodeStartX + dx));



        const newY = Math.max(10, Math.round(nodeStartY + dy));



        setNodes((prev) =>



          prev.map((n) => (n.id === nodeId ? { ...n, position: { x: newX, y: newY } } : n))



        );



      }



    };







    const onPointerUp = () => {



      window.removeEventListener('pointermove', onPointerMove);



      window.removeEventListener('pointerup', onPointerUp);



      window.removeEventListener('pointercancel', onPointerUp);







      setDraggingNodeId(null);







      // If released without significant dragging, it is an intentional click!



      if (!hasDragged) {



        const clickedNode = nodes.find((n) => n.id === nodeId);



        if (clickedNode) {



          handleNodeClick(clickedNode);



        }



      }



    };







    window.addEventListener('pointermove', onPointerMove);



    window.addEventListener('pointerup', onPointerUp);



    window.addEventListener('pointercancel', onPointerUp);



  };







  // Add new Custom Pipeline Node



  const handleAddNode = () => {



    const newId = `node-custom-${Date.now().toString().slice(-4)}`;



    const lastNode = nodes[nodes.length - 1];



    const newNode: InterCpseNode = {



      id: newId,



      nodeNumber: String(nodes.length + 1).padStart(2, '0'),



      type: 'ai_matcher',



      title: 'Custom Inter-CPSE Mapping',



      subtitle: 'Manual Harmonization Link',



      code: `MAP-${Date.now().toString().slice(-6)}`,



      stage: 'CUSTOM MAPPING',



      metricLabel: 'Verification',



      metricValue: 'Pending Review',



      status: 'pending',



      color: 'amber',



      position: {



        x: Math.round((lastNode?.position.x || 300) + 60),



        y: Math.round((lastNode?.position.y || 200) + 60),



      },



      inputs: 1,



      outputs: 1,



    };







    setNodes((prev) => [...prev, newNode]);



    if (lastNode) {



      setConnections((prev) => [



        ...prev,



        { id: `c-custom-${Date.now()}`, from: lastNode.id, to: newNode.id, color: '#fbbf24' }



      ]);



    }



  };







  // Reset positions



  const handleResetLayout = () => {



    const scenario = PRESET_SCENARIOS[selectedScenario];



    if (scenario) {



      setNodes(scenario.nodes);



      setConnections(scenario.connections);



      setZoomLevel(1);



    }



  };







  // Calculate canvas dimensions dynamically with safety margin



  const maxX = Math.max(...nodes.map((n) => n.position.x + NODE_WIDTH + 140), 1300);



  const maxY = Math.max(...nodes.map((n) => n.position.y + NODE_HEIGHT + 140), 800);







  return (



    <div className="pipeline-canvas-wrapper">



      {/* Control Bar */}



      <div className="pipeline-control-bar">



        <div className="pipeline-bar-left">



          <div className="pipeline-status-pill">



            <span className="pipeline-pulse-dot" />



            <span>INTER-CPSE HARMONIZATION PIPELINE: ACTIVE</span>



          </div>







          <div className="pipeline-scenario-select-wrap">



            <span className="pipeline-bar-label">COMMODITY DOMAIN:</span>



            <select 



              className="pipeline-scenario-select"



              value={selectedScenario}



              onChange={(e) => handleScenarioChange(e.target.value)}



            >



              <option value="valves">2" Ball Valves (ASME B16.5 Cl.150) — ONGC, IOCL, BHEL, SAIL</option>



              <option value="bearings">Spherical Roller Bearings 22220 — BHEL, NTPC, CIL</option>



            </select>



          </div>



        </div>







        <div className="pipeline-bar-right">



          <div className="pipeline-zoom-group">



            <button 



              className="pipeline-icon-btn" 



              onClick={() => setZoomLevel((z) => Math.max(0.65, parseFloat((z - 0.1).toFixed(2))))} 



              title="Zoom Out"



            >



              <ZoomOut size={14} />



            </button>



            <span className="pipeline-zoom-label">{Math.round(zoomLevel * 100)}%</span>



            <button 



              className="pipeline-icon-btn" 



              onClick={() => setZoomLevel((z) => Math.min(1.4, parseFloat((z + 0.1).toFixed(2))))} 



              title="Zoom In"



            >



              <ZoomIn size={14} />



            </button>



          </div>







          <button 



            className="pipeline-bar-btn secondary" 



            onClick={handleResetLayout} 



            title="Reset to Default Node Alignment"



          >



            <RotateCcw size={13} />



            <span>Reset Grid</span>



          </button>







          <button 



            className="pipeline-bar-btn primary" 



            onClick={handleAddNode} 



            title="Insert Custom Inter-CPSE Mapping Node"



          >



            <Plus size={14} />



            <span>Add Node</span>



          </button>



        </div>



      </div>







      {/* Studio Canvas Viewport */}



      <div 



        ref={canvasRef}



        className="pipeline-canvas-viewport"



      >



        <div 



          className="pipeline-canvas-content"



          style={{



            width: maxX,



            height: maxY,



            transform: `scale(${zoomLevel})`,



            transformOrigin: 'top left',



          }}



        >



          {/* Background Grid Pattern */}



          <svg className="pipeline-grid-layer" width={maxX} height={maxY}>



            <defs>



              <pattern id="pipeline-grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">



                <circle cx="2" cy="2" r="1" fill="rgba(148, 163, 184, 0.18)" />



              </pattern>



            </defs>



            <rect width="100%" height="100%" fill="url(#pipeline-grid-pattern)" />



          </svg>







          {/* SVG Connection Cables */}



          <svg className="pipeline-connections-layer" width={maxX} height={maxY}>



            <defs>



              {/* Illuminated Arrowhead Markers attached directly to destination pin */}



              <marker



                id="cable-arrow-blue"



                viewBox="0 0 10 10"



                refX="8"



                refY="5"



                markerWidth="6"



                markerHeight="6"



                orient="auto-start-reverse"



              >



                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#60a5fa" />



              </marker>







              <marker



                id="cable-arrow-green"



                viewBox="0 0 10 10"



                refX="8"



                refY="5"



                markerWidth="6"



                markerHeight="6"



                orient="auto-start-reverse"



              >



                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#34d399" />



              </marker>







              <marker



                id="cable-arrow-amber"



                viewBox="0 0 10 10"



                refX="8"



                refY="5"



                markerWidth="6"



                markerHeight="6"



                orient="auto-start-reverse"



              >



                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#fbbf24" />



              </marker>







              <marker



                id="cable-arrow-purple"



                viewBox="0 0 10 10"



                refX="8"



                refY="5"



                markerWidth="6"



                markerHeight="6"



                orient="auto-start-reverse"



              >



                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#c084fc" />



              </marker>







              <marker



                id="cable-arrow-cyan"



                viewBox="0 0 10 10"



                refX="8"



                refY="5"



                markerWidth="6"



                markerHeight="6"



                orient="auto-start-reverse"



              >



                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#22d3ee" />



              </marker>



            </defs>







            {connections.map((c) => {



              const fromNode = nodes.find((n) => n.id === c.from);



              const toNode = nodes.find((n) => n.id === c.to);



              if (!fromNode || !toNode) return null;







              // Output pin of source node (exact right center)



              const startX = Math.round(fromNode.position.x + NODE_WIDTH);



              const startY = Math.round(fromNode.position.y + NODE_HEIGHT / 2);







              // Input pin of target node (exact left center)



              const endX = Math.round(toNode.position.x);



              const endY = Math.round(toNode.position.y + NODE_HEIGHT / 2);







              // Adaptive bezier curvature



              let cp1X: number;



              let cp1Y = startY;



              let cp2X: number;



              let cp2Y = endY;







              if (endX >= startX + 20) {



                // Forward direction: smooth S-curve



                const curvature = Math.max(Math.min(Math.abs(endX - startX) * 0.5, 220), 40);



                cp1X = Math.round(startX + curvature);



                cp2X = Math.round(endX - curvature);



              } else {



                // Backward or overlapping: curve outward around the card



                const loop = Math.max(60, Math.round(Math.abs(endY - startY) * 0.35));



                cp1X = Math.round(startX + loop);



                cp2X = Math.round(endX - loop);



              }







              const pathString = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;



              const strokeColor = c.color || '#60a5fa';







              const markerId = 



                strokeColor === '#10b981' || strokeColor === '#34d399' ? 'cable-arrow-green' :



                strokeColor === '#fbbf24' || strokeColor === '#f59e0b' ? 'cable-arrow-amber' :



                strokeColor === '#c084fc' || strokeColor === '#a855f7' ? 'cable-arrow-purple' :



                strokeColor === '#22d3ee' || strokeColor === '#06b6d4' ? 'cable-arrow-cyan' :



                'cable-arrow-blue';







              return (



                <g key={c.id} className="pipeline-cable-group">



                  {/* Outer glow track */}



                  <path



                    d={pathString}



                    fill="none"



                    stroke={strokeColor}



                    strokeWidth={6}



                    strokeOpacity={0.12}



                    strokeLinecap="round"



                  />



                  {/* Core Bezier Cable Line with direct arrowhead marker */}



                  <path



                    d={pathString}



                    fill="none"



                    stroke={strokeColor}



                    strokeWidth={2.2}



                    strokeDasharray="6,4"



                    strokeLinecap="round"



                    markerEnd={`url(#${markerId})`}



                    className="pipeline-cable-path"



                  />



                  {/* Midpoint flow pulse marker */}



                  <circle



                    cx={Math.round((startX + endX) / 2)}



                    cy={Math.round((startY + endY) / 2)}



                    r={3.5}



                    fill={strokeColor}



                    className="pipeline-pulse-dot"



                  />



                </g>



              );



            })}



          </svg>







          {/* Interactive Mapping Nodes */}



          {nodes.map((node) => {



            const isSelected = selectedNodeId === node.id || inspectingNode?.id === node.id;



            const theme = colorTheme[node.color] || colorTheme.blue;



            const isDragging = draggingNodeId === node.id;







            return (



              <div



                key={node.id}



                onPointerDown={(e) => handleNodePointerDown(node.id, e)}



                onContextMenu={(e) => e.preventDefault()}



                style={{



                  position: 'absolute',



                  left: `${node.position.x}px`,



                  top: `${node.position.y}px`,



                  width: `${NODE_WIDTH}px`,



                  cursor: isDragging ? 'grabbing' : 'grab',



                  zIndex: isSelected ? 30 : isDragging ? 25 : 10,



                  touchAction: 'none',



                }}



                className="pipeline-node-card-wrapper"



              >



                <div 



                  className={`pipeline-node-card ${isSelected ? 'selected' : ''}`}



                  style={{



                    boxShadow: isSelected 



                      ? `0 0 0 2px ${theme.border}, 0 10px 25px rgba(0, 0, 0, 0.7)`



                      : `0 3px 12px rgba(0, 0, 0, 0.45)`,



                  }}



                >



                  {/* Top colored node indicator bar */}



                  <div 



                    className="pipeline-node-header-bar"



                    style={{ backgroundColor: theme.headerBar }}



                  >



                    <span className="pipeline-node-idx">{node.nodeNumber}</span>



                    <span className="pipeline-node-stage-tag">{node.stage}</span>



                    <span className="pipeline-node-type-dot" style={{ backgroundColor: theme.pin }} />



                  </div>







                  {/* Node Content */}



                  <div className="pipeline-node-body">



                    {/* Header line */}



                    <div className="pipeline-node-title-row">



                      <div className="pipeline-node-icon-box" style={{ borderColor: theme.border }}>



                        {node.type === 'cpse_source' ? (



                          <Building2 size={13} color={theme.pin} />



                        ) : node.type === 'cnmc_golden' ? (



                          <Sparkles size={13} color="#10b981" />



                        ) : node.type === 'governance' ? (



                          <ShieldCheck size={13} color="#f59e0b" />



                        ) : (



                          <Cpu size={13} color={theme.pin} />



                        )}



                      </div>







                      <div className="pipeline-node-names">



                        <div className="pipeline-node-title" title={node.title}>{node.title}</div>



                        <div className="pipeline-node-subtitle" title={node.subtitle}>{node.subtitle}</div>



                      </div>



                    </div>







                    {/* Code Chip */}



                    <div className="pipeline-node-code-row">



                      <code className="pipeline-code-chip" title={node.code}>



                        <Tag size={10} />



                        <span>{node.code}</span>



                      </code>



                      {node.cpseCode && (



                        <span className="pipeline-cpse-badge">{node.cpseCode}</span>



                      )}



                    </div>







                    {/* Metric Row */}



                    <div className="pipeline-node-metric-row">



                      <span className="pipeline-metric-label">{node.metricLabel}</span>



                      <span className="pipeline-metric-val">{node.metricValue}</span>



                    </div>







                    {/* Bottom Status / Connection bar */}



                    <div className="pipeline-node-footer">



                      <span className={`pipeline-status-pill-small ${node.status}`}>



                        {node.status === 'optimal' ? 'OPTIMAL' : node.status === 'breach' ? 'PRICE DELTA' : 'ALIGNED'}



                      </span>



                      <span className="pipeline-footer-hint">Click to inspect</span>



                    </div>



                  </div>







                  {/* Input Pin (Left Green Triangle Port) */}



                  {node.inputs > 0 && (



                    <div className="pipeline-pin input" title={`${node.inputs} Input Connection(s)`}>



                      <span className="pipeline-pin-triangle input" />



                    </div>



                  )}







                  {/* Output Pin (Right Orange Triangle Port) */}



                  {node.outputs > 0 && (



                    <div className="pipeline-pin output" title={`${node.outputs} Output Connection(s)`}>



                      <span className="pipeline-pin-triangle output" />



                    </div>



                  )}



                </div>



              </div>



            );



          })}



        </div>



      </div>







      {/* Footer Stats */}



      <div className="pipeline-footer-stats">



        <div className="pipeline-stat-item">



          <span className="pipeline-stat-dot green" />



          <span><b>{nodes.length}</b> Active Nodes in Pipeline</span>



        </div>



        <div className="pipeline-stat-item">



          <span className="pipeline-stat-dot blue" />



          <span><b>{connections.length}</b> Harmonized Data Links</span>



        </div>



        <div className="pipeline-stat-item">



          <span className="pipeline-stat-dot gold" />



          <span><b>6</b> Connected CPSE Silos</span>



        </div>



        <div className="pipeline-stat-hint">



          <span>💡 Left-click any node to inspect & remap • Drag nodes to reposition cables</span>



        </div>



      </div>







      {/* Interactive Node Inspector Modal */}



      {inspectingNode && (



        <div className="modal-backdrop" onClick={() => setInspectingNode(null)}>



          <div className="modal-dialog node-inspect-modal" onClick={(e) => e.stopPropagation()}>



            <div className="modal-header">



              <div className="flex items-center gap-2.5">



                <div 



                  className="modal-icon-badge" 



                  style={{ 



                    backgroundColor: colorTheme[inspectingNode.color]?.badgeBg || '#1e3a8a',



                    width: '36px', height: '36px', borderRadius: '6px',



                    display: 'flex', alignItems: 'center', justifyContent: 'center'



                  }}



                >



                  <Building2 size={18} color={colorTheme[inspectingNode.color]?.pin || '#60a5fa'} />



                </div>



                <div>



                  <h3 className="modal-heading" style={{ fontSize: '15px', fontWeight: 700 }}>



                    Node #{inspectingNode.nodeNumber} Inspector



                  </h3>



                  <p className="modal-subheading" style={{ fontSize: '11px', color: '#64748B' }}>



                    Inter-CPSE Harmonization Pipeline Specification



                  </p>



                </div>



              </div>



              <button className="close-btn" onClick={() => setInspectingNode(null)} title="Close">



                <X size={18} />



              </button>



            </div>







            <div className="modal-body" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>



              <div 



                className="node-modal-stage-badge" 



                style={{ 



                  backgroundColor: colorTheme[inspectingNode.color]?.badgeBg, 



                  color: colorTheme[inspectingNode.color]?.badgeText 



                }}



              >



                {inspectingNode.stage}



              </div>







              <div>



                <h4 className="node-modal-title">{inspectingNode.title}</h4>



                <p className="node-modal-subtitle">{inspectingNode.subtitle}</p>



              </div>







              <div className="node-modal-specs-grid">



                <div className="node-spec-item">



                  <span className="node-spec-label">Material / Item Code</span>



                  <div className="node-code-copy-row">



                    <code className="node-spec-code">{inspectingNode.code}</code>



                    <button 



                      className="node-copy-btn" 



                      onClick={() => handleCopyCode(inspectingNode.code)}



                      title="Copy Code"



                    >



                      {copiedCode === inspectingNode.code ? <Check size={12} color="#10b981" /> : <Copy size={12} />}



                    </button>



                  </div>



                </div>







                {inspectingNode.cpseCode && (



                  <div className="node-spec-item">



                    <span className="node-spec-label">CPSE Silo Entity</span>



                    <span className="node-spec-val font-semibold">{inspectingNode.cpseCode}</span>



                  </div>



                )}







                <div className="node-spec-item">



                  <span className="node-spec-label">{inspectingNode.metricLabel}</span>



                  <span className="node-spec-val font-mono font-bold text-emerald">{inspectingNode.metricValue}</span>



                </div>







                <div className="node-spec-item">



                  <span className="node-spec-label">Harmonization Status</span>



                  <span className={`status-pill ${inspectingNode.status === 'optimal' ? 'approved' : inspectingNode.status === 'breach' ? 'high' : 'medium'}`}>



                    {inspectingNode.status.toUpperCase()}



                  </span>



                </div>



              </div>



            </div>







            <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>



              <button className="gov-btn secondary" onClick={() => setInspectingNode(null)}>



                Close



              </button>



              {onOpenRemapModal && (



                <button 



                  className="gov-btn primary"



                  onClick={() => {



                    const nodeToRemap = inspectingNode;



                    setInspectingNode(null);



                    onOpenRemapModal(nodeToRemap || undefined);



                  }}



                >



                  <Link2 size={14} />



                  <span>Remap to Golden MIRA</span>



                </button>



              )}



            </div>



          </div>



        </div>



      )}



    </div>



  );



};

