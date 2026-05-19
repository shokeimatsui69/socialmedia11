import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  Search, 
  Filter as FilterIcon, 
  Download, 
  Maximize2, 
  ZoomIn, 
  ZoomOut,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Users,
  Box,
  Zap,
  Target,
  ArrowRight,
  ShieldAlert,
  Activity,
  Globe,
  RefreshCw,
  AlertCircle,
  MoreHorizontal,
  Fingerprint,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import * as d3 from 'd3';
import { NetworkNode, NetworkNodeType, UserIntent, Sentiment } from '../types';

interface D3Node extends d3.SimulationNodeDatum, NetworkNode {}
interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  interactionDensity: number;
  isInferred: boolean;
}

export default function AudienceMap() {
  const { 
    activeClientId, 
    clients, 
    networkNodes: globalNodes, 
    networkEdges: globalEdges, 
    accountHealth: globalHealth, 
    narrativePressure: globalNarrativePressure,
    reviewQueue: globalQueue, 
    intentDistribution: globalIntent,
    activeSession
  } = useStore();

  const networkNodes = activeSession?.networkNodes.length ? activeSession.networkNodes : globalNodes;
  const networkEdges = activeSession?.networkEdges.length ? activeSession.networkEdges : globalEdges;
  const accountHealth = activeSession?.reportMetrics.accountHealthScore ? { status: activeSession.reportMetrics.accountHealthScore > 80 ? 'Stable' : 'Watch', score: activeSession.reportMetrics.accountHealthScore, metrics: { engagementAuthenticity: activeSession.reportMetrics.engagementAuthenticity, narrativeStability: activeSession.reportMetrics.narrativeStability, communityResilience: activeSession.reportMetrics.narrativeStability } } : globalHealth;
  const narrativePressure = activeSession?.reportMetrics.dominantNarratives.length 
    ? { 
        dominantPositive: activeSession.reportMetrics.dominantNarratives[0], 
        dominantNegative: 'None Detected', 
        emergingCriticism: 'Low Density', 
        topDiscussionTrigger: 'Strategic Post Update', 
        recommendation: 'Monitor for engagement sustainment' 
      } 
    : globalNarrativePressure;
  const reviewQueue = activeSession?.reviewQueue.length ? activeSession.reviewQueue : globalQueue;
  const intentDistribution = globalIntent; // Assume global intent for now or map from session if available
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNode, pHoveredNode] = useState<NetworkNode | null>(null);
  const [viewMode, setViewMode] = useState<'Sentiment' | 'Intent' | 'Risk' | 'Reach' | 'Activity'>('Sentiment');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const activeClient = clients.find(c => c.id === activeClientId);
  
  const selectedNode = useMemo(() => 
    networkNodes.find(n => n.id === selectedNodeId),
    [networkNodes, selectedNodeId]
  );

  // Resize observer for full-width map
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver(entries => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: height || 600 });
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // D3 Force Simulation
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes: D3Node[] = JSON.parse(JSON.stringify(networkNodes));
    const links: D3Link[] = networkEdges.map(e => ({
      source: e.source,
      target: e.target,
      interactionDensity: e.interactionDensity,
      isInferred: e.isInferred
    }));

    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force("link", d3.forceLink<D3Node, D3Link>(links).id(d => d.id).distance(l => {
        const source = l.source as D3Node;
        return source.ring === 0 ? 100 : l.isInferred ? 180 : 100;
      }).strength(0.6))
      .force("charge", d3.forceManyBody().strength(d => (d as D3Node).ring === 0 ? -1500 : -400))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collision", d3.forceCollide().radius(d => (d as D3Node).ring === 0 ? 60 : 35).strength(0.8));

    // Strict Ring constraints
    const ringRadii = [0, 180, 350, 500];
    simulation.force("radial", d3.forceRadial<D3Node>(d => ringRadii[d.ring], dimensions.width / 2, dimensions.height / 2).strength(2.0));

    const container = svg.append("g");

    // Add ring guides
    const guides = container.append("g").attr("class", "ring-guides");
    ringRadii.forEach((radius, i) => {
      if (i === 0) return;
      guides.append("circle")
        .attr("cx", dimensions.width / 2)
        .attr("cy", dimensions.height / 2)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "rgba(0, 255, 102, 0.05)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "8,8");
        
      guides.append("text")
        .attr("x", dimensions.width / 2)
        .attr("y", dimensions.height / 2 - radius - 8)
        .attr("fill", "rgba(0, 255, 102, 0.2)")
        .attr("font-size", "9px")
        .attr("font-weight", "black")
        .attr("text-anchor", "middle")
        .text(`RING_0${i}_ORBIT`);
    });

    // Zoom behavior with focus
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Links
    const link = container.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => d.isInferred ? "rgba(0, 255, 102, 0.15)" : "rgba(0, 255, 102, 0.3)")
      .attr("stroke-width", d => d.isInferred ? 1 : 2)
      .attr("stroke-dasharray", d => d.isInferred ? "5,5" : "0")
      .style("filter", d => d.isInferred ? "none" : "drop-shadow(0 0 2px rgba(0,255,102,0.3))");

    // Nodes
    const node = container.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node-group")
      .attr("cursor", "pointer")
      .on("mouseenter", (event, d) => pHoveredNode(d))
      .on("mouseleave", () => pHoveredNode(null))
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
        setIsInspectorOpen(true);
        
        // Focus click: move to center
        const scale = 1.2;
        const x = -(d.x || 0) * scale + dimensions.width / 2;
        const y = -(d.y || 0) * scale + dimensions.height / 2;
        svg.transition()
           .duration(800)
           .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
      })
      .call(d3.drag<SVGGElement, D3Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Node circles with richer styling
    node.append("circle")
      .attr("r", d => d.ring === 0 ? 35 : 10 + (d.influenceScore / 12))
      .attr("fill", d => d.ring === 0 ? "#00FF66" : getNodeColor(d, viewMode))
      .attr("stroke", d => d.ring === 0 ? "rgba(0,255,102,0.5)" : "rgba(0,0,0,0.8)")
      .attr("stroke-width", d => d.ring === 0 ? 8 : 2)
      .attr("class", d => d.ring === 0 ? "center-node" : "")
      .style("filter", d => d.ring === 0 ? "drop-shadow(0 0 15px rgba(0,255,102,0.8))" : "drop-shadow(0 0 5px rgba(0,0,0,0.5))");

    // Add glyphs for certain types
    node.filter(d => d.botLikelihood > 70)
      .append("text")
      .text("!")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "black")
      .attr("font-size", "10px")
      .attr("font-weight", "black");

    node.append("text")
      .text(d => d.handle)
      .attr("x", d => d.ring === 0 ? 45 : 18)
      .attr("y", 4)
      .attr("fill", d => d.ring === 0 ? "#00FF66" : "rgba(216, 255, 228, 0.7)")
      .style("font-size", d => d.ring === 0 ? "14px" : "10px")
      .style("font-weight", d => d.ring === 0 ? "900" : "400")
      .style("pointer-events", "none")
      .style("font-family", "IBM Plex Mono")
      .style("text-transform", "uppercase");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [dimensions, networkNodes, networkEdges, viewMode]);

  const getNodeColor = (node: NetworkNode, mode: string) => {
    if (node.ring === 0) return "#00FF66"; // Primary always green/neon

    switch (mode) {
      case 'Sentiment':
        if (node.sentiment === 'positive') return "#00FF66";
        if (node.sentiment === 'neutral') return "#4ade80"; // gray-green
        if (node.sentiment === 'negative') return "#FF4D4D";
        return "#D8FFE4";
      case 'Risk':
        if (node.maliciousRisk > 70 || node.botLikelihood > 80) return "#FF4D4D";
        if (node.maliciousRisk > 30 || node.coordinationRisk > 50) return "#FFB020";
        return "#00FF66";
      case 'Intent':
        if (['Disruptive', 'Suspicious', 'Coordinated Risk'].includes(node.intent)) return "#FF4D4D";
        if (['Critical', 'Opportunistic'].includes(node.intent)) return "#FFB020";
        return "#00FF66";
      default:
        return "#00FF66";
    }
  };

  return (
    <div className={cn("space-y-8 min-h-screen bg-terminal-bg pb-20", isFullscreen && "fixed inset-0 z-[100] p-10 bg-terminal-bg overflow-auto")}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-terminal-border pb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-terminal-green animate-spin-slow" />
            <Badge variant="outline" className="text-terminal-green border-terminal-green/30 uppercase tracking-widest">Global Network Map</Badge>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter terminal-glow">Network<span className="text-terminal-green">Intelligence</span></h1>
          <p className="text-terminal-text/60 text-sm mt-1 max-w-lg font-mono uppercase tracking-tight">Cross-platform relationship and intent analysis around {activeClient?.name}.</p>
        </div>

        <div className="flex flex-wrap gap-4 font-mono items-center mt-6 lg:mt-0">
          <div className="flex gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[7px] uppercase text-terminal-green/30 font-black">Account Context</span>
              <select className="bg-terminal-panel border border-terminal-border text-[9px] px-3 py-1 font-black text-terminal-green/70 outline-none hover:border-terminal-green/40 transition-colors uppercase">
                <option>@EcoGear_Official</option>
                <option>@EcoGear_Partners</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[7px] uppercase text-terminal-green/30 font-black">Object Filter</span>
              <select className="bg-terminal-panel border border-terminal-border text-[9px] px-3 py-1 font-black text-terminal-green/70 outline-none hover:border-terminal-green/40 transition-colors uppercase">
                <option>Spring Release Post #1</option>
                <option>AeroTech Joint Venture</option>
                <option>Global Logistics Update</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[7px] uppercase text-terminal-green/30 font-black">Temporal Window</span>
              <select className="bg-terminal-panel border border-terminal-border text-[9px] px-3 py-1 font-black text-terminal-green/70 outline-none hover:border-terminal-green/40 transition-colors uppercase">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Epoch</option>
              </select>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-terminal-border/30 mx-2 hidden lg:block" />

          <div className="flex bg-terminal-panel p-1 border border-terminal-border">
            {['Sentiment', 'Intent', 'Risk', 'Reach', 'Activity'].map((mode) => (
              <button 
                key={mode} 
                onClick={() => setViewMode(mode as any)}
                className={cn(
                  "px-4 py-2 text-[10px] uppercase font-black tracking-widest transition-all", 
                  viewMode === mode ? "bg-terminal-green text-black" : "text-terminal-green/40 hover:text-terminal-green/70"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          <Button variant="secondary" className="h-11 px-4 border-terminal-border text-terminal-green/60 font-black text-[10px]">
             <FilterIcon className="w-4 h-4 mr-2" /> FILTERS
          </Button>
          <Button variant="secondary" className="h-11 px-4 border-terminal-border text-terminal-green/60 font-black text-[10px]">
             <Download className="w-4 h-4 mr-2" /> EXPORT
          </Button>
          <Button variant="secondary" className="h-11 px-4 border-terminal-border text-terminal-green/60" onClick={() => setIsFullscreen(!isFullscreen)}>
             {isFullscreen ? <ZoomOut className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Network Map */}
      <div className="relative group">
        <Card 
          ref={containerRef}
          className="w-full h-[700px] console-panel border-terminal-border overflow-hidden relative"
        >
              <div className="absolute inset-0 terminal-scanline opacity-10 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,102,0.03)_0%,transparent_70%)] pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none border border-terminal-green/5 shadow-[inset_0_0_100px_rgba(0,255,102,0.02)]" />
              
              <svg 
                ref={svgRef} 
                width="100%" 
                height="100%" 
                className="w-full h-full cursor-move"
              />

              {/* HUD Elements */}
              <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
                 <div className="text-[8px] font-black text-terminal-green/40 uppercase tracking-[0.3em]">SEC_LAYER_01: ACTIVE</div>
                 <div className="text-[8px] font-black text-terminal-green/20 uppercase tracking-[0.3em]">RE_MAPPING: STABLE</div>
              </div>

              {/* Compass / HUD Elements */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <Button variant="secondary" className="w-10 h-10 p-0 border-terminal-border bg-black/60 hover:bg-terminal-green/10 transition-colors"><RefreshCw className="w-4 h-4" /></Button>
                <Button variant="secondary" className="w-10 h-10 p-0 border-terminal-border bg-black/60 hover:bg-terminal-green/10 transition-colors"><Target className="w-4 h-4" /></Button>
              </div>

              <div className="absolute bottom-6 right-6 p-4 bg-black/80 border border-terminal-border backdrop-blur-md border-terminal-green/20">
                <div className="flex gap-4">
                   <div className="flex flex-col">
                      <span className="text-[7px] text-terminal-green/30 uppercase font-black">X_COORD</span>
                      <span className="text-[10px] text-terminal-green font-mono">0.0234</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[7px] text-terminal-green/30 uppercase font-black">Y_COORD</span>
                      <span className="text-[10px] text-terminal-green font-mono">1.9421</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[7px] text-terminal-green/30 uppercase font-black">LATENCY</span>
                      <span className="text-[10px] text-terminal-green font-mono">12ms</span>
                   </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 p-4 bg-black/80 border border-terminal-border backdrop-blur-md border-terminal-green/20">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-terminal-green/40 mb-3 font-mono border-b border-terminal-green/10 pb-1">Signal Legend</h4>
                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-[9px] uppercase font-bold font-mono">
                     <div className="w-2 h-2 rounded-full bg-terminal-green shadow-[0_0_8px_#00FF66]" /> POS_INF
                   </div>
                   <div className="flex items-center gap-3 text-[9px] uppercase font-bold font-mono">
                     <div className="w-2 h-2 rounded-full bg-terminal-amber shadow-[0_0_8px_#FFB020]" /> NEU_FLUX
                   </div>
                   <div className="flex items-center gap-3 text-[9px] uppercase font-bold font-mono">
                     <div className="w-2 h-2 rounded-full bg-terminal-red shadow-[0_0_10px_#FF4D4D]" /> NEG_PRES
                   </div>
                </div>
              </div>

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredNode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute p-4 bg-black/90 border border-terminal-green/30 backdrop-blur-xl pointer-events-none z-50 min-w-[220px] shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                    style={{ 
                      left: hoveredNode.ring === 0 ? '50%' : 'auto', 
                      top: hoveredNode.ring === 0 ? '50%' : 'auto',
                      transform: hoveredNode.ring === 0 ? 'translate(-50%, -50%)' : 'none'
                    }}
                  >
                    <div className="space-y-4 font-mono">
                      <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
                        <span className="text-xs font-black text-terminal-text tracking-tighter">{hoveredNode.handle}</span>
                        <Badge variant="outline" className="text-[8px] bg-terminal-green/5 border-terminal-green/20">{hoveredNode.platform}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div className="flex flex-col">
                          <span className="text-[7px] text-terminal-green/40 uppercase font-black">Vector</span>
                          <span className="text-[9px] font-black uppercase text-terminal-green/70">{hoveredNode.nodeType.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] text-terminal-green/40 uppercase font-black">Intent</span>
                          <span className={cn("text-[9px] font-black uppercase", getNodeColor(hoveredNode, 'Intent') === "#FF4D4D" ? 'text-terminal-red' : 'text-terminal-green')}>{hoveredNode.intent}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] text-terminal-green/40 uppercase font-black">Influence</span>
                          <span className="text-[9px] font-black text-terminal-text">{hoveredNode.influenceScore}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] text-terminal-green/40 uppercase font-black">Risk_Idx</span>
                          <span className={cn("text-[9px] font-black", hoveredNode.maliciousRisk > 50 ? 'text-terminal-red' : 'text-terminal-green/60')}>{hoveredNode.maliciousRisk}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Collapsible Inspector Drawer - Narrower */}
            <AnimatePresence>
              {isInspectorOpen && selectedNode && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute top-0 right-0 h-full w-[340px] bg-black/95 border-l border-terminal-green/10 backdrop-blur-3xl z-40 p-8 overflow-y-auto no-scrollbar font-mono shell-shadow"
                >
              <div className="flex items-center justify-between mb-8 border-b border-terminal-border pb-4">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-terminal-green/40">Node Inspector</h3>
                 <button onClick={() => setIsInspectorOpen(false)} className="text-terminal-green/40 hover:text-terminal-green transition-colors font-black">CLOSE [X]</button>
              </div>

              <div className="space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-terminal-green/5 border border-terminal-green/20 flex items-center justify-center relative">
                     <Fingerprint className="w-10 h-10 text-terminal-green opacity-40" />
                     {selectedNode.maliciousRisk > 50 && (
                       <div className="absolute -top-2 -right-2 w-6 h-6 bg-terminal-red flex items-center justify-center rounded-full animate-pulse">
                         <AlertCircle className="w-3.5 h-3.5 text-black" />
                       </div>
                     )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic text-terminal-text leading-none">{selectedNode.handle}</h2>
                    <p className="text-[10px] text-terminal-green/40 uppercase font-bold mt-2 font-mono tracking-widest">{selectedNode.nodeType.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Sentiment', value: selectedNode.sentiment, color: selectedNode.sentiment === 'negative' ? 'text-terminal-red' : 'text-terminal-green' },
                    { label: 'Intent', value: selectedNode.intent, color: 'text-terminal-text' },
                    { label: 'Bot Prob', value: `${selectedNode.botLikelihood}%`, color: selectedNode.botLikelihood > 70 ? 'text-terminal-red' : 'text-terminal-green/50' },
                    { label: 'Network Ring', value: `Ring ${selectedNode.ring}`, color: 'text-terminal-green/80' }
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-terminal-border/20">
                      <p className="text-[8px] uppercase text-terminal-green/20 mb-1">{stat.label}</p>
                      <p className={cn("text-[10px] font-black uppercase", stat.color)}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-terminal-green/30 tracking-widest flex items-center gap-2">
                     <MessageSquare className="w-3 h-3" /> Recent Activity Snippets
                   </h4>
                   <div className="space-y-3">
                      {selectedNode.recentCommentSnippets.length > 0 ? selectedNode.recentCommentSnippets.map((s, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-terminal-border/10 text-[11px] italic text-terminal-text/60 leading-relaxed border-l-2 border-l-terminal-green/40">
                          "{s}"
                        </div>
                      )) : (
                        <div className="text-[10px] italic text-terminal-text/30">No recent conversation logs ingested for this node.</div>
                      )}
                   </div>
                </div>

                <div className="pt-8 border-t border-terminal-border">
                   <h4 className="text-[10px] font-black uppercase text-terminal-green/30 tracking-widest mb-6">Analyst Intelligence Projection</h4>
                   <div className="space-y-6">
                      {[
                        { label: 'Influence Vector', value: selectedNode.influenceScore },
                        { label: 'Coordination Probability', value: selectedNode.coordinationRisk },
                        { label: 'Engagement Authenticity', value: selectedNode.engagementScore },
                        { label: 'Profile Maturity', value: selectedNode.profileMaturity }
                      ].map((bar, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-tight">
                            <span className="text-terminal-text/40">{bar.label}</span>
                            <span className="text-terminal-text">{bar.value}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${bar.value}%` }}
                              className={cn(
                                "h-full shadow-[0_0_8px_rgba(0,255,102,0.4)]",
                                bar.value > 80 && bar.label.includes('Coordination') ? "bg-terminal-red" : "bg-terminal-green"
                              )}
                            />
                          </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="pt-10 flex gap-4">
                  <Button className="flex-1 h-12 bg-terminal-green text-black font-black uppercase tracking-widest text-[10px]">FIX_TRACKING_ON_NODE</Button>
                  <Button variant="secondary" className="flex-1 h-12 border-terminal-border text-[10px] font-black uppercase tracking-widest">REQUEST_MANUAL_AUDIT</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid of Supporting Intelligence Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
        {/* Account Health Summary */}
        <Card className="p-8 console-panel border-terminal-border">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40">Primary Account Health</h3>
            <Badge variant="outline" className={cn(
              "font-black uppercase tracking-[0.2em] border-terminal-border",
              accountHealth.status === 'Watch' ? 'text-terminal-amber border-terminal-amber/30' : 'text-terminal-green border-terminal-green/30'
            )}>{accountHealth.status}</Badge>
          </div>
          
          <div className="flex items-end gap-6 mb-10">
            <div className="text-7xl font-black italic tracking-tighter terminal-glow">{accountHealth.score}<span className="text-2xl text-terminal-green/30">/100</span></div>
            <div className="pb-3">
              <TrendingUp className="w-5 h-5 text-terminal-green mb-1" />
              <p className="text-[8px] font-black text-terminal-green uppercase">Resilience Stable</p>
            </div>
          </div>

          <div className="space-y-6">
             {[
               { label: 'Engagement Authenticity', value: accountHealth.metrics.engagementAuthenticity },
               { label: 'Narrative Stability', value: accountHealth.metrics.narrativeStability },
               { label: 'Community Resilience', value: accountHealth.metrics.communityResilience }
             ].map((m, i) => (
               <div key={i} className="space-y-2 font-mono">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-terminal-green/40">
                    <span>{m.label}</span>
                    <span>{m.value}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 border border-terminal-border/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      className="h-full bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.4)]"
                    />
                  </div>
               </div>
             ))}
          </div>
        </Card>

        {/* Narrative Pressure Summary */}
        <Card className="p-8 console-panel border-terminal-border flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40 mb-8 font-mono">Narrative Pressure Scan</h3>
          <div className="space-y-6 flex-1 font-mono">
             <div>
                <p className="text-[8px] font-black uppercase text-terminal-green/20 mb-2">Dominant Positive Force</p>
                <div className="p-4 bg-terminal-green/[0.03] border border-terminal-green/10 text-[11px] italic text-terminal-green/70 leading-relaxed">
                   "{narrativePressure.dominantPositive}"
                </div>
             </div>
             <div>
                <p className="text-[8px] font-black uppercase text-terminal-red/20 mb-2">Emerging Negative Pressure</p>
                <div className="p-4 bg-terminal-red/[0.03] border border-terminal-red/10 text-[11px] italic text-terminal-red/70 leading-relaxed">
                   "{narrativePressure.emergingCriticism}"
                </div>
             </div>
             <div>
                <p className="text-[8px] font-black uppercase text-terminal-amber/20 mb-2">Top Discussion Trigger</p>
                <div className="text-[11px] font-bold text-terminal-text/80">{narrativePressure.topDiscussionTrigger}</div>
             </div>
          </div>
          <div className="mt-8 pt-6 border-t border-terminal-border">
             <p className="text-[9px] font-black uppercase text-terminal-green italic">Recommendation: <span className="text-terminal-text/60">{narrativePressure.recommendation}</span></p>
          </div>
        </Card>

        {/* Suspicious Accounts Queue */}
        <Card className="p-8 console-panel border-terminal-border">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40">Suspicious Activity Queue</h3>
            <Badge variant="outline" className="border-terminal-red/30 text-terminal-red font-black uppercase tracking-widest">{reviewQueue.length} FLAGS</Badge>
          </div>
          
          <div className="space-y-4 font-mono">
             {reviewQueue.map((item) => (
               <div key={item.id} className="p-4 border border-terminal-border/20 bg-black/40 group hover:border-terminal-red/40 transition-all cursor-pointer" onClick={() => {
                 setSelectedNodeId(item.nodeId);
                 setIsInspectorOpen(true);
               }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-terminal-text group-hover:text-terminal-red transition-colors">{item.handle}</span>
                    <span className="text-[8px] text-terminal-green/20 uppercase font-bold">{item.lastActivity}</span>
                  </div>
                  <p className="text-[10px] text-terminal-text/40 mb-3 italic">"{item.riskReason}"</p>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                       <span className="text-[7px] uppercase font-bold text-terminal-red/40">Bot-Likelihood</span>
                       <span className="text-[9px] font-black text-terminal-red/80">{item.botLikelihood}%</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[7px] uppercase font-bold text-terminal-amber/40">Coordination</span>
                       <span className="text-[9px] font-black text-terminal-amber/80">{item.coordinationRisk}%</span>
                    </div>
                    <Button variant="secondary" className="ml-auto h-7 px-3 text-[8px] font-black border-terminal-border group-hover:bg-terminal-red group-hover:text-black">OPEN_REVIEW</Button>
                  </div>
               </div>
             ))}
          </div>
        </Card>

        {/* Comment Intent Distribution */}
        <Card className="p-8 console-panel border-terminal-border lg:col-span-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40 mb-8 font-mono">Comment Intent Distribution</h3>
          <div className="space-y-3 font-mono">
             {intentDistribution.map((item, i) => (
               <div key={i} className="space-y-1.5 focus:outline-none">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest transition-colors">
                    <span className={cn(
                      ['Disruptive', 'Suspicious', 'Coordinated Risk'].includes(item.intent) ? 'text-terminal-red/70' : 
                      ['Critical', 'Opportunistic'].includes(item.intent) ? 'text-terminal-amber/70' : 'text-terminal-green/40'
                    )}>{item.intent}</span>
                    <span className="text-terminal-text/40">{item.count} items ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-black overflow-hidden flex border border-terminal-border/10">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        className={cn(
                          "h-full shadow-[0_0_5px_rgba(0,255,102,0.3)]",
                          ['Disruptive', 'Suspicious', 'Coordinated Risk'].includes(item.intent) ? 'bg-terminal-red' : 
                          ['Critical', 'Opportunistic'].includes(item.intent) ? 'bg-terminal-amber' : 'bg-terminal-green'
                        )}
                     />
                  </div>
               </div>
             ))}
          </div>
        </Card>

        {/* Engagement Quality Metrics */}
        <Card className="p-8 console-panel border-terminal-border lg:col-span-2">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40 font-mono">Engagement Quality Metrics</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-terminal-green" />
                  <span className="text-[8px] font-black uppercase text-terminal-green/40">Authentic</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full border border-terminal-green/20" />
                  <span className="text-[8px] font-black uppercase text-terminal-green/20">Synthesized</span>
               </div>
            </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 font-mono">
              {[
                { label: 'Human-Bot Ratio', val: '88:12', sub: 'Signal Confidence: 94%' },
                { label: 'Narrative Alignment', val: '72%', sub: 'Strategic Consistency' },
                { label: 'Social Reach Pulse', val: '1.4M', sub: 'Calculated Engagement Force' }
              ].map((stat, i) => (
                <div key={i} className="space-y-4">
                   <p className="text-[9px] font-black uppercase text-terminal-green/20 tracking-[0.2em]">{stat.label}</p>
                   <div className="text-4xl font-black italic tracking-tighter text-terminal-text">{stat.val}</div>
                   <div className="pt-4 border-t border-terminal-border/20 flex items-center justify-between">
                      <span className="text-[8px] font-bold text-terminal-green/40">{stat.sub}</span>
                      <Activity className="w-3 h-3 text-terminal-green/20" />
                   </div>
                </div>
              ))}
           </div>
        </Card>

      </div>
    </div>
  );
}
