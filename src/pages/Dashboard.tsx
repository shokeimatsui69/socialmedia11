import React from 'react';
import { 
  Users, 
  Activity, 
  Globe, 
  TrendingUp, 
  MessageSquare, 
  AlertCircle,
  ArrowUpRight,
  Download,
  FileText,
  Clock,
  Zap,
  Target,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const data = [
  { name: 'Mon', engagement: 4000, reach: 2400 },
  { name: 'Tue', engagement: 3000, reach: 1398 },
  { name: 'Wed', engagement: 2000, reach: 9800 },
  { name: 'Thu', engagement: 2780, reach: 3908 },
  { name: 'Fri', engagement: 1890, reach: 4800 },
  { name: 'Sat', engagement: 2390, reach: 3800 },
  { name: 'Sun', engagement: 3490, reach: 4300 },
];

const StatCard = ({ title, value, delta, icon: Icon, trend = 'up', progress = 50, color = 'bg-terminal-green', onClick }: any) => (
  <Card 
    className="p-5 border-terminal-border/20 relative overflow-hidden group cursor-pointer hover:border-terminal-green/40 transition-all bg-panel/20"
    onClick={onClick}
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-terminal-green/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-terminal-green/10 transition-colors" />
    <div className="flex justify-between items-start relative z-10 mb-3">
      <div className="flex items-center gap-2">
         {Icon && <Icon className="w-3 h-3 text-terminal-green/40" />}
         <p className="text-[9px] text-terminal-green/40 font-black uppercase tracking-[0.2em] italic">{title}</p>
      </div>
      {delta !== 0 && (
        <span className={cn(
          "text-[8px] font-black px-1.5 py-0.5 border flex items-center gap-1 italic",
          trend === 'up' ? "text-terminal-green border-terminal-green/20" : "text-terminal-red border-terminal-red/20"
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowUpRight className="w-2.5 h-2.5 rotate-90" />}
          {delta}%
        </span>
      )}
    </div>
    <div className="relative z-10">
       <p className="text-4xl font-black text-terminal-text tracking-tighter uppercase italic tabular-nums leading-none mb-4">{value}</p>
       <div className="w-full h-[2px] bg-black/40 rounded-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${progress}%` }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className={cn("h-full shadow-[0_0_8px_rgba(0,255,102,0.4)]", color)} 
         />
       </div>
    </div>
    <div className="mt-3 flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-terminal-text/10 italic">
       <span>BUFFER_FILL</span>
       <span>{progress}%_CAPACITY</span>
    </div>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeClientId, clients, campaigns, ingestionJobs, approvalItems, alerts, activityEvents, activeSession } = useStore();
  
  const activeClient = clients.find(c => c.id === activeClientId);
  const clientCampaigns = campaigns.filter(c => c.clientId === activeClientId);
  const clientApprovals = approvalItems.filter(a => a.clientId === activeClientId && a.status === 'pending');
  const unresolvedAlerts = alerts.filter(a => a.clientId === activeClientId && !a.resolved);
  
  const totalReach = clientCampaigns.reduce((acc, c) => acc + (c.kpis?.reach || 0), 0);
  const avgSentiment = clientCampaigns.reduce((acc, c) => acc + (c.kpis?.sentimentScore || 0), 0) / (clientCampaigns.length || 1);

  return (
    <div className="space-y-10 bg-terminal-bg min-h-screen pb-20 font-mono relative overflow-hidden px-1">
      <div className="absolute inset-0 terminal-scanline opacity-30 pointer-events-none" />
      
      <div className="flex items-end justify-between border-b border-terminal-border/50 pb-8 relative z-10">
        <div className="absolute -bottom-[1px] left-0 w-48 h-[2px] bg-terminal-green shadow-[0_0_15px_rgba(0,255,102,0.5)]" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
            <span className="text-[10px] text-terminal-green uppercase tracking-[0.2em] font-black italic opacity-40">System Core Protocols • Uplink Stable</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-terminal-text terminal-glow">Command<span className="text-terminal-green">Nexus</span></h1>
          <p className="text-terminal-text/40 mt-1 text-[10px] max-w-lg font-black uppercase tracking-widest bg-terminal-green/5 px-2 py-0.5 border-l border-terminal-green/20 italic leading-relaxed">Integrated intelligence monitoring for {activeClient?.name}. Synchronizing all tactical sector clusters.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="h-12 border-terminal-border bg-black/40 text-[10px] font-black italic tracking-widest uppercase" onClick={() => navigate('/reports')}>
            <Download className="w-4 h-4 mr-2" /> Export_Data
          </Button>
          <Button className="h-12 px-8 bg-terminal-green text-black italic font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,102,0.2)]" onClick={() => navigate('/ingestion')}>
            <Globe className="w-4 h-4 mr-2" /> Initialize_Ingest
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 relative z-10">
        {[
          { title: "Active_Sectors", value: clientCampaigns.length, delta: 2, trend: 'up', progress: 75, color: 'bg-terminal-green', icon: Target, path: '/analytics' },
          { title: "Harvest_Volume", value: `${(totalReach / 1000000).toFixed(1)}M`, delta: 12, trend: 'up', progress: 50, color: 'bg-terminal-green', icon: Globe, path: '/ingestion' },
          { title: "Neural_Nodes", value: "12.4k", delta: 14, trend: 'up', progress: 66, color: 'bg-terminal-green', icon: Users, path: '/audience-map' },
          { title: "Sentiment_Res", value: `${avgSentiment.toFixed(0)}%`, delta: 4, trend: 'up', progress: avgSentiment, color: 'bg-terminal-green', icon: TrendingUp, path: '/narratives' },
          { title: "Action_Queue", value: clientApprovals.length, delta: 0, trend: 'neutral', progress: 30, color: 'bg-terminal-amber', icon: MessageSquare, path: '/approvals' },
          { title: "Error_Sigs", value: unresolvedAlerts.length, delta: -2, trend: 'down', progress: 90, color: 'bg-terminal-red', icon: AlertCircle, path: '/live-operations' },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} onClick={() => navigate(stat.path)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <Card className="lg:col-span-8 p-10 console-panel border-terminal-border/40 bg-panel/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-terminal-green/10" />
          <div className="flex items-center justify-between mb-10 border-b border-terminal-border/10 pb-6 relative">
             <div className="absolute -bottom-[1px] left-0 w-12 h-[1px] bg-terminal-green" />
            <div>
              <h3 className="text-xl font-black text-terminal-text uppercase italic tracking-tighter">Engagement_Sync_Velocity</h3>
              <p className="text-[10px] text-terminal-green/30 font-black uppercase tracking-widest mt-1 italic">Cross-Platform Tactical Harmonics • 1.02 Phase Shift</p>
            </div>
            <div className="flex bg-black/60 p-1 border border-terminal-border/20 shadow-inner">
              {['1h', '24h', '7d', '30d'].map(t => (
                <button key={t} className={cn("px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all italic", t === '7d' ? "bg-terminal-green text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]" : "text-terminal-green/30 hover:text-terminal-green")}>{t}</button>
              ))}
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF66" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00FF66" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,102,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(0,255,102,0.2)" fontSize={10} tickLine={false} axisLine={false} tick={{ dy: 10, fill: '#D8FFE4', opacity: 0.2, fontWeight: 'bold' }} />
                <YAxis stroke="rgba(0,255,102,0.2)" fontSize={10} tickLine={false} axisLine={false} tick={{ dx: -10, fill: '#D8FFE4', opacity: 0.2, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#040404', border: '1px solid rgba(0,255,102,0.3)', borderRadius: '0px', padding: '12px', boxShadow: '0 0 20px rgba(0,0,0,0.8)' }}
                  itemStyle={{ color: '#00FF66', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}
                  labelStyle={{ marginBottom: '8px', color: '#71717a', fontSize: '9px', fontWeight: 'black', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}
                />
                <Area type="stepAfter" dataKey="engagement" stroke="#00FF66" fillOpacity={1} fill="url(#colorEng)" strokeWidth={3} dot={false} isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 console-panel border-terminal-border/30 bg-panel/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
               <ShieldCheck className="w-24 h-24 text-terminal-green" />
            </div>
            <div className="flex items-center justify-between mb-8 border-b border-terminal-border/10 pb-4 relative">
               <div className="absolute -bottom-[1px] left-0 w-8 h-[1px] bg-terminal-green" />
              <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] italic">Pending_Authorizations</h3>
              <Badge variant="neutral" className="text-[8px] font-black tracking-widest px-3 border-none bg-terminal-green/10 text-terminal-green">{clientApprovals.length} SIGS</Badge>
            </div>
            <div className="space-y-3">
              {clientApprovals.map((item, i) => (
                <div key={item.id} onClick={() => navigate('/approvals')} className="group p-4 bg-black/20 border border-terminal-border/5 hover:border-terminal-green/30 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-terminal-green/10 group-hover:bg-terminal-green transition-all" />
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-terminal-green/20 group-hover:text-terminal-green tabular-nums italic">0{i+1}</span>
                    <div>
                      <p className="text-[11px] font-black text-terminal-text group-hover:text-terminal-green transition-colors uppercase truncate max-w-[160px] tracking-tight italic">{item.title}</p>
                      <p className="text-[8px] text-terminal-green/20 font-black uppercase tracking-widest mt-0.5 italic">{item.type} // 2H_DELTA</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-terminal-green/10 group-hover:text-terminal-green transition-all -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              ))}
              {clientApprovals.length === 0 && (
                <div className="py-12 text-center opacity-10 border border-dashed border-terminal-border/20">
                  <p className="text-[9px] font-black uppercase tracking-widest italic animate-pulse whitespace-nowrap overflow-hidden">Signal_Lost // Action_Buffer_Empty</p>
                </div>
              )}
            </div>
            <Button variant="secondary" className="w-full mt-8 h-12 text-[9px] font-black uppercase tracking-widest border-terminal-border/30 text-terminal-green/40 hover:text-terminal-green hover:border-terminal-green transition-all italic bg-black/20" onClick={() => navigate('/approvals')}>Initialize_Control_Nexus</Button>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        <Card className="p-8 console-panel border-terminal-border/30 bg-panel/20">
          <div className="flex items-center justify-between mb-8 border-b border-terminal-border/10 pb-4 relative">
             <div className="absolute -bottom-[1px] left-0 w-12 h-[1px] bg-terminal-green" />
            <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] italic flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-terminal-green/20" /> Tactical_Event_Log
            </h3>
            <span className="text-[7px] font-black text-terminal-green/10 uppercase tracking-widest animate-pulse italic">Real-time_Stream_Active</span>
          </div>
          <div className="space-y-4">
            {activityEvents.filter(e => e.clientId === activeClientId).slice(0, 4).map(event => (
              <div key={event.id} className="flex gap-6 p-5 border border-terminal-border/5 bg-black/20 group cursor-pointer hover:border-terminal-green/20 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-terminal-green/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-1.5 h-1.5 bg-terminal-green/20 group-hover:bg-terminal-green shadow-[0_0_5px_rgba(0,255,102,0.4)] mt-1.5 shrink-0 transition-all" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[12px] font-black text-terminal-text group-hover:text-terminal-green transition-colors uppercase tracking-tight italic">{event.description}</p>
                    <Badge variant="info" className="text-[7px] px-2 py-0 border-none bg-terminal-green/5 text-terminal-green/30 uppercase font-black italic">{event.type.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-[9px] text-terminal-green/10 font-black uppercase mt-1.5 tracking-widest italic">{new Date(event.timestamp).toLocaleTimeString()} // ID_{event.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 console-panel border-terminal-border/30 bg-panel/30">
          <div className="flex items-center justify-between mb-8 border-b border-terminal-border/10 pb-4 relative">
             <div className="absolute -bottom-[1px] left-0 w-12 h-[1px] bg-terminal-green" />
            <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] italic flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-terminal-green/20" /> Active_Sector_Growth
            </h3>
            <Button variant="ghost" className="text-[9px] font-black uppercase p-0 h-auto text-terminal-green/30 hover:text-terminal-green italic tracking-widest underline decoration-terminal-green/10" onClick={() => navigate('/analytics')}>View_All_Sectors</Button>
          </div>
          <div className="space-y-4">
            {clientCampaigns.map(c => (
              <div key={c.id} className="flex items-center justify-between p-5 border border-terminal-border/10 bg-black/40 hover:border-terminal-green/30 transition-all cursor-pointer group relative overflow-hidden" onClick={() => navigate('/analytics')}>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-black border border-terminal-border/20 flex items-center justify-center text-terminal-green/20 group-hover:bg-terminal-green group-hover:text-black transition-all shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
                     <Target className="w-5 h-5 shadow-none" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-terminal-text group-hover:text-terminal-green transition-colors uppercase tracking-tighter italic leading-none">{c.name}</p>
                    <p className="text-[8px] text-terminal-green/20 uppercase tracking-[0.2em] font-black mt-1 italic italic">PROTOCOL_V4 // {c.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-terminal-green italic tracking-tighter tabular-nums leading-none">{(c.kpis.engagement / 1000).toFixed(1)}<span className="text-xs ml-0.5 opacity-40 italic">K</span></p>
                  <p className="text-[8px] font-black uppercase text-terminal-text/10 tracking-[0.2em] mt-1 italic">Impact_Index</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
