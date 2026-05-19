import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  TrendingUp, 
  MessageSquare, 
  Globe, 
  Flame, 
  ShieldCheck, 
  Zap,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  Target,
  Sparkles,
  ArrowLeft,
  Database,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';

export default function NarrativeAnalysis() {
  const { activeClientId, narratives, clients, extractedNarratives, webEvidence } = useStore();
  const [selectedNarrativeId, setSelectedNarrativeId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const activeClient = clients.find(c => c.id === activeClientId);
  
  // Combine global narratives with session-specific extracted ones
  const allNarratives = useMemo(() => {
    const global = narratives.filter(n => n.clientId === activeClientId).map(n => ({
      id: n.id,
      label: n.title,
      description: n.description,
      sentiment: n.sentiment,
      reachEstimate: n.reach,
      commentCount: n.mentions,
      keywords: [],
      pressureType: (n.sentiment === 'positive' ? 'Positive Reinforcement' : 'Constructive Criticism') as any
    }));
    
    return [...extractedNarratives, ...global];
  }, [narratives, extractedNarratives, activeClientId]);

  const filteredNarratives = useMemo(() => 
    allNarratives.filter(n => filter === 'all' || n.sentiment === filter),
    [allNarratives, filter]
  );

  const selectedNarrative = useMemo(() => 
    allNarratives.find(n => n.id === selectedNarrativeId),
    [allNarratives, selectedNarrativeId]
  );

  const relevantWebEvidence = useMemo(() => 
    webEvidence.filter(h => h.narrativeId === selectedNarrativeId),
    [webEvidence, selectedNarrativeId]
  );

  const sentimentStats = useMemo(() => {
    const total = selectedNarrative ? 100 : (allNarratives.length || 1);
    const data = selectedNarrative ? [
      { name: 'Positive', value: selectedNarrative.sentiment === 'positive' ? 74 : 12, color: '#00FF66' },
      { name: 'Neutral', value: selectedNarrative.sentiment === 'neutral' ? 82 : 18, color: '#D8FFE4' },
      { name: 'Negative', value: selectedNarrative.sentiment === 'negative' ? 66 : 15, color: '#FF4D4D' },
    ] : [
      { name: 'Positive', value: Math.round(allNarratives.filter(n => n.sentiment === 'positive').length / total * 100), color: '#00FF66' },
      { name: 'Neutral', value: Math.round(allNarratives.filter(n => n.sentiment === 'neutral').length / total * 100), color: '#D8FFE4' },
      { name: 'Negative', value: Math.round(allNarratives.filter(n => n.sentiment === 'negative').length / total * 100), color: '#FF4D4D' },
    ];
    return data;
  }, [allNarratives, selectedNarrative]);

  const handleDeepScan = () => {
    alert("Initiating neural cluster sweep. Diagnostic nodes active.");
  };

  return (
    <div className="space-y-8 pb-20 font-mono">
      <div className="flex items-end justify-between border-b border-terminal-border/50 pb-8 relative">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[2px] bg-terminal-green" />
        <div>
           <div className="flex items-center gap-2 mb-2">
             <TrendingUp className="w-3.5 h-3.5 text-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
             <span className="text-[10px] text-terminal-green/50 font-black uppercase tracking-[0.2em]">• Signal_Intelligence • {activeClient?.name}</span>
           </div>
           <h1 className="text-4xl font-black tracking-[0.05em] uppercase text-terminal-text">Narrative<span className="text-terminal-green italic px-2">Flux</span></h1>
           <p className="text-terminal-text/40 text-xs mt-2 max-w-lg font-medium uppercase tracking-wider">Deep mapping of recurring themes and high-velocity signals across ingested data.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-terminal-border/5 p-0.5 border border-terminal-border/20">
              {['all', 'positive', 'neutral', 'negative'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn("px-3 py-1.5 text-[9px] font-black uppercase transition-all", filter === f ? "bg-terminal-green text-terminal-bg" : "text-terminal-text/40 hover:text-terminal-green")}
                >
                  {f === 'all' ? 'FULL_SPECTRUM' : f.toUpperCase()}
                </button>
              ))}
           </div>
           <Button className="h-9 px-6 uppercase italic font-black group" onClick={handleDeepScan}>
             <Zap className="w-3.5 h-3.5 group-hover:fill-terminal-green" /> DEPLOY_SCAN
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
           <AnimatePresence mode="wait">
             {selectedNarrative ? (
               <motion.div
                 key="detail"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 className="space-y-6"
               >
                 <Button variant="secondary" className="h-8 text-[9px] font-black border-terminal-border/20 px-3 uppercase italic" onClick={() => setSelectedNarrativeId(null)}>
                    <ArrowLeft className="w-3 h-3" /> RETURN_TO_LIST
                 </Button>

                 <Card className="p-8 border-terminal-border/30 bg-panel/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                       <Zap className="w-48 h-48 text-terminal-green" />
                    </div>
                    <div className="relative z-10">
                       <div className="flex items-center gap-3 mb-6">
                          <Badge variant={selectedNarrative.sentiment === 'positive' ? 'positive' : selectedNarrative.sentiment === 'negative' ? 'negative' : 'neutral'}>
                            {selectedNarrative.sentiment.toUpperCase()}
                          </Badge>
                          <span className="text-[9px] font-black text-terminal-text/20 uppercase tracking-[0.2em] italic">SOURCE_VECTOR: NEURAL_INDEX_04</span>
                       </div>
                       <h2 className="text-3xl font-black text-terminal-text uppercase italic tracking-tighter leading-tight mb-4 decoration-terminal-green underline decoration-2 underline-offset-8">
                         {selectedNarrative.label}
                       </h2>
                       <p className="text-[13px] text-terminal-text/40 uppercase tracking-tight leading-relaxed max-w-3xl italic bg-terminal-bg/50 p-6 border border-terminal-border/10 backdrop-blur-sm">
                         {selectedNarrative.description}
                       </p>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                          {relevantWebEvidence.map((hit, i) => (
                             <div key={i} className="flex items-center justify-between p-4 border border-terminal-border/5 bg-terminal-green/[0.01] hover:border-terminal-green/20 transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 border border-terminal-border/10 flex items-center justify-center font-mono text-[10px] font-black text-terminal-green/30 italic group-hover:text-terminal-green transition-colors bg-terminal-bg"><Globe className="w-4 h-4" /></div>
                                   <div className="flex flex-col">
                                      <p className="text-[11px] font-black text-terminal-text/70 uppercase group-hover:text-terminal-green transition-colors italic tracking-tight">{hit.title}</p>
                                      <span className="text-[8px] text-terminal-text/30 font-bold">{hit.sourceName}</span>
                                   </div>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-terminal-green/10 group-hover:text-terminal-green transition-all" />
                             </div>
                          ))}
                       </div>
                    </div>
                 </Card>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    <Card className="p-6 border-terminal-border/20 bg-panel/10">
                       <h3 className="text-[10px] font-black text-terminal-text/40 uppercase tracking-[0.2em] mb-8 border-b border-terminal-border/10 pb-2 italic">Signal_Diagnostics</h3>
                       <div className="space-y-6">
                          <div className="flex items-center justify-between">
                             <p className="text-[11px] text-terminal-text/60 font-black uppercase tracking-tight italic">Velocity_Vector</p>
                             <span className="text-xl font-black text-terminal-green italic">1.4K/H</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <p className="text-[11px] text-terminal-text/60 font-black uppercase tracking-tight italic">Anchor_Stability</p>
                             <span className="text-xl font-black text-terminal-text italic">0.92S</span>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-terminal-border/5">
                             <p className="text-[11px] text-terminal-text/60 font-black uppercase tracking-tight italic">Harvest_Confidence</p>
                             <span className="text-xl font-black text-terminal-green/50 italic">94%</span>
                          </div>
                       </div>
                    </Card>

                    <Card className="p-6 border-terminal-green/10 bg-terminal-green/[0.02] relative group">
                       <h3 className="text-[10px] font-black text-terminal-text/40 uppercase tracking-[0.2em] mb-8 border-b border-terminal-border/10 pb-2 italic">Strategist_Auto_Synthesizer</h3>
                       <p className="text-xl font-black text-terminal-text italic uppercase leading-tight mb-6">Response_Vector<br /><span className="text-terminal-green italic underline decoration-1 underline-offset-4 decoration-terminal-green/30 px-1">Optimization_Ready</span></p>
                       <p className="text-[11px] text-terminal-text/30 uppercase tracking-widest leading-relaxed mb-6 italic">Strategic shift recommended in Singularity_Sector. Content frequency scaling initialized.</p>
                       <Button className="w-full h-11 text-[10px] font-black uppercase italic group">
                         SYNTHESIZE_MARKET_ENTRY <ShieldAlert className="w-3.5 h-3.5 ml-2" />
                       </Button>
                    </Card>
                 </div>
               </motion.div>
             ) : (
               <motion.div
                 key="list"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="grid grid-cols-1 md:grid-cols-2 gap-6"
               >
                 {filteredNarratives.map((narrative) => (
                   <div 
                     key={narrative.id}
                     onClick={() => setSelectedNarrativeId(narrative.id)}
                     className="p-6 border border-terminal-border/10 bg-panel/20 hover:border-terminal-green/30 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full"
                   >
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="w-16 h-16 text-terminal-green" />
                     </div>
                     <div className="flex items-center justify-between mb-6 relative z-10">
                        <Badge variant={narrative.sentiment === 'positive' ? 'positive' : narrative.sentiment === 'negative' ? 'negative' : 'neutral'}>
                          {narrative.sentiment.toUpperCase()}
                        </Badge>
                        <span className="text-[8px] font-black italic text-terminal-text/20">V_SIG_0{narrative.id.slice(0, 2)}</span>
                     </div>
                     <h3 className="text-xl font-black text-terminal-text/80 uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-terminal-green transition-colors decoration-terminal-green/20 underline decoration-1 underline-offset-4 line-clamp-2">
                       {narrative.label}
                     </h3>
                     <p className="text-[11px] text-terminal-text/40 mb-6 flex-1 line-clamp-3 italic uppercase tracking-widest leading-relaxed">
                       {narrative.description}
                     </p>
                     <div className="flex items-center justify-between border-t border-terminal-border/5 pt-4">
                        <div className="flex items-center gap-2">
                           <TrendingUp className="w-3.5 h-3.5 text-terminal-green/40" />
                           <span className="text-[10px] font-black text-terminal-text/40 uppercase tracking-widest italic">{narrative.reachEstimate.toLocaleString()} RE_SIGNAL</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-terminal-green/10 group-hover:text-terminal-green group-hover:translate-x-1 transition-all" />
                     </div>
                   </div>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <Card className="p-6 border-terminal-border/30 bg-panel/40">
              <h3 className="text-[10px] font-black text-terminal-text/40 uppercase tracking-[0.2em] mb-8 border-b border-terminal-border/20 pb-2 italic text-center">Narrative_Sentiment_Matrix</h3>
              <div className="h-64 flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={sentimentStats} layout="vertical" margin={{ left: 20 }}>
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" stroke="rgba(0,255,102,0.2)" fontSize={9} tick={{ fill: '#D8FFE4', opacity: 0.3 }} tickLine={false} axisLine={false} />
                     <Tooltip contentStyle={{ backgroundColor: '#040404', border: '1px solid rgba(0,255,102,0.3)', borderRadius: '0px' }} />
                     <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                       {sentimentStats.map((e, index) => <Cell key={index} fill={e.color} fillOpacity={0.4} stroke={e.color} strokeWidth={1} />)}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           <Card className="p-8 border-terminal-green/10 bg-terminal-green/[0.02] relative overflow-hidden group">
              <div className="absolute inset-0 bg-scan-line pointer-events-none opacity-5"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-1.5 bg-terminal-green animate-pulse" />
                  <h3 className="text-[9px] font-black text-terminal-text/40 uppercase tracking-[0.2em]">Diagnostic_Harvest_Feed</h3>
                </div>
                <div className="space-y-4">
                   {[
                     { label: 'Uplink_Node', status: 'STABLE', time: '12ms' },
                     { label: 'Narrative_Fix', status: 'ACTIVE', time: '104ms' },
                     { label: 'Cluster_Density', status: 'OPTIMAL', time: '0.92S' },
                   ].map((log, i) => (
                     <div key={i} className="flex items-center justify-between p-3 border border-terminal-border/5 bg-terminal-bg">
                        <span className="text-[9px] font-black text-terminal-text/40 uppercase italic tracking-widest">{log.label}</span>
                        <div className="flex items-center gap-3">
                           <span className="text-[8px] font-black text-terminal-green italic">{log.status}</span>
                           <span className="text-[8px] font-black text-terminal-text/20 italic">{log.time}</span>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="mt-8 p-4 border border-terminal-border/10 bg-terminal-bg border-dashed text-center">
                   <p className="text-[9px] text-terminal-text/30 font-black uppercase tracking-[0.3em] italic animate-pulse group-hover:text-terminal-green transition-colors cursor-pointer" onClick={handleDeepScan}>INITIALIZE_DEEP_PKT_RESOLVE</p>
                </div>
              </div>
           </Card>

           <Card className="p-4 border-terminal-border/10 bg-terminal-bg flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 border border-terminal-border/10 bg-terminal-green/[0.02]">
                    <Globe className="w-3.5 h-3.5 text-terminal-green/40" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-terminal-text/40 uppercase italic tracking-widest leading-none mb-1">Global_Sync</p>
                    <p className="text-[11px] text-terminal-text font-black uppercase tracking-tight italic">98.2%_ALIGNED</p>
                 </div>
              </div>
              <Badge variant="positive">SYNC_OK</Badge>
           </Card>
        </div>
      </div>
    </div>
  );
}
