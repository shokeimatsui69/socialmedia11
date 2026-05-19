import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  Activity, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  BarChart3,
  TrendingDown,
  ExternalLink,
  ShieldCheck,
  StopCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

export default function Monitoring() {
  const { activeClientId, executionRuns, updateExecutionStatus, clients, alerts, integrations } = useStore();
  const [viewMode, setViewMode] = useState<'Timeline' | 'List'>('List');

  const activeClient = clients.find(c => c.id === activeClientId);
  const clientExecutions = useMemo(() => 
    executionRuns.filter(e => e.clientId === activeClientId),
    [executionRuns, activeClientId]
  );
  
  const activeAlerts = useMemo(() => 
    alerts.filter(a => a.clientId === activeClientId && !a.resolved),
    [alerts, activeClientId]
  );

  const aggregatePressure = useMemo(() => {
    if (clientExecutions.length === 0) return 0;
    const running = clientExecutions.filter(e => e.status === 'running').length;
    return Math.round((running / clientExecutions.length) * 100);
  }, [clientExecutions]);

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'running' ? 'paused' : 'running';
    updateExecutionStatus(id, nextStatus as any);
  };

  return (
    <div className="space-y-10 bg-terminal-bg min-h-screen pb-20 relative overflow-hidden">
      <div className="absolute inset-0 terminal-scanline opacity-30" />
      
      <div className="flex items-end justify-between border-b border-terminal-border pb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
            <span className="text-[10px] text-terminal-green/40 font-mono uppercase tracking-[0.2em]">{activeClient?.name} • Tactical Egress</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter terminal-glow">Tactical<span className="text-terminal-green">Oversight</span></h1>
          <p className="text-terminal-text/60 text-sm mt-1 max-w-lg font-mono">Live monitoring of authorized tactical pulses, scheduled actions, and signal anomalies.</p>
        </div>
        <div className="flex gap-3 font-mono">
          <Badge variant="outline" className="flex items-center gap-2 py-2 px-4 border-terminal-green/20 text-terminal-green">
            <ShieldCheck className="w-4 h-4 text-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.4)]" /> 
            <span className="text-[10px] font-black uppercase tracking-widest">Core Narrative Integrity: OPTIMAL</span>
          </Badge>
          <Button variant="secondary" className="h-12 px-6 uppercase tracking-widest text-[10px] font-black group border-terminal-border text-terminal-green">
             Anomaly Log <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        <div className="lg:col-span-8 space-y-8">
           <Card className="overflow-hidden console-panel font-mono">
              <div className="px-8 py-6 border-b border-terminal-border bg-terminal-panel/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Zap className="w-4 h-4 text-terminal-amber shadow-[0_0_8px_rgba(255,176,32,0.4)]" />
                   <h3 className="text-[10px] font-black text-terminal-green/50 uppercase tracking-[0.2em]">Active Deployment Pipeline</h3>
                </div>
                <div className="flex bg-black/40 p-1 border border-terminal-border">
                   {['Timeline', 'List'].map((mode) => (
                     <button 
                        key={mode} 
                        onClick={() => setViewMode(mode as any)}
                        className={cn(
                          "px-4 py-1.5 text-[10px] font-black uppercase transition-all", 
                          viewMode === mode ? "bg-terminal-green/10 text-terminal-green" : "text-terminal-green/30 hover:text-terminal-green/60"
                        )}
                      >
                        {mode}
                      </button>
                   ))}
                </div>
              </div>
              <div className="divide-y divide-terminal-border">
                <AnimatePresence mode="popLayout">
                  {clientExecutions.map((e) => (
                    <motion.div 
                      key={e.id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 flex items-center justify-between hover:bg-terminal-green/[0.02] transition-colors group"
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 bg-black border flex flex-col items-center justify-center shadow-2xl transition-all group-hover:scale-105 relative overflow-hidden",
                          e.status === 'running' ? "border-terminal-green text-terminal-green shadow-[0_0_15px_rgba(0,255,102,0.2)]" :
                          e.status === 'scheduled' ? "border-terminal-border text-terminal-green/20" :
                          e.status === 'paused' ? "border-terminal-amber text-terminal-amber shadow-[0_0_15px_rgba(255,176,32,0.2)]" :
                          "border-terminal-green/30 text-terminal-green/60"
                        )}>
                           <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent"></div>
                           {e.status === 'running' ? <Activity className="w-6 h-6 animate-pulse relative z-10" /> : 
                            e.status === 'scheduled' ? <Clock className="w-6 h-6 relative z-10" /> :
                            e.status === 'paused' ? <Pause className="w-6 h-6 relative z-10" /> :
                            <CheckCircle2 className="w-6 h-6 relative z-10" />}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                             <h4 className="text-xl font-black italic text-terminal-text uppercase tracking-tight group-hover:text-terminal-green transition-colors">{e.pipeline || e.title}</h4>
                             <Badge variant={e.status === 'running' ? 'outline' : 'neutral'} className={cn("text-[8px] font-black tracking-widest uppercase border-terminal-border", e.status === 'running' && "border-terminal-green text-terminal-green")}>{e.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-terminal-green/40 font-black uppercase tracking-widest">
                             <span className="flex items-center gap-1.5 text-terminal-green/60"><Clock className="w-3 h-3" /> STARTED: {e.startTime}</span>
                             <span className="opacity-20">|</span>
                             <span className="text-terminal-amber">{e.totalActions - e.completedActions} PENDING AUTHORIZED ACTIONS</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-10">
                        <div className="text-right space-y-2">
                           <div className="flex justify-between items-end gap-12">
                              <p className="text-[10px] font-black text-terminal-green/40 uppercase tracking-widest">SYNCHRONIZATION</p>
                              <p className="text-sm font-black italic text-terminal-text">{e.progress ?? Math.round(((e.completedActions || 0) / (e.totalActions || 1)) * 100)}%</p>
                           </div>
                           <div className="w-48 h-1.5 bg-black border border-terminal-border/20 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${e.progress ?? ((e.totalActions || 0) > 0 ? ((e.completedActions || 0) / (e.totalActions || 1)) * 100 : 0)}%` }}
                                className={cn("h-full transition-all duration-1000", e.status === 'paused' ? 'bg-terminal-amber' : 'bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.5)]')} 
                               />
                           </div>
                        </div>
                        <div className="flex gap-2">
                           {e.status !== 'completed' && (
                             <Button 
                               variant="secondary" 
                               className="w-12 h-12 p-0 flex items-center justify-center border-terminal-border text-terminal-green/60 hover:text-terminal-green hover:bg-terminal-green/10 transition-all font-mono"
                               onClick={() => handleStatusToggle(e.id, e.status)}
                             >
                               {e.status === 'running' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 text-terminal-green" />}
                             </Button>
                           )}
                           <Button 
                             variant="secondary" 
                             className="w-12 h-12 p-0 flex items-center justify-center text-terminal-green/40 border-terminal-border hover:text-terminal-red hover:bg-terminal-red/10 transition-all font-mono"
                             onClick={() => updateExecutionStatus(e.id, 'completed')}
                           >
                              <StopCircle className="w-5 h-5" />
                           </Button>
                           <Button variant="secondary" className="w-12 h-12 p-0 flex items-center justify-center border-terminal-border text-terminal-green/60 hover:text-terminal-green hover:bg-terminal-green/10 transition-all font-mono">
                              <ArrowUpRight className="w-5 h-5" />
                           </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="p-10 console-panel bg-black/40 font-mono">
                 <h4 className="text-[10px] font-black text-terminal-green/50 uppercase tracking-[0.2em] mb-10 border-b border-terminal-border pb-2">Real-time Pulse Feed</h4>
                 <div className="relative pl-8 space-y-8 after:absolute after:left-[7px] after:top-2 after:bottom-2 after:w-px after:bg-terminal-border">
                    {[
                      { action: 'Strategic Reply RELEASED', detail: 'Thread X-12493 • Goal: EMOTIONAL RESET', time: '2m ago', color: 'bg-terminal-green' },
                      { action: 'Telemetry Stream FIXED', detail: 'Source: Instagram @EcoGear_Official', time: '14m ago', color: 'bg-terminal-green' },
                      { action: 'Egress ANOMALY Detected', detail: 'Rapid sentiment drop in DACH region', time: '1h ago', color: 'bg-terminal-red' },
                      { action: 'Batch Authorization Release', detail: '14 comments release by Analyst Sarah', time: '3h ago', color: 'bg-terminal-green' },
                    ].map((a, i) => (
                      <div key={i} className="relative group cursor-pointer">
                        <div className={cn("absolute -left-[25px] top-1.5 w-2.5 h-2.5 bg-black border border-terminal-border z-10 transition-all group-hover:scale-125 shadow-[0_0_8px_rgba(0,0,0,0.3)]", a.color)}></div>
                        <p className="text-[11px] font-black text-terminal-text uppercase tracking-widest group-hover:text-terminal-green transition-colors">{a.action}</p>
                        <p className="text-[10px] text-terminal-green/40 mt-1 font-medium italic">{a.detail} • {a.time}</p>
                      </div>
                    ))}
                 </div>
              </Card>

              <Card className="p-10 border-terminal-red/20 bg-terminal-red/5 relative overflow-hidden group font-mono">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                    <AlertTriangle className="w-48 h-48 text-terminal-red" />
                 </div>
                 <div className="flex items-center gap-3 text-terminal-red mb-8 relative z-10">
                    <AlertTriangle className="w-5 h-5 shadow-[0_0_10px_rgba(255,77,77,0.4)]" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-glow-red">Signal Anomalies</h4>
                 </div>
                 <div className="space-y-6 relative z-10">
                    {activeAlerts.slice(0, 2).map((alert) => (
                      <div key={alert.id} className="p-5 bg-black border border-terminal-red/20 group hover:border-terminal-red/50 transition-all">
                         <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-black text-terminal-red uppercase tracking-widest">{alert.type}: {alert.id}</p>
                            <Badge variant="negative" className="text-[8px] py-0 border-none bg-terminal-red text-black">URGENT</Badge>
                         </div>
                         <p className="text-xs italic text-terminal-text/80 leading-relaxed font-medium">"{alert.title}"</p>
                         <Button variant="ghost" className="p-0 h-auto mt-4 text-[10px] font-black uppercase tracking-widest text-terminal-amber hover:text-terminal-amber/80 group-hover:translate-x-1 transition-transform">
                            Investigate Signal <ExternalLink className="w-3 h-3 ml-2" />
                         </Button>
                      </div>
                    ))}
                    {activeAlerts.length === 0 && (
                       <p className="text-[10px] text-terminal-green/20 italic text-center py-10 uppercase tracking-widest font-black opacity-30">No active tactical anomalies detected</p>
                    )}
                 </div>
              </Card>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-10 font-mono">
           <Card className="p-10 console-panel">
              <h4 className="text-[10px] font-black text-terminal-green/40 uppercase tracking-[0.2em] mb-10 border-b border-terminal-border/20 pb-2 italic">Account Structural Health</h4>
              <div className="space-y-10">
                 {clients.map((client, i) => (
                   <div key={i} className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-terminal-green/60">{client.name}</span>
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-terminal-green animate-pulse shadow-[0_0_5px_rgba(0,255,102,0.8)]"></div>
                            <span className="text-[9px] font-black text-terminal-green uppercase">SYNCHRONIZED</span>
                         </div>
                      </div>
                      <div className="flex gap-1.5">
                         {Array.from({ length: 14 }).map((_, j) => (
                           <motion.div 
                             key={j} 
                             initial={{ scaleY: 0.1 }}
                             animate={{ scaleY: 0.5 + Math.random() * 0.5 }}
                             transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 + Math.random() }}
                             className={cn("flex-1 h-8", Math.random() > 0.1 ? "bg-terminal-green/20" : "bg-terminal-panel")}
                           />
                         ))}
                      </div>
                   </div>
                 ))}
                 <Button variant="secondary" className="w-full h-14 uppercase tracking-[0.2em] text-[10px] font-black mt-4 border-terminal-border text-terminal-green/60 hover:text-terminal-green hover:bg-terminal-green/5 transition-all">Structural Analysis Dashboard</Button>
              </div>
           </Card>

           <Card className="p-10 console-panel border-terminal-green/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-terminal-green/[0.03] to-transparent pointer-events-none"></div>
              <h4 className="text-[10px] font-black text-terminal-green/40 uppercase tracking-[0.2em] mb-6">Aggregate Tactical Pressure</h4>
              <div className="text-center py-10 relative">
                 <p className="text-[80px] font-black text-terminal-text leading-none tracking-tighter italic animate-pulse terminal-glow">{aggregatePressure}<span className="text-terminal-green opacity-50">.8</span></p>
                 <p className="text-[10px] text-terminal-green/40 font-black uppercase tracking-[0.3em] mt-6">Cumulative Target Saturation</p>
              </div>
              <div className="flex items-center gap-2 mt-6">
                 <div className="flex-1 h-2 bg-terminal-panel overflow-hidden flex relative">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${aggregatePressure}%` }}
                       className="h-full bg-terminal-green shadow-[0_0_20px_rgba(0,255,102,0.6)]"
                    />
                 </div>
              </div>
              <p className="text-[9px] text-terminal-green/20 mt-8 leading-relaxed italic text-center font-bold uppercase tracking-widest">Calculated across {integrations.length} authorized platforms. Real-time drift updated 1s ago.</p>
           </Card>
        </div>
      </div>
    </div>
  );
}
