import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  Zap, 
  Search, 
  Activity, 
  ShieldCheck, 
  Users, 
  Database, 
  BarChart3, 
  MessageSquare, 
  Layers, 
  MoreVertical, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Pause,
  StopCircle,
  Download,
  ExternalLink,
  Target,
  Globe,
  Settings,
  Plus,
  Clock,
  Terminal,
  ShieldAlert,
  Send,
  Eye,
  Layout,
  Lock,
  ChevronRight,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import * as initialData from '../data/mockData';
import { 
  AnalysisSession, 
  SourceRun, 
  ResponderGroup, 
  LiveActionEvent,
  Platform,
  Severity,
  IntakeRequest,
  AnalysisStageType,
  ParallelTask,
  SupervisedAction
} from '../types';

interface AnalysisStageWidget {
  id: AnalysisStageType;
  label: string;
  status: 'waiting' | 'running' | 'completed';
  progress: number;
}
import AudienceMap from './AudienceMap';
import WebEvidence from './WebEvidence';

// --- Mission Control Components ---

const TaskIndicator = ({ task }: any) => (
  <div className="flex flex-col justify-between p-3 border border-terminal-border/20 bg-terminal-panel/30 w-[240px] h-20 font-mono group hover:border-terminal-green/30 transition-all relative overflow-hidden shrink-0">
    <div className="flex justify-between items-center h-4">
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-widest",
        task.status === 'completed' ? 'text-terminal-green/60' : task.status === 'running' ? 'text-terminal-green animate-pulse' : 'text-terminal-text/20'
      )}>{task.label}</span>
      <Badge dot={task.status === 'running'} variant={task.status === 'completed' ? 'positive' : task.status === 'running' ? 'neutral' : 'outline'} className="text-[7px] py-0 h-4 border-none bg-transparent">
        {task.status}
      </Badge>
    </div>
    
    <div className="flex items-baseline justify-between mt-1">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tighter text-terminal-text tabular-nums">{task.recordsCount || 0}</span>
        <span className="text-[8px] uppercase font-bold text-terminal-green/30 tracking-wider">RECORDS_SYNC</span>
      </div>
      <span className="text-[12px] font-bold text-terminal-green/40 tabular-nums">{task.progress}%</span>
    </div>

    <div className="space-y-1.5 mt-auto">
      <div className="w-full h-[1px] bg-white/[0.03] overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${task.progress}%` }}
          className={cn(
            "h-full transition-all duration-1000",
            task.status === 'completed' ? 'bg-terminal-green shadow-[0_0_4px_rgba(0,255,102,0.4)]' : 'bg-terminal-green/20'
          )}
        />
      </div>
      <div className="flex justify-between text-[7px] uppercase font-bold text-terminal-green/10 group-hover:text-terminal-green/30 transition-colors tracking-[0.15em]">
        <span className="truncate max-w-[120px]">{task.lastEvent || 'STBY_READY'}</span>
        <span>ET: {task.elapsedTime || '00:00'}</span>
      </div>
    </div>
  </div>
);

const PersistentStatusStrip = ({ tasks }: { tasks: ParallelTask[] }) => (
  <div className="h-[105px] shrink-0 flex items-center border-b border-terminal-border/30 bg-black/80 relative z-40 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
    <div className="h-full flex items-center px-8 gap-6 overflow-x-auto no-scrollbar">
      <div className="pr-8 py-2 border-r border-terminal-border/20 flex flex-col justify-center h-full shrink-0">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-terminal-green/40 italic">TELEMETRY_STRIP</h4>
        <p className="text-[8px] font-bold text-terminal-text/20 uppercase tracking-[0.2em] whitespace-nowrap mt-1 italic">ACTIVE_EGRESS_PIPELINE</p>
      </div>
      <div className="flex items-center gap-3">
        {tasks?.map(task => <TaskIndicator key={task.id} task={task} />)}
      </div>
    </div>
    
    {/* Decorative scanning line */}
    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-terminal-green/5 overflow-hidden">
      <motion.div 
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="w-[30%] h-full bg-gradient-to-r from-transparent via-terminal-green/40 to-transparent"
      />
    </div>
  </div>
);

