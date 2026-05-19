import React from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  ArrowUpRight, 
  Target, 
  Zap, 
  Shield, 
  Activity,
  History,
  Download,
  Filter,
  Search,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';

const sentimentData = [
  { name: 'Positive', value: 65, color: '#00FF66' },
  { name: 'Neutral', value: 25, color: 'rgba(0,255,102,0.3)' },
  { name: 'Negative', value: 10, color: 'rgba(255,77,77,0.5)' },
];

const volumeData = [
  { name: '00:00', volume: 2400 },
  { name: '04:00', volume: 1398 },
  { name: '08:00', volume: 9800 },
  { name: '12:00', volume: 3908 },
  { name: '16:00', volume: 4800 },
  { name: '20:00', volume: 3800 },
  { name: '23:59', volume: 4300 },
];

export default function Analytics() {
  const { activeClientId, clients, campaigns, activeSession } = useStore();
  const activeClient = clients.find(c => c.id === activeClientId);

  const stats = activeSession?.reportMetrics || {
    totalPostsAnalyzed: 420,
    totalCommentsCollected: 12500,
    totalUniqueCommentersMapped: 8400,
    sentimentDistribution: { positive: 65, neutral: 25, negative: 10 },
    accountHealthScore: 88.4,
    narrativeStability: 92,
    engagementAuthenticity: 85,
    reportReadiness: 100
  };

  const dynamicSentimentData = [
    { name: 'Positive', value: stats.sentimentDistribution.positive, color: '#00FF66' },
    { name: 'Neutral', value: stats.sentimentDistribution.neutral, color: 'rgba(0,255,102,0.3)' },
    { name: 'Negative', value: stats.sentimentDistribution.negative, color: 'rgba(255,77,77,0.5)' },
  ];

  return (
    <div className="space-y-12 pb-20 bg-terminal-bg min-h-screen font-mono relative overflow-hidden px-1">
      <div className="absolute inset-0 terminal-scanline opacity-30 pointer-events-none" />
      
      <div className="flex items-end justify-between border-b border-terminal-border/50 pb-8 relative z-10">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[2px] bg-terminal-green" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-terminal-green/50 italic">{activeClient?.name} • Tactical Intelligence</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter terminal-glow uppercase">Executive<span className="text-terminal-green">Analytics</span></h1>
          <p className="text-terminal-text/40 text-sm mt-1 max-w-lg font-black uppercase tracking-tight italic leading-relaxed">High-fidelity resonance diagnostics and cross-sector impact telemetry.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center bg-black/40 border border-terminal-border/20 px-4 py-2">
              <Search className="w-3.5 h-3.5 text-terminal-green/40 mr-2" />
              <input className="bg-transparent border-none outline-none text-[10px] text-terminal-text/80 placeholder:text-terminal-green/10 w-40 font-black uppercase" placeholder="SEARCH SECTORS..." />
           </div>
           <Button variant="secondary" className="h-12 border-terminal-border text-terminal-green italic tracking-widest text-[10px] font-black group">
             <Download className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform" /> EXPORT_RAW_TELEMETRY
           </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
         {[
           { label: 'Gross_Impact', value: `${(stats.totalCommentsCollected / 1000).toFixed(1)}k`, delta: '+12%', icon: Target, color: 'text-terminal-text' },
           { label: 'Neural_Resonance', value: stats.accountHealthScore.toString(), delta: '+4.2', icon: Zap, color: 'text-terminal-green' },
           { label: 'Active_Nodes', value: stats.totalUniqueCommentersMapped.toString(), delta: '+8', icon: Globe, color: 'text-terminal-text' },
           { label: 'Sentiment_Drift', value: `${stats.sentimentDistribution.positive}%`, delta: '+2%', icon: TrendingUp, color: 'text-terminal-green' },
         ].map((kpi, i) => (
           <Card key={i} className="p-8 console-panel border-terminal-border/20 bg-panel/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                 <kpi.icon className="w-12 h-12 text-terminal-green" />
              </div>
              <p className="text-[10px] text-terminal-green/40 font-black uppercase tracking-[0.2em] mb-4 italic">{kpi.label}</p>
              <div className="flex items-end gap-3">
                 <p className={cn("text-4xl font-black italic tracking-tighter leading-none", kpi.color)}>{kpi.value}</p>
                 <Badge variant="positive" className="text-[8px] py-0 border-none bg-terminal-green/10 text-terminal-green mb-1">{kpi.delta}</Badge>
              </div>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* MAIN CHART */}
        <Card className="lg:col-span-8 p-10 console-panel border-terminal-border bg-panel/30">
           <div className="flex items-center justify-between mb-12">
              <div>
                 <h3 className="text-xl font-black italic text-terminal-text uppercase tracking-tight">Engagement_Velocity_Stream</h3>
                 <p className="text-[10px] text-terminal-green/30 font-black uppercase tracking-widest mt-1 italic">Real-time neural interaction cycles across primary egress points</p>
              </div>
              <div className="flex bg-black/40 border border-terminal-border/20 p-1">
                 {['1H', '24H', '7D', '30D'].map(t => (
                   <button key={t} className={cn("px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all", t === '24H' ? "bg-terminal-green/10 text-terminal-green border border-terminal-green/30" : "text-terminal-green/20 hover:text-terminal-green/60")}>{t}</button>
                 ))}
              </div>
           </div>
           <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF66" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00FF66" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,102,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(0,255,102,0.2)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#D8FFE4', opacity: 0.3 }} 
                  />
                  <YAxis 
                    stroke="rgba(0,255,102,0.2)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#D8FFE4', opacity: 0.3 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#040404', border: '1px solid rgba(0,255,102,0.4)', borderRadius: '0px', color: '#D8FFE4', fontFamily: 'IBM Plex Mono' }}
                    itemStyle={{ color: '#00FF66', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#00FF66" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={2} dot={{ r: 4, fill: '#00FF66', strokeWidth: 2, stroke: '#040404' }} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* SIDE CHARTS / PIE */}
        <div className="lg:col-span-4 space-y-10">
           <Card className="p-10 console-panel border-terminal-border/20 bg-panel/40">
              <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] mb-10 border-b border-terminal-border/10 pb-2 italic">Sentiment_Spectrum</h3>
              <div className="h-[240px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={dynamicSentimentData}
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                       >
                          {dynamicSentimentData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-3xl font-black italic text-terminal-green">{stats.sentimentDistribution.positive}%</p>
                    <p className="text-[9px] font-black uppercase text-terminal-green/30 tracking-widest">Target_Sync</p>
                 </div>
              </div>
              <div className="mt-8 space-y-4">
                 {dynamicSentimentData.map((s, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2" style={{ backgroundColor: s.color }} />
                         <span className="text-[10px] font-black text-terminal-text/60 uppercase tracking-widest italic">{s.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-terminal-text">{s.value}%</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="p-10 border-terminal-green/10 bg-terminal-green/[0.02] flex items-center gap-6 relative group console-panel">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                 <History className="w-16 h-16 text-terminal-green" />
              </div>
              <div className="w-12 h-12 bg-black border border-terminal-border/40 flex items-center justify-center shrink-0">
                 <Shield className="w-5 h-5 text-terminal-green/40" />
              </div>
              <div>
                 <h4 className="text-[10px] font-black text-terminal-green/40 uppercase tracking-[0.2em] mb-1 italic">Policy_Compliance</h4>
                 <p className="text-[9px] text-terminal-text/20 leading-relaxed uppercase font-bold italic">Verification complete. Intelligence harvested under sector protocol 09-BA-XR.</p>
              </div>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
         <Card className="p-10 console-panel border-terminal-border/20 bg-panel/20">
            <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] mb-8 italic">Platform_Resonance</h3>
            <div className="space-y-6">
               {[
                 { platform: 'Instagram', reach: '1.2M', engagement: '8.4%', trend: '+2.1%', progress: 85 },
                 { platform: 'TikTok', reach: '2.4M', engagement: '12.2%', trend: '+5.4%', progress: 95 },
                 { platform: 'Twitter (X)', reach: '0.6M', engagement: '4.8%', trend: '-1.2%', progress: 45 },
               ].map((p, i) => (
                 <div key={i} className="space-y-3 group cursor-pointer">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-sm font-black italic text-terminal-text group-hover:text-terminal-green transition-colors uppercase tracking-tight">{p.platform}</p>
                          <p className="text-[9px] text-terminal-green/20 font-black uppercase mt-1 tracking-widest">{p.reach} REACH_EGRESS</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[11px] font-black text-terminal-text italic">{p.engagement}</p>
                          <p className={cn("text-[9px] font-black uppercase tracking-widest", p.trend.startsWith('+') ? "text-terminal-green" : "text-terminal-red/60")}>{p.trend}</p>
                       </div>
                    </div>
                    <div className="w-full h-1 bg-black/40 overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} className="h-full bg-terminal-green/40 shadow-[0_0_10px_rgba(0,255,102,0.3)]" />
                    </div>
                 </div>
               ))}
            </div>
         </Card>

         <Card className="p-10 console-panel border-terminal-border/20 bg-panel/20">
            <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] mb-8 italic">Campaign_Audit</h3>
            <div className="space-y-4">
               {campaigns.filter(c => c.clientId === activeClientId).slice(0, 4).map((c, i) => (
                 <div key={i} className="flex items-center justify-between p-5 border border-terminal-border/10 bg-black/40 hover:border-terminal-green/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-5">
                       <div className="w-10 h-10 bg-black border border-terminal-border/20 flex items-center justify-center text-terminal-green/20 group-hover:text-terminal-green group-hover:border-terminal-green transition-all italic font-black text-[10px]">
                          0{i+1}
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-terminal-text group-hover:text-terminal-green transition-colors uppercase tracking-tight">{c.name}</p>
                          <p className="text-[8px] text-terminal-green/20 uppercase tracking-[0.2em] font-black mt-1 italic">{c.status}</p>
                       </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-terminal-green/10 group-hover:text-terminal-green transition-all" />
                 </div>
               ))}
            </div>
         </Card>

         <Card className="p-10 console-panel border-terminal-border/20 bg-terminal-green/[0.03] overflow-hidden group">
            <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] mb-8 italic">Intelligence_Brief_Status</h3>
            <div className="space-y-8 relative z-10">
               <div className="p-8 bg-black/40 border border-terminal-green/20 shadow-2xl relative">
                  <div className="flex items-center justify-between mb-4">
                     <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-terminal-green/40 text-terminal-green">READY_FOR_EGRESS</Badge>
                     <span className="text-[9px] text-terminal-green/20 font-black uppercase tracking-widest">v2.1</span>
                  </div>
                  <h4 className="text-xl font-black italic text-terminal-text tracking-tighter uppercase mb-2">Q2 Strategic Synthesis</h4>
                  <p className="text-[10px] text-terminal-text/40 italic font-medium leading-relaxed mb-6">Generated intelligence asset summarizing cross-platform narrative shifts and audience pivot points.</p>
                  <Button className="w-full bg-terminal-green h-12 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,102,0.2)]">Open_Visualizer</Button>
               </div>
               <div className="flex items-center justify-center gap-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse delay-75" />
                  <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse delay-150" />
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
