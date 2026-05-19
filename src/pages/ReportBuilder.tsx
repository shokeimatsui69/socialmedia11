import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Plus,
  Layout,
  BarChart2,
  PieChart as PieChartIcon,
  MessageSquare,
  Globe,
  Trash2,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

export default function ReportBuilder() {
  const { activeClientId, reports, clients, exportReport, activeSession, webEvidence, extractedNarratives } = useStore();
  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const activeClient = clients.find(c => c.id === activeClientId);
  
  const evidenceSummary = useMemo(() => {
    if (!activeSession) return [];
    return webEvidence.slice(0, 5);
  }, [activeSession, webEvidence]);

  const reportNarratives = useMemo(() => {
    if (activeSession && extractedNarratives.length > 0) return extractedNarratives;
    return [];
  }, [activeSession, extractedNarratives]);

  const clientReports = useMemo(() => 
    reports.filter(r => r.clientId === activeClientId),
    [reports, activeClientId]
  );

  const selectedReport = useMemo(() => 
    clientReports.find(r => r.id === selectedReportId) || clientReports[0],
    [clientReports, selectedReportId]
  );

  const handleDownload = (id: string) => {
    exportReport(id);
  };

  return (
    <div className="space-y-10 pb-20 bg-terminal-bg min-h-screen relative overflow-hidden font-mono px-1">
      <div className="absolute inset-0 terminal-scanline opacity-30 pointer-events-none" />

      <div className="flex items-end justify-between border-b border-terminal-border pb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2 text-terminal-green/40">
            <FileText className="w-4 h-4 text-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
            <span className="text-[10px] uppercase font-black tracking-[0.2em]">{activeClient?.name} • Intelligence Archives</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter terminal-glow">Briefing<span className="text-terminal-green">Composer</span></h1>
          <p className="text-terminal-text/60 text-sm mt-1 max-w-lg font-mono">Synthesize Neural Map clusters and tactical telemetry into executive-grade intelligence assets.</p>
        </div>
        <div className="flex items-center gap-4 font-mono">
           <div className="flex bg-black/40 p-1 border border-terminal-border shadow-2xl">
              <button 
                onClick={() => setViewMode('list')}
                className={cn("px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all", viewMode === 'list' ? "bg-terminal-green/10 text-terminal-green border border-terminal-green/30 shadow-xl" : "text-terminal-green/30 hover:text-terminal-green/60")}
              >
                Archive
              </button>
              <button 
                onClick={() => setViewMode('preview')}
                className={cn("px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all", viewMode === 'preview' ? "bg-terminal-green/10 text-terminal-green border border-terminal-green/30 shadow-xl" : "text-terminal-green/30 hover:text-terminal-green/60")}
              >
                Visualizer
              </button>
           </div>
           <Button className="h-12 px-8 uppercase tracking-[0.2em] text-[10px] font-black bg-terminal-green text-black hover:bg-terminal-green/90 shadow-[0_0_15px_rgba(0,255,102,0.4)]">
             <Plus className="w-4 h-4 mr-2" /> New Asset
           </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div 
            key="archive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10"
          >
            <div className="lg:col-span-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                {[
                  { label: 'Pending Release', value: '04', color: 'text-terminal-amber' },
                  { label: 'Tactical Syncs', value: '12', color: 'text-terminal-green' },
                  { label: 'Total Archives', value: '148', color: 'text-terminal-text' },
                ].map((stat, i) => (
                  <Card key={i} className="p-8 bg-black/40 border-terminal-border relative group overflow-hidden box-glow-green">
                    <p className="text-[10px] text-terminal-green/40 font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <p className={cn("text-4xl font-black italic", stat.color)}>{stat.value}</p>
                  </Card>
                ))}
              </div>

              <div className="space-y-4 font-mono">
                <AnimatePresence mode="popLayout">
                  {clientReports.map((report) => (
                    <motion.div 
                      key={report.id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group"
                    >
                      <Card 
                        className={cn(
                          "p-8 console-panel group transition-all duration-300 relative overflow-hidden cursor-pointer",
                          selectedReportId === report.id ? "bg-terminal-green/5 border-terminal-green/40 shadow-[inset_0_0_20px_rgba(0,255,102,0.05)]" : "hover:border-terminal-green/30"
                        )}
                        onClick={() => setSelectedReportId(report.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-black border border-terminal-border flex items-center justify-center text-terminal-green/40 group-hover:text-terminal-green group-hover:border-terminal-green transition-all shadow-2xl relative">
                              <div className="absolute inset-0 bg-terminal-green/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <FileText className="w-7 h-7 relative z-10" />
                            </div>
                            <div>
                              <p className="text-xl font-black italic text-terminal-text group-hover:text-terminal-green transition-colors uppercase tracking-tight">
                                {report.name}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                 <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-terminal-green/20 text-terminal-green/60">{report.type}</Badge>
                                 <span className="text-[10px] font-black text-terminal-green/30 uppercase tracking-widest flex items-center gap-2 italic">
                                    <Clock className="w-3 h-3" /> LAST MODIFIED {report.updatedAt}
                                 </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <Badge variant={report.status === 'published' ? 'positive' : 'neutral'} className="text-[8px] font-black uppercase tracking-widest border-terminal-border bg-black/40 text-terminal-green">{report.status}</Badge>
                            <div className="flex gap-2">
                              <Button variant="secondary" className="p-3 h-12 w-12 flex items-center justify-center bg-black border-terminal-border hover:bg-terminal-green/10 text-terminal-green/60 hover:text-terminal-green transition-all" onClick={() => setViewMode('preview')}><Eye className="w-5 h-5" /></Button>
                              <Button variant="secondary" className="p-3 h-12 w-12 flex items-center justify-center bg-black border-terminal-border hover:bg-terminal-green/10 text-terminal-green/60 hover:text-terminal-green transition-all" onClick={() => handleDownload(report.id)}><Download className="w-5 h-5" /></Button>
                              <Button variant="secondary" className="p-3 h-12 w-12 flex items-center justify-center bg-black border-terminal-border text-terminal-green/30 hover:text-terminal-green hover:bg-terminal-green/10 transition-colors"><MoreVertical className="w-5 h-5" /></Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-10 font-mono">
               <Card className="p-10 console-panel border-terminal-border/20">
                  <h3 className="text-[10px] font-black text-terminal-green/40 uppercase tracking-[0.2em] mb-10 border-b border-terminal-border/20 pb-2">Structural Modules</h3>
                  <div className="space-y-4">
                     {[
                       { label: 'Executive Narrative', icon: BarChart2, color: 'text-terminal-green' },
                       { label: 'Sentiment Spectrum', icon: PieChartIcon, color: 'text-terminal-green/60' },
                       { label: 'Audience Clusters', icon: Layout, color: 'text-terminal-amber' },
                       { label: 'Tactical Saturation', icon: Globe, color: 'text-terminal-text' },
                       { label: 'Egress Logs', icon: MessageSquare, color: 'text-terminal-red' },
                     ].map((m, i) => (
                       <div key={i} className="flex items-center justify-between p-5 bg-black/40 border border-terminal-border/40 group hover:border-terminal-green transition-all cursor-crosshair shadow-xl">
                          <div className="flex items-center gap-5">
                             <div className="w-10 h-10 bg-black flex items-center justify-center border border-terminal-border/20 group-hover:border-terminal-green/40">
                                <m.icon className={cn("w-4 h-4", m.color)} />
                             </div>
                             <span className="text-[10px] font-black text-terminal-text/60 group-hover:text-terminal-green transition-colors uppercase tracking-widest">{m.label}</span>
                          </div>
                          <Plus className="w-4 h-4 text-terminal-green/20 group-hover:text-terminal-green transition-colors" />
                       </div>
                     ))}
                  </div>
                  <Button variant="secondary" className="w-full h-14 mt-8 bg-black/40 border-terminal-border text-terminal-green/40 hover:text-terminal-green text-[10px] font-black uppercase tracking-widest transition-all">Resource Archive Search</Button>
               </Card>

               <Card className="p-10 border-terminal-green/20 bg-terminal-green/5 relative overflow-hidden group console-panel">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                     <ShieldCheck className="w-32 h-32 text-terminal-green" />
                  </div>
                  <h4 className="text-[10px] font-black text-terminal-green/40 uppercase tracking-[0.2em] mb-4">Tactical Scheduling</h4>
                  <p className="text-[11px] text-terminal-text/60 font-medium leading-relaxed italic">"Smart-scheduling active for {activeClient?.name}. Assets are auto-synthesized 12h post major narrative drift detection."</p>
               </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="visualizer"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="flex justify-center max-w-6xl mx-auto px-4 relative z-10"
          >
            <Card className="w-full bg-[#0d110d] text-terminal-text border border-terminal-green/20 p-20 min-h-[1400px] flex flex-col font-mono relative overflow-hidden">
              <div className="absolute inset-0 terminal-scanline opacity-20 pointer-events-none" />
              
              <div className="flex justify-between items-start border-b-2 border-terminal-green pb-16 relative z-10">
                <div className="w-24 h-24 bg-black border border-terminal-green flex items-center justify-center shadow-[0_0_30px_rgba(0,255,102,0.1)]">
                   <div className="w-12 h-12 border-2 border-terminal-green rotate-45"></div>
                </div>
                <div className="text-right">
                   <h2 className="text-6xl font-black tracking-tighter italic terminal-glow uppercase">INTELLIGENCE<span className="text-terminal-green/40">BRIEF</span></h2>
                   <p className="text-sm font-black uppercase tracking-[0.5em] mt-4 text-terminal-green/20">{activeClient?.name} • STRAT-ASSET-0922</p>
                </div>
              </div>

              <div className="mt-20 space-y-20 flex-1 relative z-10">
                 <div className="grid grid-cols-12 gap-16">
                    <div className="col-span-12 lg:col-span-7 space-y-6">
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-terminal-green/40 border-b border-terminal-border pb-3">Strategic Mandate</p>
                      <p className="text-3xl leading-snug font-black italic italic terminal-glow text-terminal-text">"A comprehensive diagnostic of the {selectedReport?.name} narrative shift within tactical egress zones."</p>
                    </div>
                    <div className="col-span-12 lg:col-span-5 space-y-6">
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-terminal-green/40 border-b border-terminal-border pb-3">Critical Telemetry</p>
                      <div className="flex justify-between items-end">
                         <div className="text-center md:text-left"><p className="text-5xl font-black italic">2.4M</p><p className="text-[9px] font-black uppercase tracking-[0.2em] text-terminal-green/40 mt-2">Gross Resonance</p></div>
                         <div className="text-center md:text-left"><p className="text-5xl font-black italic text-terminal-green">+18.5%</p><p className="text-[9px] font-black uppercase tracking-[0.2em] text-terminal-green/40 mt-2">Sentiment Drift</p></div>
                         <div className="text-center md:text-left"><p className="text-5xl font-black italic">42</p><p className="text-[9px] font-black uppercase tracking-[0.2em] text-terminal-green/40 mt-2">Tactical Pulses</p></div>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-10 pt-10 border-t border-terminal-border">
                    <div className="flex items-center gap-4">
                       <span className="text-4xl font-black italic text-terminal-green/20">01</span>
                       <h3 className="text-4xl font-black italic terminal-glow uppercase">Narrative Structural Analysis</h3>
                    </div>
                    <div className="grid grid-cols-12 gap-16">
                       <div className="col-span-12 lg:col-span-6">
                          <p className="text-lg text-terminal-text/80 leading-relaxed italic font-medium">
                             "Audience clusters are pivoting toward second-hand marketplaces as a primary topic of interest. High interaction rates on 'Durability' focused content suggest a need for longer-lifecycle marketing vectors. Tactical extraction shows 94% alignment with circular economy personas."
                          </p>
                       </div>
                       <div className="col-span-12 lg:col-span-6 bg-black p-12 border border-terminal-border relative overflow-hidden group shadow-inner">
                          <div className="absolute inset-0 bg-terminal-green/[0.02] pointer-events-none"></div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-terminal-green/20 mb-8 text-center relative z-10">Resonance Curve Distribution</p>
                          <div className="h-40 w-full flex items-end justify-between gap-3 px-8 relative z-10">
                              {[30, 60, 40, 85, 60, 75, 50, 95, 45, 80].map((h, i) => (
                                <motion.div 
                                  key={i} 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  transition={{ delay: i * 0.05, duration: 1, ease: 'easeOut' }}
                                  className="flex-1 bg-terminal-green/40 border border-terminal-green shadow-[0_0_15px_rgba(0,255,102,0.2)]" 
                                />
                              ))}
                          </div>
                          <div className="mt-8 flex justify-between text-[10px] font-black uppercase tracking-widest text-terminal-green/20 px-4">
                             <span>Origin</span>
                             <span>Peak</span>
                             <span>Egress</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-10 pt-10 border-t border-terminal-border">
                    <div className="flex items-center gap-4">
                       <span className="text-4xl font-black italic text-terminal-green/20">02</span>
                       <h3 className="text-4xl font-black italic terminal-glow uppercase">Resistance Assessment</h3>
                    </div>
                    <div className="space-y-6">
                      {[
                        { issue: 'Structural Pricing Friction', impact: 'Moderate Intensity', level: 45, color: 'bg-terminal-amber' },
                        { issue: 'Supply Chain Inaccuracy Gossip', impact: 'High Intensity', level: 85, color: 'bg-terminal-red' }
                      ].map((risk, i) => (
                        <div key={i} className="flex flex-col gap-4 p-8 border border-terminal-border group hover:border-terminal-green transition-all shadow-inner">
                           <div className="flex justify-between items-center px-2">
                              <span className="text-xl font-black italic uppercase tracking-tight">{risk.issue}</span>
                              <Badge variant="outline" className="border-terminal-border text-terminal-text py-1 px-4 text-[10px] font-black uppercase tracking-widest">{risk.impact}</Badge>
                           </div>
                           <div className="w-full h-3 bg-black border border-terminal-border/20 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${risk.level}%` }} 
                                className={cn("h-full", risk.color)} 
                              />
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="mt-40 pt-12 text-center border-t border-terminal-border relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-terminal-green/20">BrandAmbassador Tactical Intelligence Assets • Prepared by Human Strategists for {activeClient?.name} Corporate</p>
                 <div className="flex items-center justify-center gap-8 mt-6">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-3 h-3 text-terminal-green/40 shadow-[0_0_5px_rgba(0,255,102,0.4)]" />
                       <span className="text-[9px] font-bold text-terminal-green/40 uppercase tracking-widest">SECURE EGRESS</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-3 h-3 text-terminal-green/40 shadow-[0_0_5px_rgba(0,255,102,0.4)]" />
                       <span className="text-[9px] font-bold text-terminal-green/40 uppercase tracking-widest">VERIFIED COMPLIANCE</span>
                    </div>
                 </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