const LiveOverviewTab = ({ session, events }: { session: AnalysisSession, events: LiveActionEvent[] }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
    {/* Demo Data Overview - Profile Stats */}
    {session.isDemo && session.rawProfileRows && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-terminal-green/20 bg-terminal-green/[0.02] flex flex-col font-mono">
          <span className="text-[8px] font-bold text-terminal-green/30 uppercase tracking-[0.2em]">DEMO_SEED_PROFILES</span>
          <span className="text-2xl font-bold text-terminal-green italic">{session.rawProfileRows.length}</span>
        </Card>
        <Card className="p-4 border-terminal-green/20 bg-terminal-green/[0.02] flex flex-col font-mono">
          <span className="text-[8px] font-bold text-terminal-green/30 uppercase tracking-[0.2em]">VERIFIED_ACCOUNTS</span>
          <span className="text-2xl font-bold text-terminal-amber italic">{session.rawProfileRows.filter(p => p.is_verified).length}</span>
        </Card>
        <Card className="p-4 border-terminal-green/20 bg-terminal-green/[0.02] flex flex-col font-mono">
          <span className="text-[8px] font-bold text-terminal-green/30 uppercase tracking-[0.2em]">PRIVATE_ACCOUNTS</span>
          <span className="text-2xl font-bold text-terminal-text/40 italic">{session.rawProfileRows.filter(p => p.is_private).length}</span>
        </Card>
        <Card className="p-4 border-terminal-green/20 bg-terminal-green/[0.02] flex flex-col font-mono">
          <span className="text-[8px] font-bold text-terminal-green/30 uppercase tracking-[0.2em]">DUPLICATE_FLAGS</span>
          <span className="text-2xl font-bold text-terminal-red/60 italic">{session.rawProfileRows.filter(p => p.duplicate_flag).length}</span>
        </Card>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-5 bg-terminal-green/[0.03] border-terminal-green/20 relative group overflow-hidden h-32 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-bold uppercase tracking-widest text-terminal-green/40">Session_Progress</p>
          <Activity className="w-4 h-4 text-terminal-green animate-pulse" />
        </div>
        <div className="text-4xl font-bold tracking-tighter text-terminal-text tabular-nums">{session.progress}%</div>
        <div className="h-1 bg-white/5 overflow-hidden">
           <motion.div animate={{ width: `${session.progress}%` }} className="h-full bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.3)] transition-all duration-700" />
        </div>
      </Card>

      <Card className="p-5 border-terminal-border/20 bg-black/20 h-32 flex flex-col">
        <p className="text-[10px] font-bold uppercase tracking-widest text-terminal-green/40 mb-3">Intelligence_Yield</p>
        <div className="flex-1 flex flex-col justify-center gap-2">
           <div className="flex justify-between items-baseline">
             <span className="text-[9px] font-bold uppercase text-terminal-text/40 tracking-wider">Narratives</span>
             <span className="text-2xl font-bold text-terminal-text tabular-nums">{session.extractedNarratives.length}</span>
           </div>
           <div className="flex justify-between items-baseline border-t border-white/[0.03] pt-2">
             <span className="text-[9px] font-bold uppercase text-terminal-text/40 tracking-wider">Evidence_Hits</span>
             <span className="text-2xl font-bold text-terminal-text tabular-nums">{session.webEvidence.length}</span>
           </div>
        </div>
      </Card>

      <Card className="p-5 border-terminal-border/20 bg-black/20 h-32 flex flex-col">
        <p className="text-[10px] font-bold uppercase tracking-widest text-terminal-green/40 mb-3">Collection_Efficiency</p>
        <div className="flex-1 flex flex-col justify-center gap-2">
           <div className="flex justify-between items-baseline">
             <span className="text-[9px] font-bold uppercase text-terminal-text/40 tracking-wider">Comments</span>
             <span className="text-2xl font-bold text-terminal-text tabular-nums">{session.scrapedComments.length}</span>
           </div>
           <div className="flex justify-between items-baseline border-t border-white/[0.03] pt-2">
             <span className="text-[9px] font-bold uppercase text-terminal-text/40 tracking-wider">Unique_Users</span>
             <span className="text-2xl font-bold text-terminal-text tabular-nums">{session.reportMetrics.totalUniqueCommentersMapped}</span>
           </div>
        </div>
      </Card>

      <Card className="p-5 border-terminal-border/20 bg-black/20 h-32 flex flex-col">
        <p className="text-[10px] font-bold uppercase tracking-widest text-terminal-green/40 mb-3">Execution_Queue</p>
        <div className="flex-1 flex flex-col justify-center gap-2">
           <div className="flex justify-between items-baseline">
             <span className="text-[9px] font-bold uppercase text-terminal-text/40 tracking-wider">Pending_Approvals</span>
             <span className="text-2xl font-bold text-terminal-amber tabular-nums">{session.approvals.filter(a => a.status === 'pending').length}</span>
           </div>
           <div className="flex justify-between items-baseline border-t border-white/[0.03] pt-2">
             <span className="text-[9px] font-bold uppercase text-terminal-text/40 tracking-wider">Supervised_Ops</span>
             <span className="text-2xl font-bold text-terminal-green tabular-nums">{session.actionQueue.length}</span>
           </div>
        </div>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-5 bg-black/40 border-terminal-border/20 overflow-hidden flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-5 border-b border-white/[0.03] pb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-terminal-green/40">Realtime_Action_Stream</h3>
          <Badge variant="outline" dot={false} className="text-[7px] opacity-40 italic">Syncing Active</Badge>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pr-2">
           {events.map((e, i) => (
             <div key={i} className="flex gap-4 items-center group font-mono text-[10px] hover:bg-white/[0.03] py-1.5 transition-all px-3 border-l-2 border-transparent hover:border-terminal-green/40">
                <span className="text-[8px] font-bold text-terminal-green/20 tabular-nums w-12">{new Date(e.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                <Badge variant={e.severity === 'critical' ? 'negative' : 'outline'} dot={false} className="text-[7px] h-4 py-0 px-1 opacity-60 uppercase">{e.type}</Badge>
                <span className="text-terminal-text/70 flex-1 truncate">{e.message}</span>
                {e.severity === 'high' && <AlertTriangle className="w-3 h-3 text-terminal-amber ml-auto animate-pulse" />}
             </div>
           ))}
        </div>
      </Card>

      <Card className="p-5 bg-black/40 border-terminal-border/20 overflow-hidden flex flex-col h-[400px]">
        <div className="flex items-center justify-between mb-5 border-b border-white/[0.03] pb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-terminal-red/40">Intervention_Required</h3>
          <Badge variant="negative" dot={true} className="text-[7px] border-none bg-transparent italic">Risk Flagged</Badge>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pr-1">
           {session.reviewQueue.slice(0, 5).map(item => (
             <div key={item.id} className="p-4 border border-terminal-red/10 bg-terminal-red/[0.02] flex flex-col gap-3 group hover:bg-terminal-red/[0.05] transition-all cursor-pointer relative">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-terminal-text tracking-wide">{item.handle}</span>
                  <Activity className="w-3 h-3 text-terminal-red/20 group-hover:text-terminal-red/60 animate-pulse" />
                </div>
                <p className="text-[10px] px-2 italic text-terminal-text/40 border-l border-terminal-red/20 leading-relaxed group-hover:text-terminal-text/70 transition-colors">"{item.riskReason}"</p>
                <div className="flex gap-2 justify-end">
                   <Button variant="outline" className="h-7 px-3 text-[9px] font-bold uppercase border-terminal-red/10 text-terminal-red/40 hover:text-terminal-red hover:bg-terminal-red/10">MANUAL_REVIEW</Button>
                </div>
             </div>
           ))}
           {session.reviewQueue.length === 0 && (
             <div className="flex flex-col items-center justify-center h-40 border border-dashed border-terminal-border/5">
                <ShieldCheck className="w-8 h-8 text-terminal-green/5 mb-2" />
                <span className="text-[8px] font-bold uppercase text-terminal-green/10">No_Interventions_Pending</span>
             </div>
           )}
        </div>
      </Card>
    </div>
  </motion.div>
);

// --- Internal Widgets ---

const IntakePanel = ({ onStart }: { onStart: (req: IntakeRequest) => void }) => {
  const [formData, setFormData] = useState<IntakeRequest>({
    url: 'https://www.instagram.com/jaksic.official/',
    handle: 'jaksic.official',
    source: 'instagram',
    mode: 'latest_n',
    count: 3,
    commentLimit: 20,
    likeLimit: 0,
    competitorCount: 0,
    includeCompetitors: false,
    urls: 'https://www.instagram.com/p/DRpmfFqiHeE/\nhttps://www.instagram.com/p/DHMA3r-omu9/\nhttps://www.instagram.com/p/DHELu5KIUlc/'
  });

  const scanProfiles = {
    fast: { count: 1, commentLimit: 5, likeLimit: 0, competitorCount: 0, includeCompetitors: false },
    standard: { count: 3, commentLimit: 25, likeLimit: 10, competitorCount: 0, includeCompetitors: false },
    full: { count: 5, commentLimit: 80, likeLimit: 80, competitorCount: 3, includeCompetitors: true },
  };

  const [scanProfile, setScanProfile] = useState<keyof typeof scanProfiles>('standard');

  const applyScanProfile = (profile: keyof typeof scanProfiles) => {
    setScanProfile(profile);
    setFormData(data => ({ ...data, ...scanProfiles[profile] }));
  };

  const applyPreset = (preset: 'jaksic' | 'koi') => {
    if (preset === 'jaksic') {
      setFormData({
        url: 'https://www.instagram.com/jaksic.official/',
        handle: 'jaksic.official',
        source: 'instagram',
        mode: 'latest_n',
        ...scanProfiles[scanProfile],
        urls: 'https://www.instagram.com/p/DRpmfFqiHeE/\nhttps://www.instagram.com/p/DHMA3r-omu9/\nhttps://www.instagram.com/p/DHELu5KIUlc/'
      });
    } else {
      setFormData({
        url: 'https://www.instagram.com/koi__log/',
        handle: 'koi__log',
        source: 'instagram',
        mode: 'latest_n',
        ...scanProfiles[scanProfile],
        urls: 'https://www.instagram.com/p/DXbdSTgAJuF/\nhttps://www.instagram.com/p/DV0jaK5j3JL/'
      });
    }
  };

  return (
    <Card className="console-panel border-terminal-border/40 bg-black/40 p-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-6 border-b border-terminal-border/20 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/50">Tactical_Intake_v4.5</h3>
        <Badge variant="outline" className="text-[8px] border-terminal-green/20 text-terminal-green/40 italic">Engine_Ready</Badge>
      </div>

      <div className="mb-6 space-y-2">
        <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Load_Simulation_Preset</label>
        <div className="flex gap-2">
           <button 
             onClick={() => applyPreset('jaksic')}
             className={cn("flex-1 py-1.5 border text-[8px] font-black uppercase tracking-tighter transition-all", 
               formData.handle === 'jaksic.official' ? "bg-terminal-green/20 text-terminal-green border-terminal-green/40" : "border-terminal-border/20 text-terminal-text/20 hover:border-terminal-green/30"
             )}
           >PRM: JAKSIC_OFFICIAL</button>
           <button 
             onClick={() => applyPreset('koi')}
             className={cn("flex-1 py-1.5 border text-[8px] font-black uppercase tracking-tighter transition-all", 
               formData.handle === 'koi__log' ? "bg-terminal-green/20 text-terminal-green border-terminal-green/40" : "border-terminal-border/20 text-terminal-text/20 hover:border-terminal-green/30"
             )}
           >SEC: KOI_LOG_DEMO</button>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Scan_Depth_Profile</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            ['fast', 'FAST'],
            ['standard', 'STANDARD'],
            ['full', 'FULL']
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => applyScanProfile(value)}
              className={cn(
                "py-1.5 border text-[8px] font-black uppercase tracking-tighter transition-all",
                scanProfile === value ? "bg-terminal-green text-black border-terminal-green" : "border-terminal-border/20 text-terminal-text/20 hover:border-terminal-green/30"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 no-scrollbar font-mono">
         <div className="space-y-1.5">
           <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Primary Workspace Target (URL)</label>
           <input 
             type="text" 
             className="w-full bg-terminal-bg border border-terminal-border/30 px-3 py-2 text-[11px] focus:border-terminal-green/50 outline-none transition-all placeholder:text-terminal-green/10"
             placeholder="https://instagram.com/target_profile"
             value={formData.url}
             onChange={e => {
               const url = e.target.value;
               const shouldClearDemoHandle = ['jaksic.official', 'koi__log'].includes(formData.handle) && !url.includes(formData.handle);
               setFormData({...formData, url, handle: shouldClearDemoHandle ? '' : formData.handle});
             }}
           />
         </div>

         <div className="grid grid-cols-2 gap-3">
           <div className="space-y-1.5">
             <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Platform</label>
             <select 
               className="w-full bg-terminal-bg border border-terminal-border/30 px-2 py-2 text-[11px] uppercase font-black text-terminal-green outline-none"
               value={formData.source}
               onChange={e => setFormData({...formData, source: e.target.value as Platform})}
             >
               <option value="instagram">Instagram</option>
               <option value="x">X / BlueSky</option>
               <option value="forum">Public Forums</option>
               <option value="news">News Portals</option>
               <option value="tiktok">Mentions/TikTok</option>
             </select>
           </div>
           <div className="space-y-1.5">
             <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Target Handle</label>
             <input 
               type="text" 
               className="w-full bg-terminal-bg border border-terminal-border/30 px-3 py-2 text-[11px] focus:border-terminal-green/50 outline-none transition-all"
               placeholder="@handle"
               value={formData.handle}
               onChange={e => setFormData({...formData, handle: e.target.value})}
             />
           </div>
         </div>

         <div className="space-y-1.5">
            <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Intake_Sequence_Mode</label>
            <div className="flex gap-2">
            {[
              { value: 'latest_n', label: 'latest posts' },
              { value: 'manual_urls', label: 'url list' }
            ].map((m) => (
                 <button 
                   key={m.value}
                   onClick={() => setFormData({ ...formData, mode: m.value as IntakeRequest['mode'] })}
                   className={cn(
                     "flex-1 py-2 border text-[9px] font-black uppercase tracking-widest transition-all",
                     formData.mode === m.value ? "bg-terminal-green text-black border-terminal-green" : "border-terminal-border/30 text-terminal-green/40 hover:border-terminal-green/60"
                   )}
                 >{m.label}</button>
               ))}
            </div>
         </div>

         {formData.mode === 'latest_n' ? (
           <div className="space-y-1.5">
             <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Total Scrape Depth (N Posts)</label>
             <input 
               type="number" 
               className="w-full bg-terminal-bg border border-terminal-border/30 px-3 py-2 text-[11px] focus:border-terminal-green/50 outline-none transition-all"
               value={formData.count}
               onChange={e => setFormData({...formData, count: parseInt(e.target.value)})}
             />
           </div>
         ) : (
           <div className="space-y-1.5">
             <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Manual URL List (Multi-line)</label>
             <textarea 
               rows={3}
               className="w-full bg-terminal-bg border border-terminal-border/30 px-3 py-2 text-[10px] focus:border-terminal-green/50 outline-none transition-all resize-none"
               placeholder="Enter target URLs..."
               value={formData.urls}
               onChange={e => setFormData({...formData, urls: e.target.value})}
             />
           </div>
         )}

         <div className="grid grid-cols-3 gap-3">
           <div className="space-y-1.5">
             <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Comments</label>
             <input
               type="number"
               className="w-full bg-terminal-bg border border-terminal-border/30 px-3 py-2 text-[11px] focus:border-terminal-green/50 outline-none transition-all"
               value={formData.commentLimit ?? 20}
               onChange={e => setFormData({...formData, commentLimit: parseInt(e.target.value) || 0})}
             />
           </div>
           <div className="space-y-1.5">
             <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Likes</label>
             <input
               type="number"
               className="w-full bg-terminal-bg border border-terminal-border/30 px-3 py-2 text-[11px] focus:border-terminal-green/50 outline-none transition-all"
               value={formData.likeLimit ?? 0}
               onChange={e => setFormData({...formData, likeLimit: parseInt(e.target.value) || 0})}
             />
           </div>
           <div className="space-y-1.5">
             <label className="text-[8px] text-terminal-green/30 uppercase font-black tracking-widest">Rivals</label>
             <input
               type="number"
               className="w-full bg-terminal-bg border border-terminal-border/30 px-3 py-2 text-[11px] focus:border-terminal-green/50 outline-none transition-all"
               value={formData.competitorCount ?? 0}
               onChange={e => {
                 const competitorCount = Math.max(0, Math.min(3, parseInt(e.target.value) || 0));
                 setFormData({...formData, competitorCount, includeCompetitors: competitorCount > 0});
               }}
             />
           </div>
         </div>
      </div>

      <div className="mt-6 pt-6 border-t border-terminal-border/10">
        <Button 
          className="w-full h-11 bg-terminal-green border-none text-black font-black uppercase tracking-[0.2em] italic group"
          onClick={() => onStart(formData)}
        >
          INITIALIZE_REAL_SCAN <Play className="w-4 h-4 ml-2 fill-current" />
        </Button>
      </div>
    </Card>
  );
};

const CollectionBoard = ({ sourceRuns }: { sourceRuns: SourceRun[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {['instagram', 'x', 'forum', 'news'].map((s) => {
        const run = sourceRuns.find(r => r.source === s);
        return (
          <Card key={s} className={cn(
            "p-5 font-mono relative overflow-hidden group transition-all h-44 flex flex-col justify-between",
            run?.status === 'running' ? "border-terminal-green/30 bg-terminal-green/[0.02]" : "border-white/[0.05] bg-black/20"
          )}>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className={cn("w-1 h-1 rounded-full", 
                   !run ? "bg-white/10" : run.status === 'running' ? "bg-terminal-green animate-pulse shadow-[0_0_5px_#00FF66]" : "bg-terminal-green/40"
                 )} />
                 <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-terminal-green/30">{s} stream</span>
               </div>
               <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="text-terminal-text/20 hover:text-terminal-green transition-colors"><Pause className="w-3 h-3" /></button>
                 <button className="text-terminal-text/20 hover:text-terminal-red transition-colors"><StopCircle className="w-3 h-3" /></button>
               </div>
            </div>

            <div className="flex flex-col gap-1">
               <div className="text-3xl font-bold tracking-tighter text-terminal-text tabular-nums">{run?.recordsCollected || 0}</div>
               <div className="text-[8px] font-bold uppercase text-terminal-text/20 tracking-widest leading-none">Records_Captured</div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-terminal-green/20">
                 <span>Sync_Progress</span>
                 <span className="tabular-nums">{run?.progress || 0}%</span>
               </div>
               <div className="w-full h-0.5 bg-white/5 border border-white/[0.03]">
                 <motion.div 
                   animate={{ width: `${run?.progress || 0}%` }}
                   className="h-full bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.3)] transition-all duration-1000"
                 />
               </div>
            </div>

            <div className="pt-2 border-t border-white/[0.03] grid grid-cols-2 gap-2 text-[7px] uppercase font-bold text-terminal-text/20 tracking-wider">
               <div className="flex items-center gap-1">
                 <Clock className="w-2.5 h-2.5 opacity-40" />
                 <span>{run ? '08:42:15' : '--:--:--'}</span>
               </div>
               <div className="flex items-center gap-1 justify-end">
                 <Activity className="w-2.5 h-2.5 opacity-40" />
                 <span>12ms_STABLE</span>
               </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const PipelineWidget = ({ label, status, progress }: { label: string, status: string, progress: number, [key: string]: any }) => (
  <div className="px-5 py-3 flex items-center gap-5 border-b border-white/[0.03] group hover:bg-white/[0.01] transition-colors font-mono h-14">
    <div className={cn(
      "w-7 h-7 flex items-center justify-center border transition-all",
      status === 'completed' ? "border-terminal-green/40 bg-terminal-green/5 text-terminal-green" :
      status === 'running' ? "border-terminal-green animate-pulse bg-terminal-green/5 text-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.15)]" :
      "border-white/10 text-white/10"
    )}>
      {status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
       status === 'running' ? <Activity className="w-3.5 h-3.5" /> : 
       <Clock className="w-3.5 h-3.5" />}
    </div>
    <div className="flex-1 flex flex-col justify-center">
      <div className="flex justify-between items-baseline mb-1">
         <span className={cn("text-[10px] font-bold uppercase tracking-[0.15em]", 
           status === 'completed' ? "text-terminal-green/60" : status === 'running' ? "text-terminal-green" : "text-terminal-text/20"
         )}>{label}</span>
         <span className="text-[8px] font-bold text-terminal-green/20 uppercase tracking-widest tabular-nums">{progress}%</span>
      </div>
      <div className="w-full h-[1px] bg-white/[0.03]">
        <motion.div animate={{ width: `${progress}%` }} className="h-full bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.3)] transition-all" />
      </div>
    </div>
    <div className="w-8 flex justify-end">
      <MoreVertical className="w-3.5 h-3.5 text-white/5 group-hover:text-terminal-green/30 transition-colors cursor-pointer" />
    </div>
  </div>
);

// --- Main Page Component ---

export default function LiveOperationsTerminal() {
  const { 
    activeSession, 
    sessions, 
    sourceRuns, 
    liveEvents, 
    responderGroups, 
    activeClientId,
    clients,
    startAnalysis,
    tickSession,
    setActiveSession,
    accountHealth,
    reviewQueue,
    approvalItems,
    activeOpsTab,
    unlockedOpsTabs,
    autoOpsSwitchEnabled,
    setOpsTab,
    toggleAutoOpsSwitch
  } = useStore();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [intelSubview, setIntelSubview] = useState<'MAP' | 'EVIDENCE'>('MAP');
  const activeClient = clients.find(c => c.id === activeClientId);

  const isTabComplete = (tab: string) => {
    if (!activeSession) return false;
    if (activeSession.status === 'completed') return true;
    
    const allStages: AnalysisStageType[] = [
      'validating_inputs', 'collecting_posts', 'collecting_comments', 'collecting_mentions',
      'scanning_portals', 'scanning_forums', 'extracting_narratives', 'building_network_map',
      'scoring_account_health', 'flagging_review_items', 'assembling_report', 'ready_for_review',
      'planning_responses', 'awaiting_approval', 'supervising', 'completed'
    ];

    const tabEndStages: Record<string, AnalysisStageType> = {
      terminal: 'scanning_forums',
      intelligence: 'assembling_report',
      planning: 'planning_responses',
      supervisor: 'completed'
    };

    const currentIdx = allStages.indexOf(activeSession.currentStage);
    const tabEndIdx = allStages.indexOf(tabEndStages[tab]);

    return currentIdx > tabEndIdx;
  };

  // Simulation Engine Hook
  useEffect(() => {
    let interval: any;
    if (activeSession && activeSession.status === 'active' && activeSession.currentStage !== 'completed') {
      interval = setInterval(() => {
        tickSession(activeSession.id);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.status, activeSession?.currentStage, tickSession]);

  // Dynamic Analysis Stages based on session
  const stages: AnalysisStageWidget[] = useMemo(() => {
    const allStages: AnalysisStageType[] = [
      'validating_inputs', 'collecting_posts', 'collecting_comments', 'extracting_narratives', 'building_network_map', 'scoring_account_health', 'assembling_report', 'ready_for_review'
    ];
    
    return allStages.map(s => {
      const isCompleted = allStages.indexOf(s) < allStages.indexOf(activeSession?.currentStage || 'validating_inputs') || activeSession?.currentStage === 'completed';
      const isRunning = s === activeSession?.currentStage && activeSession?.status === 'active';
      return {
        id: s,
        label: s.replace(/_/g, ' ').toUpperCase(),
        status: isCompleted ? 'completed' : isRunning ? 'running' : 'waiting',
        progress: isCompleted ? 100 : isRunning ? (activeSession?.progress || 0) % (100 / allStages.length) * (allStages.length) : 0
      };
    });
  }, [activeSession?.currentStage, activeSession?.status, activeSession?.progress]);

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-terminal-bg text-terminal-text font-mono no-scrollbar">
      
      {/* TOP STRIP */}
      <div className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-terminal-border/40 bg-black/40 relative z-50">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
             <Terminal className="w-4 h-4 text-terminal-green" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-terminal-green tracking-widest">Console_Terminal</span>
                <span className="text-[8px] font-black text-terminal-green/30 uppercase opacity-60">Mission_Status: Nominal</span>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="h-8 w-[1px] bg-white/5" />
             <div className="flex items-center gap-3">
               <div className="flex flex-col">
                  <span className="text-[7px] uppercase font-black text-terminal-green/20">Active_Workspace</span>
                  <select 
                    className="bg-transparent border-none text-[10px] font-black uppercase text-terminal-text outline-none p-0 appearance-none"
                    value={activeSession?.id}
                    onChange={(e) => setActiveSession(e.target.value)}
                  >
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.id} - {s.accountHandle}</option>
                    ))}
                  </select>
               </div>
             </div>
             <div className="flex items-center gap-3">
               <div className="flex flex-col">
                  <span className="text-[7px] uppercase font-black text-terminal-green/20">Client_Matrix</span>
                  <span className="text-[10px] font-black uppercase text-terminal-green italic">{activeClient?.name}</span>
               </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex items-center gap-4">
              <div className="group flex items-center gap-2 cursor-pointer h-10 px-4 border border-terminal-border/20 hover:border-terminal-green transition-all bg-white/[0.02]">
                 <Activity className="w-3.5 h-3.5 text-terminal-green animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-terminal-green">Live_Telemetry</span>
              </div>
           </div>
        </div>
      </div>

      {/* PERSISTENT STATUS STRIP */}
      {activeSession && <PersistentStatusStrip tasks={activeSession.parallelTasks} />}

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6 terminal-grid">
        
        {/* LEFT COLUMN */}
        <div className="w-[340px] shrink-0 flex flex-col gap-6 overflow-hidden">
           <IntakePanel onStart={startAnalysis} />
           
           <Card className="flex-1 flex flex-col p-5">
              <div className="flex items-center justify-between mb-5 border-b border-white/[0.03] pb-3">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-terminal-green/40">Session_History</h3>
                <Badge variant="outline" className="h-4 py-0 text-[7px]" dot={false}>{sessions.length}</Badge>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {sessions.map(s => (
                  <div key={s.id} className={cn(
                    "p-3 border transition-all hover:bg-white/[0.03] cursor-pointer relative",
                    activeSession?.id === s.id ? "bg-terminal-green/[0.03] border-terminal-green/30" : "border-white/[0.05]"
                  )} onClick={() => setActiveSession(s.id)}>
                    {activeSession?.id === s.id && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.5)]" />}
                    <div className="flex justify-between items-start mb-1.5">
                       <span className="text-[10px] font-bold uppercase text-terminal-text tracking-wide">{s.accountHandle}</span>
                       <Badge variant={s.status === 'completed' ? 'positive' : 'info'} dot={s.status === 'active'} className="text-[7px] py-0 h-4 border-none bg-transparent opacity-60 italic">{s.status}</Badge>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-terminal-green/20 uppercase tracking-widest">
                       <span>{s.createdAt}</span>
                       <span className="opacity-40">#{s.id.slice(0, 8)}</span>
                    </div>
                  </div>
                ))}
              </div>
           </Card>
        </div>

        {/* CENTER MAIN AREA */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10">
           
           <div className="flex items-center gap-6 border-b border-white/[0.05]">
              {['overview', 'terminal', 'intelligence', 'planning', 'supervisor'].map((tab) => {
                const isUnlocked = unlockedOpsTabs.includes(tab as any);
                const isActive = activeOpsTab === tab;
                const isComplete = isTabComplete(tab);
                
                return (
                  <button 
                    key={tab} 
                    onClick={() => isUnlocked && setOpsTab(tab as any)}
                    disabled={!isUnlocked}
                    className={cn(
                      "pb-4 px-2 text-[10px] uppercase font-black tracking-[0.2em] transition-all relative flex items-center gap-2 group",
                      isActive ? "text-terminal-green" : isUnlocked ? "text-terminal-green/60 hover:text-terminal-green" : "text-terminal-green/10 cursor-not-allowed"
                    )}
                  >
                    {isComplete ? <CheckCircle2 className="w-2.5 h-2.5 text-terminal-green" /> : !isUnlocked && <Lock className="w-2.5 h-2.5 opacity-50" />}
                    {tab}_view
                    
                    {!isUnlocked && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-black border border-terminal-border text-[7px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] tracking-widest text-white translate-y-1 group-hover:translate-y-0">
                        LOCKED // AWAITING_STAGE_REQUISITES
                      </div>
                    )}
                    
                    {isActive && <motion.div layoutId="terminal-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.5)]" />}
                  </button>
                );
              })}

              <div className="ml-auto pb-4 flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-1 bg-white/[0.01] border border-terminal-border/10 rounded-sm">
                  <span className={cn("text-[7px] font-black uppercase tracking-widest transition-colors", autoOpsSwitchEnabled ? "text-terminal-green/60" : "text-terminal-green/10")}>Auto_Orchestration</span>
                  <button 
                    onClick={toggleAutoOpsSwitch}
                    className={cn(
                      "w-7 h-3.5 rounded-none relative transition-colors duration-300 border border-terminal-border/20",
                      autoOpsSwitchEnabled ? "bg-terminal-green/20 border-terminal-green/40" : "bg-black"
                    )}
                  >
                    <motion.div 
                      animate={{ x: autoOpsSwitchEnabled ? 14 : 2 }}
                      initial={false}
                      className={cn("absolute top-0.5 left-0 w-2 h-2 rounded-none", autoOpsSwitchEnabled ? "bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.5)]" : "bg-terminal-border/40")}
                    />
                  </button>
                </div>
              </div>
           </div>

           {activeOpsTab === 'overview' && activeSession && (
             <LiveOverviewTab session={activeSession} events={liveEvents} />
           )}

           {activeOpsTab === 'terminal' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                     <h2 className="text-[11px] font-black uppercase tracking-widest text-terminal-green/60">Stage_01 // Live_Collection_Board</h2>
                     <div className="flex items-center gap-3">
                        <span className="text-[8px] font-black text-terminal-green/20 uppercase">Refresh_Frequency: 500ms</span>
                     </div>
                  </div>
                  <CollectionBoard sourceRuns={sourceRuns.filter(r => r.sessionId === activeSession?.id)} />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <Card className="console-panel border-terminal-border/30 bg-black/40 overflow-hidden flex flex-col h-[400px]">
                      <div className="px-6 py-4 border-b border-terminal-border/20 flex items-center justify-between bg-white/[0.02]">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40">Stage_02 // Analysis_Pipeline</h3>
                         <Badge variant="outline" className="text-[8px] border-terminal-border/20 animate-pulse text-terminal-green">Synchronizing</Badge>
                      </div>
                      <div className="flex-1 overflow-y-auto no-scrollbar">
                         {stages.map((stage) => (
                           <PipelineWidget 
                             key={stage.id} 
                             label={stage.label} 
                             status={stage.status} 
                             progress={stage.progress} 
                           />
                         ))}
                      </div>
                   </Card>

                   <Card className="console-panel border-terminal-border/30 bg-black/40 p-8 flex flex-col h-[400px]">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40">Stage_03 // Report_Metrics_Snapshot</h3>
                        <Button variant="secondary" className="h-7 px-3 text-[9px] font-black border-terminal-border">VIEW_FULL_MATRIX</Button>
                      </div>
                      
                       <div className="grid grid-cols-2 gap-8 flex-1">
                          <div className="space-y-6">
                             {[
                               { label: 'Posts_Analyzed', val: activeSession?.reportMetrics.totalPostsAnalyzed || 0, unit: 'cnt' },
                               { label: 'Comments_Collected', val: activeSession?.reportMetrics.totalCommentsCollected || 0, unit: 'rec' },
                               { label: 'Unique_Users_Mapped', val: activeSession?.reportMetrics.totalUniqueCommentersMapped || 0, unit: 'net' }
                             ].map((m, i) => (
                               <div key={i} className="space-y-1 group cursor-default">
                                 <span className="text-[8px] font-black text-terminal-green/20 uppercase tracking-widest group-hover:text-terminal-green/40 transition-colors">{m.label}</span>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black italic text-terminal-text">{m.val}</span>
                                    <span className="text-[9px] font-black text-terminal-green/30 italic">{m.unit}</span>
                                 </div>
                               </div>
                             ))}
                          </div>
                          <div className="flex flex-col justify-center items-center relative gap-4 border-l border-terminal-border/10 pl-8">
                             <div className="w-24 h-24 rounded-full border-4 border-terminal-green border-t-transparent animate-spin-slow opacity-20 absolute" />
                             <div className="text-5xl font-black italic tracking-tighter text-terminal-text terminal-glow">{activeSession?.reportMetrics.accountHealthScore || 0}</div>
                             <div className="text-[10px] font-black uppercase tracking-widest text-terminal-green animate-pulse">
                               {activeSession?.reportMetrics.accountHealthScore && activeSession.reportMetrics.accountHealthScore > 80 ? 'Stability_High' : 'Stability_Calculating'}
                             </div>
                          </div>
                       </div>
                   </Card>
                </div>

                 <Card className="console-panel border-terminal-border/30 bg-black/40 p-10 flex flex-col items-center justify-center min-h-[300px]">
                    <Activity className="w-12 h-12 text-terminal-green/10 mb-4 animate-pulse" />
                    <p className="text-[10px] font-black uppercase text-terminal-green/30 tracking-widest text-center max-w-xs leading-relaxed">
                       Tactical_Data_Point_Collection_Active. Monitoring_Egress_And_Ingestion_Sync. Use_Intelligence_Tab_To_Visualize_Refined_Metrics_Once_Unlocked.
                    </p>
                 </Card>

                 {/* Demo Secret Data Tables */}
                 {activeSession?.isDemo && (
                   <div className="space-y-8">
                     <section className="space-y-4">
                        <h2 className="text-[11px] font-black uppercase tracking-widest text-terminal-green/60 italic">Raw_Profile_Seed_Import</h2>
                        <Card className="border-terminal-border/20 bg-black/40 overflow-hidden font-mono">
                           <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                              <table className="w-full text-left text-[9px] border-collapse">
                                 <thead className="sticky top-0 bg-black border-b border-terminal-border/20 text-terminal-green/40 uppercase tracking-widest">
                                    <tr>
                                       <th className="p-3">Username</th>
                                       <th className="p-3">Verified</th>
                                       <th className="p-3">Private</th>
                                       <th className="p-3">Followers</th>
                                       <th className="p-3">Duplicate</th>
                                       <th className="p-3">Cluster</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/[0.03]">
                                    {activeSession.rawProfileRows?.map((row, i) => (
                                       <tr key={i} className="hover:bg-white/[0.02]">
                                          <td className="p-3 text-terminal-text">{row.username}</td>
                                          <td className="p-3">{row.is_verified ? <CheckCircle2 className="w-3 h-3 text-terminal-green" /> : <span className="opacity-20">-</span>}</td>
                                          <td className="p-3">{row.is_private ? 'YES' : 'NO'}</td>
                                          <td className="p-3 tabular-nums">{row.follower_count?.toLocaleString()}</td>
                                          <td className="p-3">{row.duplicate_flag ? <Badge variant="negative" className="text-[7px] py-0 h-3">DUPE</Badge> : <span className="opacity-10">-</span>}</td>
                                          <td className="p-3 text-terminal-green/40">{row.cluster_assignment}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </Card>
                     </section>

                     <section className="space-y-4">
                        <h2 className="text-[11px] font-black uppercase tracking-widest text-terminal-green/60 italic">Raw_Comments_Seed_Import</h2>
                        <Card className="border-terminal-border/20 bg-black/40 overflow-hidden font-mono">
                           <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                              <table className="w-full text-left text-[9px] border-collapse">
                                 <thead className="sticky top-0 bg-black border-b border-terminal-border/20 text-terminal-green/40 uppercase tracking-widest">
                                    <tr>
                                       <th className="p-3">User</th>
                                       <th className="p-3">Comment_Text</th>
                                       <th className="p-3">Timestamp</th>
                                       <th className="p-3">Target_Post</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/[0.03]">
                                    {activeSession.rawCommentRows?.map((row, i) => (
                                       <tr key={i} className="hover:bg-white/[0.02]">
                                          <td className="p-3 text-terminal-text/80">@{row.ownerUsername}</td>
                                          <td className="p-3 max-w-[300px] truncate">{row.text}</td>
                                          <td className="p-3 opacity-40">{new Date(row.timestamp).toLocaleString()}</td>
                                          <td className="p-3 text-terminal-green/20 italic">{row.postUrl.split('/').slice(-2)[0]}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </Card>
                     </section>
                   </div>
                 )}
             </motion.div>
           )}

           {activeOpsTab === 'intelligence' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex bg-terminal-panel/50 border border-terminal-border p-1 w-fit font-mono mb-4">
                  {[
                    { id: 'MAP', label: 'Network Mapping', icon: Layers },
                    { id: 'EVIDENCE', label: 'Web Evidence', icon: Globe },
                  ].map((sub) => (
                    <button 
                      key={sub.id} 
                      onClick={() => setIntelSubview(sub.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 text-[10px] uppercase font-black tracking-[0.2em] transition-all", 
                        intelSubview === sub.id ? "bg-terminal-green text-black" : "text-terminal-green/40 hover:text-terminal-green/70"
                      )}
                    >
                      <sub.icon className="w-3 h-3" />
                      {sub.label}
                    </button>
                  ))}
                </div>
                {intelSubview === 'MAP' ? <AudienceMap /> : <WebEvidence />}
             </motion.div>
           )}
           
           {activeOpsTab === 'planning' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
                <Card className="console-panel border-terminal-border/30 bg-black/40 p-10 min-h-[700px] flex flex-col relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Zap className="w-64 h-64 text-terminal-green" />
                   </div>

                   <div className="flex items-center justify-between mb-10 border-b border-terminal-border/10 pb-8 relative z-10">
                      <div>
                        <h2 className="text-2xl font-black italic uppercase text-terminal-text mb-2 tracking-tighter">Response_Planning_Suite</h2>
                        <p className="text-[11px] text-terminal-green/30 font-black uppercase tracking-widest italic font-mono max-w-xl">
                          Strategic response generation linked to session-indexed narratives. 
                          <span className="text-terminal-amber/60"> Mandatory_human_approval_required_for_dispatch_to_supervised_queue.</span>
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <Button variant="secondary" className="border-terminal-border text-terminal-text/40 font-black uppercase text-[10px] tracking-widest h-12 px-6 hover:text-terminal-green hover:border-terminal-green transition-all">
                           LOAD_TEMPLATES
                        </Button>
                        <Button className="bg-terminal-green text-black font-black uppercase tracking-widest italic px-8 h-12 shadow-[0_0_20px_rgba(0,255,102,0.4)]">
                          AUTO_DRAFT_PLAN <Zap className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                   </div>

                   <div className="flex-1 grid grid-cols-12 gap-10 relative z-10">
                      <div className="col-span-3 space-y-8 border-r border-terminal-border/10 pr-8">
                         <div className="space-y-2">
                           <h4 className="text-[11px] font-black uppercase text-terminal-green/40 tracking-[0.2em] mb-4 font-mono">Narrative_Alignment</h4>
                           {activeSession?.extractedNarratives.map(n => (
                              <div key={n.id} className="flex items-center justify-between group cursor-pointer hover:bg-terminal-green/5 p-3 border border-transparent hover:border-terminal-green/20 transition-all font-mono">
                                 <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-terminal-text group-hover:text-terminal-green uppercase">{n.label}</span>
                                   <span className="text-[8px] text-terminal-green/20 font-black uppercase">Reach: {n.reachEstimate}</span>
                                 </div>
                                 <Badge variant="outline" className="text-[8px] border-terminal-border/20 text-terminal-green/40">{n.commentCount}</Badge>
                              </div>
                           ))}
                         </div>

                         <div className="pt-8 border-t border-terminal-border/10">
                            <h4 className="text-[11px] font-black uppercase text-terminal-green/40 tracking-[0.2em] mb-4 font-mono">Tone_Profiles</h4>
                            <div className="space-y-2">
                               {['Authorized_Warm', 'Technical_Authority', 'Fact_Correction', 'Empathetic_Scale'].map(t => (
                                 <div key={t} className="flex justify-between items-center p-2 text-[9px] font-black uppercase text-terminal-text/40 hover:text-terminal-green cursor-pointer transition-colors border border-terminal-border/10">
                                   <span>{t}</span>
                                   <ChevronRight className="w-3 h-3" />
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                       <div className="col-span-9 space-y-6">
                         <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[11px] font-black uppercase text-terminal-green/40 tracking-[0.2em] font-mono">Suggested_Simulated_Replies</h4>
                            <Badge variant="outline" className="text-[9px] border-terminal-border/20 text-terminal-text/30">{activeSession?.responsePlan.suggestions.length || 0} DRAFTS_UNPROCESSED</Badge>
                         </div>

                         <div className="grid grid-cols-1 gap-6 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                            {([...(activeSession?.responsePlan?.suggestions || []), ...initialData.mockContentSuggestions?.slice(0, 5) || []]).map((suggestion, i) => (
                              <Card key={`${suggestion.id}-${i}`} className="p-8 border-terminal-border/20 bg-black/40 hover:bg-white/[0.02] transition-all group relative">
                                 <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-3">
                                       <Badge variant="outline" className="text-[9px] border-terminal-green/30 text-terminal-green font-black uppercase tracking-widest italic">{suggestion.type}</Badge>
                                       <Badge variant="secondary" className="text-[9px] border-terminal-border/20 uppercase font-black text-terminal-text/40">TONE_{suggestion.tone.toUpperCase()}</Badge>
                                       <Badge variant="outline" className="text-[9px] border-terminal-red/10 text-terminal-red/30 italic">RISK_{suggestion.risk.toUpperCase()}</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                       <button className="w-9 h-9 flex items-center justify-center border border-terminal-border/20 text-terminal-green/30 hover:text-terminal-green transition-all bg-black"><Edit3 className="w-4 h-4" /></button>
                                       <button className="w-9 h-9 flex items-center justify-center border border-terminal-border/20 text-terminal-green/30 hover:text-terminal-green transition-all bg-black"><MoreVertical className="w-4 h-4" /></button>
                                    </div>
                                 </div>

                                 <div className="mb-8 relative">
                                    <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-terminal-green/20" />
                                    <p className="text-[13px] text-terminal-text leading-relaxed font-mono italic">"{suggestion.content}"</p>
                                    <p className="text-[9px] text-terminal-green/20 font-black uppercase mt-4 italic tracking-widest">Linked_Narrative: <span className="text-terminal-green/40">{suggestion.goal}</span></p>
                                 </div>

                                 <div className="flex items-center justify-between pt-6 border-t border-terminal-border/10">
                                    <div className="flex items-center gap-4">
                                       <div className="w-8 h-8 rounded-none bg-terminal-green/5 border border-terminal-green/20 flex items-center justify-center text-[10px] font-black text-terminal-green italic">D_{i+1}</div>
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-black uppercase text-terminal-green/40 tracking-widest">Status: <span className={cn(suggestion.status === 'pending' ? "text-terminal-amber/60" : "text-terminal-green")}>{suggestion.status}</span></span>
                                          <span className="text-[8px] font-black text-terminal-text/20 uppercase italic">Awaiting stakeholder egress</span>
                                       </div>
                                    </div>
                                    <div className="flex gap-4">
                                       <Button variant="secondary" className="h-10 px-6 text-[10px] font-black uppercase italic border-terminal-border text-terminal-red/40 hover:text-terminal-red">ARCHIVE</Button>
                                       <Button 
                                          className="h-10 px-8 text-[10px] font-black uppercase italic bg-terminal-green text-black border-none shadow-[0_0_15px_rgba(0,255,102,0.2)] hover:shadow-[0_0_25px_rgba(0,255,102,0.4)]"
                                          onClick={() => {
                                             if (activeSession?.isDemo) {
                                               useStore.getState().approveDemoAction(suggestion.id);
                                             } else {
                                               useStore.getState().updateApprovalStatus(suggestion.id, 'approved');
                                             }
                                           }}
                                       >
                                          APPROVE_ACTION [A]
                                       </Button>
                                    </div>
                                 </div>
                              </Card>
                            ))}
                         </div>
                      </div>
                   </div>
                </Card>
             </motion.div>
           )}

            {activeOpsTab === 'supervisor' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
                  <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     {[
                       { label: 'Action Queue', val: activeSession?.actionQueue?.length || 0, color: 'text-terminal-text' },
                       { label: 'Dispatched (Ready)', val: activeSession?.actionQueue?.filter(a => a.status === 'ready').length || 0, color: 'text-terminal-green' },
                       { label: 'Live Supervised', val: activeSession?.actionQueue?.filter(a => a.status === 'dispatched').length || 0, color: 'text-terminal-amber animate-pulse' },
                       { label: 'Alert Criticals', val: activeSession?.supervision?.alerts?.length || 0, color: 'text-terminal-red shadow-glow-red' }
                     ].map((h, i) => (
                       <Card key={i} className="p-8 console-panel border-terminal-border/20 bg-panel/30 flex flex-col justify-between h-40">
                          <h4 className="text-[10px] font-black uppercase text-terminal-green/40 tracking-[0.2em] border-b border-terminal-border/10 pb-2 mb-2">{h.label}</h4>
                          <div className={cn("text-5xl font-black italic tracking-tighter leading-none", h.color)}>{h.val}</div>
                          <p className="text-[8px] font-black text-terminal-green/10 uppercase tracking-widest mt-auto">Sim_Control: Verified</p>
                       </Card>
                     ))}
                  </section>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Demo Action Scheduler Panel */}
                     {activeSession?.isDemo && (
                       <Card className="lg:col-span-3 console-panel border-terminal-green/30 bg-terminal-green/[0.02] p-8 font-mono space-y-6">
                          <div className="flex justify-between items-center border-b border-terminal-green/10 pb-4">
                             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-terminal-green italic">Demo_Action_Scheduler_Control</h3>
                             <Badge className="bg-terminal-green text-black animate-pulse">SUPERVISED_AUTO_EGRESS</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <h4 className="text-[9px] font-black text-terminal-green/40 uppercase tracking-widest">Awaiting_Dispatcher_Egress (Scheduled)</h4>
                                 <div className="space-y-2">
                                   {activeSession.demoScheduledActions?.map(action => {
                                     const now = Date.now();
                                     const start = new Date(action.approvedAt).getTime();
                                     const end = new Date(action.scheduledCompletionAt).getTime();
                                     const total = end - start;
                                     const elapsed = now - start;
                                     const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));

                                     return (
                                       <div key={action.id} className="p-4 border border-terminal-amber/20 bg-terminal-amber/[0.02] relative overflow-hidden group">
                                          <div className="flex justify-between items-start mb-2 relative z-10">
                                             <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-terminal-text uppercase">{action.assignedProfile}</span>
                                                <span className="text-[8px] text-terminal-amber/60 font-black tracking-widest italic uppercase">T-Minus {action.countdownMinutes}m Sync</span>
                                             </div>
                                             <Clock className="w-4 h-4 text-terminal-amber animate-spin-slow" />
                                          </div>
                                          <p className="text-[11px] text-terminal-text italic mb-3">"{action.approvedResponse}"</p>
                                          <div className="h-0.5 bg-terminal-amber/10 w-full overflow-hidden">
                                             <motion.div 
                                               initial={false}
                                               animate={{ width: `${pct}%` }} 
                                               className="h-full bg-terminal-amber shadow-[0_0_8px_rgba(255,176,32,0.4)]" 
                                             />
                                          </div>
                                       </div>
                                     );
                                   })}
                                   {!activeSession.demoScheduledActions?.length && (
                                     <div className="py-10 border border-dashed border-terminal-border/10 flex flex-center justify-center opacity-20">
                                        <span className="text-[8px] uppercase tracking-widest">No_Actions_Scheduled</span>
                                     </div>
                                   )}
                                </div>
                             </div>

                             <div className="space-y-4">
                                <h4 className="text-[9px] font-black text-terminal-green/40 uppercase tracking-widest">Completed_Profile_Actions (Verified_Egress)</h4>
                                <div className="space-y-2">
                                   {activeSession.demoCompletedActions?.map(action => (
                                     <div key={action.id} className="p-4 border border-terminal-green/20 bg-terminal-green/[0.02] flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                           <div className="flex items-center gap-2">
                                              <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green" />
                                              <span className="text-[10px] font-black text-terminal-text uppercase">{action.profile}</span>
                                           </div>
                                           <span className="text-[8px] text-terminal-green/60 font-black italic uppercase">POSTED @ {new Date(action.completedAt).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex gap-2">
                                           <Button variant="outline" className="h-7 px-3 text-[8px] border-terminal-border/20 text-terminal-text/30 hover:text-terminal-green">VIEW_LINK</Button>
                                        </div>
                                     </div>
                                   ))}
                                   {!activeSession.demoCompletedActions?.length && (
                                     <div className="py-10 border border-dashed border-terminal-border/10 flex flex-center justify-center opacity-20">
                                        <span className="text-[8px] uppercase tracking-widest">No_Actions_Completed</span>
                                     </div>
                                   )}
                                </div>
                             </div>
                          </div>
                       </Card>
                     )}

                     <Card className="lg:col-span-1 console-panel border-terminal-border/30 bg-black/40 overflow-hidden min-h-[600px] flex flex-col p-8 font-mono">
                        <div className="flex justify-between items-center mb-8 border-b border-terminal-border/10 pb-4">
                           <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-terminal-green/60 italic">Responder_Groups</h3>
                           <Badge variant="outline" className="text-[8px] italic border-terminal-green/20 text-terminal-green/40">5 Active</Badge>
                        </div>
                        <div className="space-y-4 overflow-y-auto no-scrollbar">
                           {responderGroups.map(group => (
                             <Card key={group.id} className="p-5 border-terminal-border/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-default">
                                <div className="flex justify-between items-start mb-3">
                                   <div className="flex flex-col">
                                      <span className="text-[11px] font-black text-terminal-text uppercase italic tracking-widest">{group.name}</span>
                                      <span className="text-[8px] font-black text-terminal-green/30 uppercase">{group.type}</span>
                                   </div>
                                   <div className={cn("w-2 h-2 rounded-full", group.status === 'active' ? 'bg-terminal-green shadow-[0_0_8px_#00FF66]' : 'bg-terminal-amber opacity-40')} />
                                </div>
                                
                                <div className="space-y-3 pt-3 border-t border-terminal-border/5">
                                   <div className="flex justify-between text-[9px] font-bold text-terminal-text/40">
                                      <span>Operator</span>
                                      <span className="text-terminal-text/80">{group.operator}</span>
                                   </div>
                                   <div className="flex justify-between text-[9px] font-bold text-terminal-text/40">
                                      <span>Capacity</span>
                                      <span className="text-terminal-green">{group.activeCount}/{group.capacity} ACT</span>
                                   </div>
                                   <div className="flex justify-between text-[9px] font-bold text-terminal-text/40">
                                      <span>Regional_Hub</span>
                                      <span className="text-terminal-text/60 italic">{group.region}</span>
                                   </div>
                                </div>
                             </Card>
                           ))}
                        </div>
                     </Card>

                     <Card className="lg:col-span-2 console-panel border-terminal-border/30 bg-black/40 overflow-hidden min-h-[600px] flex flex-col p-8 font-mono">
                        <div className="flex justify-between items-center mb-8 border-b border-terminal-border/10 pb-4">
                           <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-terminal-green/60 italic">Supervised_Action_Queue</h3>
                           <div className="flex gap-4">
                              <Button className="h-9 px-6 bg-terminal-green text-black font-black uppercase text-[9px] tracking-widest italic border-none shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                                DISPATCH_READY_ACTIONS [SPACE]
                              </Button>
                           </div>
                        </div>

                        <div className="flex-1 overflow-x-auto no-scrollbar">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="border-b border-terminal-border/10 text-[9px] font-black uppercase text-terminal-green/20 tracking-widest font-mono">
                                    <th className="py-4 font-black">ID</th>
                                    <th className="py-4 font-black">Type</th>
                                    <th className="py-4 font-black">Label</th>
                                    <th className="py-4 font-black">Priority</th>
                                    <th className="py-4 font-black">Execution_Status</th>
                                    <th className="py-4 font-black">Operator_Assigned</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-terminal-border/5">
                                 {([...(activeSession?.actionQueue || []), ...initialData.mockSupervisedActions?.slice(0, 15) || []]).map((action, i) => (
                                   <tr key={`${action.id}-${i}`} className="group hover:bg-white/[0.02] transition-colors cursor-default text-[10px] font-bold">
                                      <td className="py-4 text-terminal-green/20 italic">#{action.id.split('-')[1] || i}</td>
                                      <td className="py-4">
                                         <Badge variant="outline" className="text-[8px] border-terminal-border/20 text-terminal-green/40 uppercase">{action.type}</Badge>
                                      </td>
                                      <td className="py-4 text-terminal-text italic">{action.label}</td>
                                      <td className="py-4">
                                         <span className={cn(
                                            "uppercase text-[9px]",
                                            action.priority === 'critical' ? 'text-terminal-red' : 'text-terminal-text/40'
                                         )}>{action.priority}</span>
                                      </td>
                                      <td className="py-4">
                                         <div className="flex items-center gap-2">
                                            <div className={cn(
                                               "w-1.5 h-1.5 rounded-full",
                                               action.status === 'dispatched' ? 'bg-terminal-green animate-pulse' : 
                                               action.status === 'ready' ? 'bg-terminal-green/40' : 'bg-terminal-text/10'
                                            )} />
                                            <span className={cn(
                                               "uppercase text-[9px]",
                                               action.status === 'dispatched' ? 'text-terminal-green' : 'text-terminal-text/30'
                                            )}>{action.status}</span>
                                         </div>
                                      </td>
                                      <td className="py-4 text-terminal-text/40 italic">MOD_AUTO_GROUP_{i % 5}</td>
                                   </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </Card>
                  </div>
               </motion.div>
            )}
        </div>

          {/* RIGHT COLUMN */}
        <div className="w-[320px] shrink-0 flex flex-col gap-6 overflow-hidden">
           <Card className="flex-1 flex flex-col p-5">
              <div className="flex items-center justify-between mb-5 border-b border-white/[0.03] pb-3">
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-terminal-red/60">Risk_Vectors_v2</h3>
                 <Badge variant="outline" dot={false} className="text-[8px] opacity-40 italic">{(activeSession?.reviewQueue || []).length} Active</Badge>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {(activeSession?.reviewQueue || []).map(item => (
                  <div key={item.id} className="p-4 border border-terminal-red/10 bg-terminal-red/[0.02] hover:bg-terminal-red/[0.05] transition-all cursor-pointer group relative">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-bold uppercase text-terminal-text group-hover:text-terminal-red tracking-wide">{item.handle}</span>
                       <ShieldAlert className="w-3.5 h-3.5 text-terminal-red/30 group-hover:text-terminal-red transition-all" />
                    </div>
                    <p className="text-[9px] text-terminal-text/30 italic uppercase mb-3 line-clamp-2 leading-relaxed">"{item.riskReason}"</p>
                    <div className="flex justify-between items-center text-[7px] font-bold uppercase tracking-widest text-terminal-text/20">
                       <span>Coordination: {item.coordinationRisk}%</span>
                       <ArrowRight className="w-3 h-3 text-terminal-red/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-terminal-red/0 group-hover:bg-terminal-red transition-all" />
                  </div>
                ))}
                {!(activeSession?.reviewQueue || []).length && (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                    <ShieldCheck className="w-8 h-8 mb-3" />
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Zero_Risk_Flags</span>
                  </div>
                )}
              </div>
           </Card>

           <Card className="flex-1 flex flex-col p-5">
              <div className="flex items-center justify-between mb-5 border-b border-white/[0.03] pb-3">
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-terminal-green/40">Approval_Gate</h3>
                 <Badge variant="outline" dot={false} className="text-[8px] opacity-40 italic">{(activeSession?.approvals || []).length} Pending</Badge>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {(activeSession?.approvals || []).map(item => (
                  <div key={item.id} className="p-4 border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group space-y-4">
                    <div className="flex justify-between items-start">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-terminal-text tracking-wide">{item.title}</span>
                          <span className="text-[8px] font-bold text-terminal-green/30 uppercase tracking-widest mt-1 italic">{item.type}</span>
                       </div>
                       <Button variant="outline" className="h-7 w-7 p-0 border-terminal-border/20 group-hover:border-terminal-green/40 hover:bg-terminal-green/10" onClick={(e) => {
                         e.stopPropagation();
                         if (activeSession?.isDemo) {
                           useStore.getState().approveDemoAction(item.associatedId || item.id);
                         } else {
                           useStore.getState().updateApprovalStatus(item.id, 'approved');
                         }
                       }}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green/20 group-hover:text-terminal-green" />
                       </Button>
                    </div>
                    <div className="pt-3 border-t border-white/[0.03] flex items-center justify-between">
                       <div className="flex -space-x-1.5">
                          {[1,2,3].map(p => <div key={p} className="w-5 h-5 rounded-full border-2 border-terminal-panel bg-terminal-green/20" />)}
                       </div>
                       <span className="text-[7px] font-bold text-terminal-green/20 uppercase tracking-widest">Awaiting_Sim_Egress</span>
                    </div>
                  </div>
                ))}
                {!(activeSession?.approvals || []).length && (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-10">
                    <Clock className="w-8 h-8 mb-3" />
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]">No_Pending_Items</span>
                  </div>
                )}
              </div>
           </Card>
        </div>
      </div>

      {/* BOTTOM REAL-TIME EVENT STREAM */}
      <div className="h-20 shrink-0 border-t border-terminal-border/40 bg-black/60 flex items-center px-10 gap-10 font-mono relative overflow-hidden backdrop-blur-md">
         <div className="absolute top-0 left-0 right-0 h-[1px] bg-terminal-green/20 shadow-[0_0_10px_#00FF66]" />
         <div className="flex items-center gap-3 shrink-0">
            <Layout className="w-4 h-4 text-terminal-green shadow-[0_0_10px_#00FF66]" />
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-terminal-green tracking-widest">Global_Log_Stream</span>
               <span className="text-[8px] font-black text-terminal-green/20 uppercase italic">Events: Sync_Active</span>
            </div>
         </div>
         <div className="h-10 w-[1px] bg-white/5 shrink-0" />
         
         <div className="flex-1 flex overflow-x-auto no-scrollbar gap-8 items-center h-full">
            {liveEvents.map((event, i) => (
              <div key={event.id} className="flex flex-col shrink-0 min-w-[280px] group transition-all cursor-default">
                 <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-1 h-1 rounded-full",
                       event.severity === 'high' ? 'bg-terminal-red shadow-[0_0_5px_#FF4D4D]' :
                       event.severity === 'medium' ? 'bg-terminal-amber shadow-[0_0_5px_#FFB020]' : 'bg-terminal-green shadow-[0_0_5px_#00FF66]'
                    )} />
                    <span className="text-[7px] font-black uppercase text-terminal-green/40 font-mono tracking-tighter">{new Date(event.timestamp).toLocaleTimeString()} // {event.type}</span>
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-tight text-terminal-text group-hover:text-terminal-green transition-colors">{event.message}</div>
              </div>
            ))}
         </div>

         <div className="h-10 w-[1px] bg-white/5 shrink-0" />
         <div className="flex items-center gap-6 shrink-0">
            <div className="flex flex-col items-end">
               <span className="text-[7px] uppercase font-black text-terminal-green/20">System_Uptime</span>
               <span className="text-[10px] font-black text-terminal-text tabular-nums">142:22:15</span>
            </div>
            <Button variant="secondary" className="h-10 px-4 border-terminal-border/20 text-terminal-green/40 hover:text-terminal-green font-black tracking-widest text-[10px] group">
               SYSTEM_EXPORT <Download className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
            </Button>
         </div>
      </div>

    </div>
  );
}
