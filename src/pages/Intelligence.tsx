import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  Database, 
  RefreshCw, 
  Search, 
  Filter as FilterIcon, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { BackendJobWatcher } from '../features/bulk-automation/BackendJobWatcher';

export default function Intelligence() {
  const { activeClientId, ingestionJobs, updateJobStatus } = useStore();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [isNewPipelineOpen, setIsNewPipelineOpen] = useState(false);
  const [newPipelineSource, setNewPipelineSource] = useState('instagram');

  const filteredJobs = useMemo(() => {
    return ingestionJobs
      .filter(j => j.clientId === activeClientId)
      .filter(j => filter === 'all' || j.status === filter)
      .filter(j => j.source.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [ingestionJobs, activeClientId, filter, searchQuery]);

  const selectedJob = useMemo(() => ingestionJobs.find(j => j.id === selectedJobId), [ingestionJobs, selectedJobId]);

  const querySource = (source: string) => {
    setSearchQuery(source);
    setFilter('all');
  };

  const handleCreatePipeline = () => {
    setIsNewPipelineOpen(false);
  };

  return (
    <div className="space-y-10 bg-terminal-bg min-h-screen pb-20 font-mono relative overflow-hidden px-1">
      <div className="absolute inset-0 terminal-scanline opacity-30 pointer-events-none" />
      
      <AnimatePresence>
        {isNewPipelineOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewPipelineOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] cursor-crosshair"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-terminal-bg border-l border-terminal-green/20 z-[101] shadow-[0_0_50px_rgba(0,0,0,1)] p-10 flex flex-col font-mono"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-terminal-green/50 animate-scan" />
              <div className="flex items-center justify-between mb-10 border-b border-terminal-border/20 pb-6 relative">
                <div className="absolute -bottom-[1px] left-0 w-12 h-[1px] bg-terminal-green" />
                <div>
                   <h2 className="text-2xl font-black italic text-terminal-text tracking-tighter uppercase">Initialize_Pipeline</h2>
                   <p className="text-[10px] text-terminal-green/40 font-black uppercase tracking-widest mt-1 italic">Uplink Parameters Protocol v4.0</p>
                </div>
                <button 
                  onClick={() => setIsNewPipelineOpen(false)}
                  className="text-terminal-text/20 hover:text-terminal-red transition-colors font-black text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 space-y-10 overflow-y-auto no-scrollbar pb-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-terminal-green/30 tracking-[0.2em] italic">Target_Sector</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['instagram', 'x', 'facebook', 'tiktok', 'news', 'forum'].map(src => (
                      <button
                        key={src}
                        onClick={() => setNewPipelineSource(src)}
                        className={cn(
                          "px-4 py-4 text-[10px] font-black uppercase tracking-widest border transition-all relative overflow-hidden group",
                          newPipelineSource === src ? "bg-terminal-green text-black border-terminal-green shadow-[0_0_15px_rgba(0,255,102,0.4)]" : "bg-panel/40 border-terminal-border/20 text-terminal-green/30 hover:border-terminal-green/40 hover:text-terminal-green/60"
                        )}
                      >
                        {src}
                        {newPipelineSource === src && <div className="absolute inset-0 bg-white/10" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-terminal-green/30 tracking-[0.2em] italic">Pulse_Frequency</label>
                   <div className="space-y-4 p-5 bg-black/40 border border-terminal-border/10">
                      <div className="flex justify-between text-[11px] font-black text-terminal-text/40 italic">
                         <span className="text-terminal-green/60">1M_PULSE</span>
                         <span className="text-terminal-green/10">SYNC</span>
                         <span>60M_PULSE</span>
                      </div>
                      <input type="range" className="w-full accent-terminal-green h-1 bg-terminal-border/20 appearance-none outline-none" min="1" max="60" />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-terminal-green/30 tracking-[0.2em] italic">Extraction_Agents</label>
                   <div className="space-y-2">
                      {[
                        { id: 'sent', label: 'Sentiment Spectrum Analysis', active: true },
                        { id: 'narr', label: 'Narrative Structuralism Mapping', active: true },
                        { id: 'clus', label: 'Audience Cluster Identification', active: false },
                        { id: 'pii', label: 'PII Tactical Scrubbing', active: true },
                      ].map(agent => (
                        <div key={agent.id} className="flex items-center justify-between p-4 border border-terminal-border/10 bg-black/40 group hover:border-terminal-green/10 transition-all cursor-pointer">
                           <span className="text-[10px] font-black uppercase italic tracking-tight text-terminal-text/60 group-hover:text-terminal-text">{agent.label}</span>
                           <div className={cn("w-4 h-4 border border-terminal-border transition-all", agent.active ? "bg-terminal-green shadow-[0_0_10px_#00FF66]" : "bg-black")} />
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              <div className="pt-10 flex gap-4 mt-auto border-t border-terminal-border/20 bg-terminal-bg relative z-10">
                <Button variant="secondary" className="flex-1 h-14 italic border-terminal-border text-terminal-text/40 font-black uppercase text-[10px]" onClick={() => setIsNewPipelineOpen(false)}>ABORT_SEQUENCE</Button>
                <Button className="flex-1 h-14 italic bg-terminal-green text-black font-black uppercase text-[10px] shadow-[0_0_25px_rgba(0,255,102,0.3)]" onClick={handleCreatePipeline}>INITIALIZE_UPLINK</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex items-end justify-between border-b border-terminal-border/50 pb-8 relative z-10">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[2px] bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.5)]" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
            <span className="text-[10px] text-terminal-green uppercase tracking-[0.2em] font-black italic opacity-40">Tactical Harvest Protocols Active</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-terminal-text italic terminal-glow">Data<span className="text-terminal-green">Harvest</span></h1>
          <p className="text-terminal-text/40 text-[10px] font-black italic mt-1 max-w-lg uppercase tracking-widest bg-terminal-green/5 px-2 py-0.5 border-l border-terminal-green/20">Multi-source ingestion pipelines. Monitoring {filteredJobs.length} active tactical threads.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group bg-black/40 border border-terminal-border/10 p-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-terminal-green/20 group-focus-within:text-terminal-green transition-colors" />
            <input 
              type="text" 
              placeholder="FILTER_STREAMS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none py-2 pl-10 pr-4 text-[10px] font-black w-48 focus:outline-none transition-all placeholder:text-terminal-green/10 italic text-terminal-green"
            />
          </div>
          <Button className="h-12 px-8 bg-terminal-green text-black italic font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,102,0.2)]" onClick={() => setIsNewPipelineOpen(true)}>
            <Plus className="w-4 h-4 mr-1 shadow-none" /> Initialize_Uplink
          </Button>
        </div>
      </div>

      <BackendJobWatcher />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
        {['instagram', 'x', 'facebook', 'tiktok', 'news', 'forum'].map((p) => {
          const streamJobs = ingestionJobs.filter(j => j.clientId === activeClientId && j.source === p);
          const isError = streamJobs.some(j => j.status === 'failed');
          const isRunning = streamJobs.some(j => j.status === 'running');
          const isQueued = streamJobs.some(j => j.status === 'queued');
          const isActive = searchQuery.toLowerCase() === p.toLowerCase();
          
          return (
            <Card 
              key={p} 
              className={cn(
                "p-6 flex flex-col items-center justify-center text-center group border-terminal-border/10 bg-panel/20 hover:border-terminal-green/40 transition-all cursor-pointer relative overflow-hidden",
                isError && "border-terminal-red/30 bg-terminal-red/[0.02] hover:border-terminal-red",
                isActive && "border-terminal-green bg-terminal-green/[0.05]"
              )}
              onClick={() => querySource(p)}
            >
               <div className="w-12 h-12 border border-terminal-border/20 flex items-center justify-center mb-4 group-hover:border-terminal-green transition-all bg-black shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
                 <Database className={cn("w-5 h-5", isError ? "text-terminal-red shadow-[0_0_8px_rgba(255,77,77,0.4)]" : "text-terminal-green/20 group-hover:text-terminal-green transition-colors")} />
               </div>
               <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] transition-colors italic", isActive ? "text-terminal-green" : "text-terminal-text/40 group-hover:text-terminal-green/80")}>{p}</p>
               <div className="mt-3 flex items-center gap-2">
                 <div className={cn(
                   "w-1.5 h-1.5", 
                   isError ? "bg-terminal-red shadow-[0_0_5px_#FF4D4D]" : 
                   isRunning ? "bg-terminal-green animate-pulse shadow-[0_0_5px_#00FF66]" : 
                   isQueued ? "bg-terminal-amber animate-pulse shadow-[0_0_5px_#FFB020]" :
                   streamJobs.length > 0 ? "bg-terminal-green/20" : "bg-terminal-border/10"
                 )} />
                 <span className={cn(
                   "text-[8px] font-black uppercase tracking-widest", 
                   isError ? "text-terminal-red" : 
                   isRunning ? "text-terminal-green" : 
                   isQueued ? "text-terminal-amber" :
                   streamJobs.length > 0 ? "text-terminal-green/40" : "text-terminal-text/10"
                 )}>
                   {isError ? 'SIGNAL_ERR' : isRunning ? 'STREAM_LIVE' : isQueued ? 'QUEUED' : streamJobs.length > 0 ? 'READY' : 'OFFLINE'}
                 </span>
               </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-8 border-b border-terminal-border/10 relative z-10">
        {['all', 'running', 'failed', 'completed'].map((tab) => (
          <button 
            key={tab}
            className={cn(
              "px-1 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative group shadow-none",
              filter === tab ? "text-terminal-green italic" : "text-terminal-text/20 hover:text-terminal-text/60"
            )}
            onClick={() => setFilter(tab)}
          >
            {tab}_STREAMS
            {filter === tab && (
              <motion.div layoutId="tab-underline-ing" className="absolute bottom-0 left-0 right-0 h-[3px] bg-terminal-green shadow-[0_0_15px_rgba(0,255,102,0.8)]" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        <div className="lg:col-span-8">
          <Card className="console-panel border-terminal-border/30 bg-panel/10 p-0 overflow-hidden relative">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-terminal-border/20 bg-black/40">
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-terminal-green/30 font-black italic">Stream_Node_ID</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-terminal-green/30 font-black italic">Status_Protocol</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-terminal-green/30 font-black italic">Buffer_Progression</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-terminal-green/30 font-black italic text-right">Harvest_Vol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/5">
                  {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                    <tr 
                      key={job.id} 
                      className={cn(
                        "group transition-all cursor-pointer relative",
                        selectedJobId === job.id ? "bg-terminal-green/[0.04]" : "hover:bg-terminal-green/[0.02]"
                      )}
                      onClick={() => setSelectedJobId(job.id)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           <span className={cn("text-[10px] font-black italic tabular-nums leading-none", selectedJobId === job.id ? "text-terminal-green" : "text-terminal-text/20")}>#{(job.id || '').toString().padStart(4, '0')}</span>
                           <span className="text-[12px] font-black text-terminal-text group-hover:text-terminal-green transition-colors uppercase tracking-tight italic">{job.source}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge 
                          variant={job.status === 'completed' ? 'positive' : job.status === 'running' ? 'info' : job.status === 'failed' ? 'negative' : 'default'}
                          className="text-[9px] font-black uppercase tracking-widest border-none px-3"
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                            <div className="flex-1 w-32 h-[3px] bg-black/60 relative overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${job.progress}%` }}
                                 className={cn("absolute top-0 left-0 h-full transition-all duration-1000", job.status === 'failed' ? "bg-terminal-red/50" : "bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.6)]")}
                               />
                            </div>
                            <span className="text-[9px] font-black text-terminal-text/20 tabular-nums italic">{job.progress}%</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <p className="text-[13px] font-black text-terminal-text italic tracking-tight">{job.records.toLocaleString()}</p>
                         <p className="text-[8px] font-black uppercase text-terminal-green/20 tracking-widest leading-none mt-1">PULSE_RECORDED</p>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-24 text-center opacity-10 text-[12px] font-black uppercase tracking-widest italic animate-pulse">Signal_Lost // No_Active_Harvest_Streams</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <AnimatePresence mode="wait">
             {selectedJob ? (
               <motion.div
                 key={selectedJob.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="h-full"
               >
                 <Card className="p-8 console-panel border-terminal-border/40 bg-panel/40 relative overflow-hidden flex flex-col h-full min-h-[500px]">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                       <Database className="w-32 h-32 text-terminal-green" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-8 border-b border-terminal-border/10 pb-4">
                         <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] italic">Tactical_Telemetry_Log</h3>
                         <button onClick={() => setSelectedJobId(null)} className="text-[10px] uppercase font-black text-terminal-red/40 hover:text-terminal-red transition-colors italic">[TERMINATE]</button>
                      </div>
                      
                      <div className="space-y-8 flex-1">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-black border border-terminal-green/20 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,255,102,0.1)] group">
                              <Database className={cn("w-6 h-6 transition-all group-hover:scale-110", selectedJob.status === 'failed' ? 'text-terminal-red' : 'text-terminal-green')} />
                           </div>
                           <div>
                              <p className="text-2xl font-black text-terminal-text uppercase italic tracking-tighter leading-none mb-1">{selectedJob.source}_STREAM</p>
                              <Badge variant="outline" className="border-terminal-green/20 text-terminal-green/40 text-[8px] py-0 px-2 italic">POLL_INT: {selectedJob.interval || '15M'}</Badge>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-5 border border-terminal-border/10 bg-black/40 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-1 h-full bg-terminal-green/10" />
                              <p className="text-[8px] font-black uppercase tracking-widest text-terminal-text/20 mb-2">SIGNAL_INTEGRITY</p>
                              <p className="text-2xl font-black text-terminal-green italic tracking-tighter">{selectedJob.health}<span className="text-sm font-black opacity-40">%</span></p>
                           </div>
                           <div className="p-5 border border-terminal-border/10 bg-black/40 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-1 h-full bg-terminal-green/10" />
                              <p className="text-[8px] font-black uppercase tracking-widest text-terminal-text/20 mb-2">TOTAL_RECORDS</p>
                              <p className="text-2xl font-black text-terminal-text italic tracking-tighter">{selectedJob.records.toLocaleString()}</p>
                           </div>
                        </div>

                        <div className="space-y-4 pt-4">
                           <div className="flex items-center gap-4 group">
                              <ShieldCheck className="w-4 h-4 text-terminal-green/40 group-hover:text-terminal-green transition-colors" />
                              <p className="text-[10px] font-black uppercase text-terminal-text/40 tracking-widest">Neural_PII_Tactical_Scrub</p>
                              <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green ml-auto opacity-40" />
                           </div>
                           <div className="flex items-center gap-4 group">
                              <Zap className="w-4 h-4 text-terminal-green group-hover:shadow-[0_0_10px_rgba(0,255,102,0.4)] transition-all" />
                              <p className="text-[10px] font-black uppercase text-terminal-text/40 tracking-widest">Extraction_Agent: <span className="text-terminal-green/60">{selectedJob.narrativeExtractionStatus}</span></p>
                           </div>
                           {selectedJob.error && (
                             <div className="mt-4 p-5 bg-terminal-red/10 border border-terminal-red/20 shadow-[0_0_20px_rgba(255,77,77,0.05)]">
                                <div className="flex items-center gap-3 mb-2 text-terminal-red">
                                   <AlertCircle className="w-4 h-4" />
                                   <span className="text-[10px] font-black uppercase tracking-widest italic">Signal Error Detected</span>
                                </div>
                                <p className="text-[10px] font-black uppercase text-terminal-red/80 italic leading-relaxed">"{selectedJob.error}"</p>
                             </div>
                           )}
                        </div>
                      </div>

                      <div className="pt-10 flex gap-3 border-t border-terminal-border/10">
                         <Button className="flex-1 py-4 text-[10px] italic font-black uppercase group tracking-widest shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                            RESTART_PIPELINE <RefreshCw className="w-4 h-4 ml-2 group-hover:rotate-180 transition-transform duration-1000" />
                         </Button>
                         <Button variant="secondary" className="px-5 border-terminal-border/20 text-terminal-text/40">
                            <MoreHorizontal className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                 </Card>
               </motion.div>
             ) : (
               <Card className="p-16 border-dashed border-terminal-border/10 bg-terminal-green/[0.01] flex flex-col items-center justify-center text-center opacity-30 min-h-[500px] group transition-all hover:bg-terminal-green/[0.02]">
                  <Activity className="w-16 h-16 mb-6 text-terminal-green/20 group-hover:scale-110 group-hover:text-terminal-green transition-all" />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-terminal-text/60 leading-loose max-w-xs italic">
                    Select_Tactical_Stream_Node to initialize high-fidelity telemetry analysis logs
                  </p>
                  <div className="mt-8 flex gap-2">
                     <div className="w-1.5 h-1.5 bg-terminal-green/20 animate-pulse" />
                     <div className="w-1.5 h-1.5 bg-terminal-green/20 animate-pulse delay-75" />
                     <div className="w-1.5 h-1.5 bg-terminal-green/20 animate-pulse delay-150" />
                  </div>
               </Card>
             )}
           </AnimatePresence>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        <Card className="p-10 console-panel border-terminal-border/20 bg-panel/20">
          <div className="flex items-center justify-between mb-10 border-b border-terminal-border/10 pb-4">
            <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] italic">Governance_&_Compliance_Pulse</h3>
            <ExternalLink className="w-4 h-4 text-terminal-green/20" />
          </div>
          <div className="space-y-3">
             {[
               { id: 1, text: 'Neural PII scrubbing validated for Forum Job batch #441.', time: '1H LOCAL', status: 'verified' },
               { id: 2, text: 'Data minimization active for GDPR/CCPA protocol.', time: '2M LOCAL', status: 'active' },
               { id: 3, text: 'Authenticated human review validated for Instagram.', time: '4H LOCAL', status: 'verified' },
             ].map(log => (
               <div key={log.id} className="flex gap-6 p-6 border border-terminal-border/10 bg-black/40 hover:border-terminal-green/20 transition-all group relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-[2px] h-full bg-terminal-green/10 group-hover:bg-terminal-green transition-all" />
                 <div className={cn("w-2 h-2 mt-1.5 shrink-0 transition-all", log.status === 'verified' ? "bg-terminal-green shadow-[0_0_5px_#00FF66]" : "bg-terminal-green animate-pulse shadow-[0_0_8px_#00FF66]")} />
                 <div className="flex-1">
                    <p className="text-[12px] font-black text-terminal-text/70 uppercase leading-relaxed tracking-tight group-hover:text-terminal-text transition-colors italic">{log.text}</p>
                    <p className="text-[9px] text-terminal-green/20 font-black uppercase tracking-widest mt-2">{log.time} // COMPLIANCE_OK_SECTOR_09</p>
                 </div>
               </div>
             ))}
          </div>
        </Card>

        <Card className="p-10 border-terminal-green/10 bg-terminal-green/[0.02] relative overflow-hidden group console-panel shadow-[inset_0_0_100px_rgba(0,255,102,0.02)]">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-terminal-green/5 rounded-full blur-[120px] group-hover:bg-terminal-green/10 transition-all duration-1000 shadow-[inset_0_0_50px_rgba(0,255,102,0.1)] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10 border-b border-terminal-green/10 pb-4">
              <Badge variant="violet" className="text-[10px] border-none bg-terminal-green shadow-[0_0_15px_rgba(0,255,102,0.4)] text-black italic">SIGNAL_SWEEP_AGENT</Badge>
              <Zap className="w-5 h-5 text-terminal-green animate-pulse" />
            </div>
            <h3 className="text-4xl font-black text-terminal-text mb-6 tracking-tighter uppercase italic leading-none">Delta_Simulation_Analysis</h3>
            <p className="text-[14px] text-terminal-text/40 mb-12 leading-relaxed font-black uppercase tracking-tight italic border-l-2 border-terminal-green/20 pl-6">
              Analyzing emergent narratives from latest tactical harvesting segment. Cluster mapping in progress for HIGH_PRIORITY sectors. Strategic drift identified in DACH secondary nodes.
            </p>
            
            <div className="mt-auto flex items-center justify-between pt-10 border-t border-terminal-border/10">
              <Button variant="secondary" className="h-12 px-10 text-[10px] font-black italic border-terminal-border/40 text-terminal-text hover:text-terminal-green hover:border-terminal-green transition-all uppercase tracking-widest">
                ACCESS_MAP_NODES
              </Button>
              <div className="flex -space-x-4 items-center">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-10 h-10 border-2 border-terminal-bg bg-panel flex items-center justify-center p-1.5 shadow-2xl relative z-0 group-hover:translate-x-2 transition-transform duration-700">
                      <div className="w-full h-full bg-terminal-green/20 border border-terminal-green/10 group-hover:bg-terminal-green/40 transition-colors"></div>
                   </div>
                 ))}
                 <div className="w-12 h-12 border-2 border-terminal-bg bg-terminal-green flex items-center justify-center text-[10px] text-black font-black italic shadow-[0_0_30px_rgba(0,255,102,0.4)] z-10 group-hover:scale-110 transition-transform cursor-pointer relative translate-x-2">AI_X</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
