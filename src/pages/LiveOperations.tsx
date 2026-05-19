import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, AlertCircle, CheckCircle2, Clock, 
  Database, MessageSquare, Zap, ShieldAlert,
  Users, BarChart3, ArrowUpRight, Play, Pause,
  Filter, Search, User, Target, ChevronRight,
  Monitor, Terminal, ShieldCheck, Cpu, Radio,
  ArrowRight
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const EVENT_TYPES = [
  { type: 'ingestion_started', description: 'Ingestion pipeline started', severity: 'low' },
  { type: 'ingestion_completed', description: 'Ingestion segment completed', severity: 'low' },
  { type: 'ingestion_failed', description: 'Source connection lost', severity: 'critical' },
  { type: 'narrative_spike_detected', description: 'Narrative surge detected', severity: 'high' },
  { type: 'report_ready', description: 'Intelligence brief generated', severity: 'medium' },
  { type: 'approval_submitted', description: 'New content pending review', severity: 'low' },
  { type: 'approval_resolved', description: 'Content item approved', severity: 'low' },
  { type: 'conversation_surge', description: 'Unified inbox volume surge', severity: 'medium' },
  { type: 'execution_paused', description: 'Execution paused for intervention', severity: 'high' },
  { type: 'intervention_assigned', description: 'Incident assigned to analyst', severity: 'medium' },
];

export default function LiveOperations() {
  const { 
    activeClientId, activityEvents, addActivityEvent, 
    ingestionJobs, approvalItems, alerts, executionRuns, clients
  } = useStore();
  
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const activeClient = clients.find(c => c.id === activeClientId);

  // Simulated Real-time Event Engine
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const eventInfo = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
      
      addActivityEvent({
        clientId: activeClientId,
        type: eventInfo.type,
        user: 'System',
        timestamp: new Date().toISOString(),
        description: eventInfo.description,
        metadata: { severity: eventInfo.severity }
      });
    }, 5000); // Faster event stream for flagship feel

    return () => clearInterval(interval);
  }, [isLive, activeClientId, addActivityEvent]);

  const filteredEvents = useMemo(() => {
    return activityEvents
      .filter(e => e.clientId === activeClientId)
      .filter(e => filter === 'all' || e.type.includes(filter))
      .filter(e => e.description.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 50); // Keep display manageable
  }, [activityEvents, activeClientId, filter, searchQuery]);

  const selectedEvent = useMemo(() => 
    activityEvents.find(e => e.id === selectedEventId), 
  [activityEvents, selectedEventId]);

  const stats = [
    { label: 'Active Processes', value: ingestionJobs.filter(j => j.status === 'running').length, icon: Cpu, color: 'text-terminal-green' },
    { label: 'Interventions', value: executionRuns.filter(r => r.status === 'intervention-needed').length, icon: ShieldAlert, color: 'text-terminal-red' },
    { label: 'Reports Queue', value: 2, icon: BarChart3, color: 'text-terminal-text' },
    { label: 'Live Alerts', value: alerts.filter(a => !a.resolved).length, icon: AlertCircle, color: 'text-terminal-amber' },
  ];

  return (
    <div className="space-y-10 pb-20 bg-terminal-bg min-h-screen relative overflow-hidden font-mono px-1">
      <div className="absolute inset-0 terminal-scanline opacity-30 pointer-events-none" />

      {/* Flagship Header */}
      <div className="flex items-end justify-between border-b border-terminal-border pb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-terminal-green animate-pulse shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
            <span className="text-[10px] text-terminal-green/40 font-black uppercase tracking-[0.2em]">{activeClient?.name} • Command Core</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter terminal-glow">LIVE<span className="text-terminal-green">OPERATIONS</span></h1>
          <p className="text-terminal-text/60 text-sm mt-1 max-w-lg font-mono">Real-time tactical synchronization of all neural and egress pipelines.</p>
        </div>
        <div className="flex gap-4 font-mono">
           <Badge variant="outline" className="flex items-center gap-3 py-2 px-6 border-terminal-green/20 text-terminal-green bg-black/40">
              <div className="w-2 h-2 bg-terminal-green animate-ping rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">CONNECTION: SECURE</span>
           </Badge>
           <Button variant="secondary" className="h-12 px-6 border-terminal-border text-terminal-green/60 hover:text-terminal-green transition-all">
              SYSTEM DIAGNOSTICS <ArrowUpRight className="w-4 h-4 ml-2" />
           </Button>
        </div>
      </div>

      {/* Header Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-5 p-6 console-panel hover:border-terminal-green/30 transition-all border-terminal-border/40 group">
            <div className={cn("p-3 bg-black border border-terminal-border/20 group-hover:border-terminal-green/40 transition-colors", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-terminal-green/40 mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black italic text-terminal-text">{stat.value}</span>
                {stat.value > 0 && <div className="w-1.5 h-1.5 bg-terminal-green animate-pulse shadow-[0_0_5px_rgba(0,255,102,0.8)]" />}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Left Side: Real-time Event Stream */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black italic text-terminal-text tracking-widest uppercase">Telemetry Stream</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-terminal-green rounded-full shadow-[0_0_8px_rgba(0,255,102,0.8)]" />
                <span className="text-[9px] font-black text-terminal-green tracking-[0.3em] uppercase">LINK ACTIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-black/40 p-1 border border-terminal-border">
                <button 
                  onClick={() => setIsLive(!isLive)}
                  className={cn("p-2 transition-all", isLive ? "bg-terminal-green/10 text-terminal-green" : "text-terminal-green/20 hover:text-terminal-green/40")}
                >
                  {isLive ? <Pause className="w-4 h-4 shadow-[0_0_8px_rgba(0,255,102,0.3)]" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-terminal-green/20 group-focus-within:text-terminal-green transition-colors" />
                <input 
                  type="text" 
                  placeholder="FILTER TELEMETRY..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/40 border border-terminal-border py-2.5 pl-10 pr-4 text-[9px] font-black uppercase tracking-widest w-48 focus:outline-none focus:border-terminal-green/40 transition-all placeholder:text-terminal-green/10 text-terminal-text"
                />
              </div>
            </div>
          </div>

          <Card className="border-terminal-border/20 bg-black/20 shadow-none h-[650px] overflow-hidden flex flex-col p-4 console-panel">
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-2">
              <AnimatePresence initial={false}>
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    onClick={() => setSelectedEventId(event.id)}
                    className={cn(
                      "p-4 border transition-all group flex items-center justify-between cursor-pointer relative overflow-hidden",
                      selectedEventId === event.id ? "bg-terminal-green/5 border-terminal-green/40 animate-pulse" : "bg-black/40 border-terminal-border/10 hover:border-terminal-border/40",
                    )}
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <div className={cn(
                        "w-10 h-10 border flex items-center justify-center transition-colors",
                        event.metadata?.severity === 'critical' ? "border-terminal-red/50 text-terminal-red" : 
                        event.metadata?.severity === 'high' ? "border-terminal-amber/50 text-terminal-amber" : "border-terminal-green/20 text-terminal-green/40"
                      )}>
                        {event.metadata?.severity === 'critical' ? <ShieldAlert className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] font-mono text-terminal-green/30 uppercase tracking-widest">[{format(new Date(event.timestamp), 'HH:mm:ss:SSS')}]</span>
                           <span className={cn(
                             "text-[10px] font-black uppercase tracking-[0.2em] shadow-sm",
                             event.metadata?.severity === 'critical' ? "text-terminal-red" : 
                             event.metadata?.severity === 'high' ? "text-terminal-amber" : "text-terminal-green"
                           )}>{event.type}</span>
                        </div>
                        <p className="text-xs italic text-terminal-text/80 mt-1 uppercase tracking-tight">{event.description}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 transition-all", selectedEventId === event.id ? "text-terminal-green translate-x-1" : "text-terminal-green/10 group-hover:text-terminal-green/30")} />
                    
                    {event.metadata?.severity === 'critical' && (
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-terminal-red shadow-[0_0_10px_rgba(255,77,77,0.8)]" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* Right Side: Control Panels */}
        <div className="lg:col-span-4 space-y-8 font-mono">
          {/* Detail Panel */}
          <Card className="p-8 console-panel border-terminal-border bg-black/40 min-h-[400px] flex flex-col relative group">
            <div className="absolute inset-0 bg-terminal-green/[0.01] pointer-events-none" />
            <h3 className="text-[10px] font-black text-terminal-green/40 uppercase tracking-[0.2em] mb-8 border-b border-terminal-border/20 pb-2 italic">Process Telemetry</h3>
            {selectedEvent ? (
              <div className="space-y-8 flex-1 relative z-10">
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-terminal-green/20 uppercase tracking-[0.2em]">Unique Identifier</p>
                    <p className="text-xs font-black text-terminal-green terminal-glow tracking-widest">#TACTICAL_LOG_{selectedEvent.id.slice(0, 12)}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-terminal-green/20 uppercase tracking-[0.2em]">Temporal Anchor</p>
                    <p className="text-xs text-terminal-text italic">{format(new Date(selectedEvent.timestamp), 'yyyy-MM-dd HH:mm:ss:SSS')}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-terminal-green/20 uppercase tracking-[0.2em]">Execution Source</p>
                    <div className="flex items-center gap-3">
                       <Monitor className="w-3.5 h-3.5 text-terminal-green/40" />
                       <span className="text-xs font-black text-terminal-text uppercase tracking-widest">STRAT-CORE-V9.0.42</span>
                    </div>
                 </div>
                 {selectedEvent.metadata?.severity === 'critical' || selectedEvent.metadata?.severity === 'high' ? (
                   <div className="p-5 bg-terminal-red/5 border border-terminal-red/30 relative">
                      <div className="absolute -top-3 left-3 bg-black px-2 text-[8px] font-black text-terminal-red uppercase tracking-widest">Urgent Advisory</div>
                      <p className="text-[10px] text-terminal-red leading-relaxed font-bold uppercase tracking-tight">Manual intervention requested. Anomaly detected in egress channel authorization. Check API quotas or account structure integrity.</p>
                   </div>
                 ) : (
                    <div className="p-5 bg-terminal-green/5 border border-terminal-green/20">
                      <p className="text-[10px] text-terminal-green/60 leading-relaxed italic font-black uppercase tracking-tight">Standard operation sequence confirmed. No manual intervention required at this anchor.</p>
                    </div>
                 )}
                 <div className="pt-8 border-t border-terminal-border/20 mt-auto">
                    <Button className="w-full h-14 bg-terminal-green text-black uppercase tracking-[0.2em] text-[10px] font-black hover:bg-terminal-green/90 shadow-[0_0_15px_rgba(0,255,102,0.3)]">Resolve & Archive Node</Button>
                 </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                 <Target className="w-12 h-12 mb-6 text-terminal-green/20" />
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-terminal-green/40">Awaiting Telemetry Selection</p>
              </div>
            )}
          </Card>

          {/* Owners on Duty */}
          <Card className="p-8 console-panel bg-black/40 border-terminal-border/40">
             <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] mb-8 border-b border-terminal-border/20 pb-2">Owners on Duty</h3>
             <div className="space-y-6">
                {[
                  { name: 'Alex Rivera', role: 'Lead Strategist', status: 'active' },
                  { name: 'Marcus Thorne', role: 'Compliance Dev', status: 'away' },
                  { name: 'Sarah Chen', role: 'Narrative Analyst', status: 'active' },
                ].map((user, i) => (
                  <div key={i} className="flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black border border-terminal-border/20 group-hover:border-terminal-green/40 flex items-center justify-center transition-colors">
                           <User className="w-5 h-5 text-terminal-green/20 group-hover:text-terminal-green/50" />
                        </div>
                        <div>
                           <p className="text-xs font-black text-terminal-text uppercase tracking-widest">{user.name}</p>
                           <p className="text-[9px] text-terminal-green/30 font-black uppercase tracking-[0.2em] mt-0.5">{user.role}</p>
                        </div>
                     </div>
                     <div className={cn("w-2 h-2", user.status === 'active' ? 'bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.8)] animate-pulse' : 'bg-terminal-green/10')} />
                  </div>
                ))}
             </div>
             <Button variant="secondary" className="w-full mt-8 border-terminal-border text-terminal-green/40 hover:text-terminal-green text-[9px] font-black uppercase tracking-widest py-6">Initiate Comms <ArrowRight className="w-3.5 h-3.5 ml-2" /></Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
