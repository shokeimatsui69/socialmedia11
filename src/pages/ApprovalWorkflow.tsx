import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  CheckSquare, 
  Clock, 
  XCircle, 
  CheckCircle, 
  MessageSquare, 
  Eye, 
  History,
  AlertTriangle,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

export default function ApprovalWorkflow() {
  const { activeClientId, approvalItems, updateApprovalStatus, clients } = useStore();
  const [activeTab, setActiveTab] = useState('All Items');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const activeClient = clients.find(c => c.id === activeClientId);
  const clientQueue = useMemo(() => 
    approvalItems.filter(item => item.clientId === activeClientId),
    [approvalItems, activeClientId]
  );

  const filteredQueue = useMemo(() => 
    clientQueue.filter(item => {
      // Respect tab types
      const typeMatch = 
        activeTab === 'All Items' || 
        (activeTab === 'Replies' && item.type === 'suggested_reply') ||
        (activeTab === 'Campaign Plans' && item.type === 'campaign_plan') ||
        (activeTab === 'Reports' && item.type === 'report') ||
        (activeTab === 'History'); // History shows everything approved/rejected

      if (!typeMatch) return false;

      // Handle Status filtering
      if (activeTab === 'History') {
        return item.status === 'approved' || item.status === 'rejected';
      }
      
      return item.status === 'pending';
    }),
    [clientQueue, activeTab]
  );

  const selectedItem = useMemo(() => 
    clientQueue.find(item => item.id === selectedItemId),
    [clientQueue, selectedItemId]
  );

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    updateApprovalStatus(id, status);
    if (selectedItemId === id) setSelectedItemId(null);
  };

  return (
    <div className="space-y-10 bg-terminal-bg min-h-screen pb-20 relative overflow-hidden">
      <div className="absolute inset-0 terminal-scanline opacity-30" />
      
      <div className="flex items-end justify-between border-b border-terminal-border pb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
            <span className="text-[10px] text-terminal-green/40 font-mono uppercase tracking-[0.2em]">{activeClient?.name} • Authorized Gateway</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter terminal-glow">Authority<span className="text-terminal-green">Center</span></h1>
          <p className="text-terminal-text/60 text-sm mt-1 max-w-lg font-mono">Unified human-in-the-loop verification pipeline for communications, reports, and strategic plans.</p>
        </div>
        <div className="flex gap-3 font-mono">
          <Button variant="secondary" className="h-12 px-6 text-[10px] uppercase font-black tracking-widest border-terminal-border text-terminal-green"><History className="w-4 h-4" /> Change Archive</Button>
          <Button className="h-12 px-8 uppercase tracking-[0.2em] text-[10px] font-black bg-terminal-green text-black hover:bg-terminal-green/90 shadow-[0_0_15px_rgba(0,255,102,0.4)]">Authorize Selected ({filteredQueue.filter(i => false).length})</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
        <div className="xl:col-span-8 space-y-8">
           <div className="flex items-center justify-between border-b border-terminal-border overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-8 min-w-max font-mono">
                {['All Items', 'Replies', 'Campaign Plans', 'Reports', 'History'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all relative", 
                      activeTab === tab ? "border-terminal-green text-terminal-green" : "border-transparent text-terminal-green/30 hover:text-terminal-green/60"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                       <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.8)]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 py-4 font-mono">
                 <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 border border-terminal-border">
                    <Search className="w-3 h-3 text-terminal-green/40" />
                    <input className="bg-transparent border-none outline-none text-[10px] text-terminal-text/80 placeholder:text-terminal-green/20 w-32 font-bold uppercase" placeholder="SEARCH PIEPLINE..." />
                 </div>
                 <Button variant="secondary" className="p-2 h-8 w-8 border-terminal-border"><Filter className="w-3 h-3" /></Button>
              </div>
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredQueue.length > 0 ? (
                  filteredQueue.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    >
                    <Card 
                      className={cn(
                        "p-8 console-panel group transition-all duration-300 relative overflow-hidden cursor-pointer",
                        selectedItemId === item.id ? "bg-terminal-green/[0.03] border-terminal-green/40" : "hover:border-terminal-green/30"
                      )}
                      onClick={() => setSelectedItemId(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-14 h-14 bg-black border border-terminal-border flex flex-col items-center justify-center shadow-2xl transition-all group-hover:scale-105",
                            item.type === 'suggested_reply' ? "text-terminal-green" : 
                            item.type === 'report' ? "text-terminal-amber" : 
                            "text-terminal-green"
                          )}>
                             {item.type === 'suggested_reply' && <MessageSquare className="w-5 h-5 shadow-[0_0_10px_rgba(0,255,102,0.4)]" />}
                             {item.type === 'report' && <FileText className="w-5 h-5 shadow-[0_0_10px_rgba(0,255,102,0.4)]" />}
                             {item.type === 'campaign_plan' && <CheckSquare className="w-5 h-5 shadow-[0_0_10px_rgba(0,255,102,0.4)]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <h4 className="text-lg font-black italic text-terminal-text group-hover:text-terminal-green transition-colors font-mono tracking-tight">{item.title}</h4>
                               <Badge variant="outline" className="uppercase text-[9px] font-black tracking-widest border-terminal-border text-terminal-green/60 font-mono">{item.priority}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black text-terminal-green/40 uppercase tracking-widest font-mono">
                              <div className="flex items-center gap-1.5"><User className="w-3 h-3" /> {item.author}</div>
                              <span className="opacity-30">|</span>
                              <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {item.date}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                           <Button 
                            className="h-10 px-5 text-[10px] font-black uppercase tracking-widest bg-terminal-red text-black hover:bg-terminal-red/90 shadow-lg border-none"
                            onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'rejected'); }}
                           >
                              Reject
                           </Button>
                           <Button 
                            className="h-10 px-5 text-[10px] font-black uppercase tracking-widest bg-terminal-green text-black hover:bg-terminal-green/90 shadow-xl border-none"
                            onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'approved'); }}
                           >
                              Approve
                           </Button>
                           <div className="w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="w-5 h-5 text-terminal-green/40" />
                           </div>
                        </div>
                      </div>
                    </Card>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="py-32 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-3xl"
                  >
                    <ShieldCheck className="w-20 h-20 mb-6 text-zinc-700" />
                    <p className="text-xl font-mono italic text-terminal-green/60 mb-2 font-black uppercase tracking-widest">Gateway Clear</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">No objects currently awaiting authorization</p>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        <div className="xl:col-span-4 space-y-10">
           <AnimatePresence mode="wait">
             {selectedItem ? (
                <motion.div
                  key={selectedItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <Card className="p-10 console-panel relative overflow-hidden bg-terminal-panel/50">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <History className="w-48 h-48 text-terminal-green" />
                     </div>
                     <div className="relative z-10 font-mono">
                        <h3 className="text-[10px] font-black text-terminal-green/50 uppercase tracking-[0.2em] mb-10 border-b border-terminal-border pb-2">Verification Detail: #{selectedItem.id}</h3>
                        
                        <div className="space-y-8">
                           <div>
                              <p className="text-[10px] font-black text-terminal-green/30 uppercase tracking-widest mb-2">Subject Body</p>
                              <div className="p-6 bg-black/40 border border-terminal-border text-sm italic text-terminal-text/80 leading-relaxed font-medium">
                                 "Authorization request for strategic transition in {selectedItem.title}. Verification required for cross-platform egress."
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              {[
                                { l: 'Signal Trust', v: '98%', c: 'text-terminal-green' },
                                { l: 'Risk Scan', v: 'CLEAR', c: 'text-terminal-green' },
                                { l: 'Author Trust', v: 'LEVEL 4', c: 'text-terminal-amber' },
                                { l: 'Stakeholders', v: 'VETTED', c: 'text-terminal-green' }
                              ].map(s => (
                                <div key={s.l} className="p-4 bg-black/20 border border-terminal-border">
                                   <p className="text-[8px] font-black text-terminal-green/20 uppercase tracking-widest mb-1">{s.l}</p>
                                   <p className={cn("text-xs font-black uppercase tracking-widest", s.c)}>{s.v}</p>
                                </div>
                              ))}
                           </div>

                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-terminal-green/30 uppercase tracking-widest">Administrative Audit Path</p>
                              <div className="space-y-4">
                                 {[
                                   { a: 'Ingested Topic Cluster', s: 'Verified' },
                                   { a: 'Narrative Extraction', s: 'Verified' },
                                   { a: 'Compliance Scan 2.4', s: 'Verified' }
                                 ].map((step, i) => (
                                   <div key={i} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                                      <span className="text-terminal-green/40">{step.a}</span>
                                      <span className="text-terminal-green flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {step.s}</span>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="mt-12 flex gap-3">
                           <Button 
                            variant="secondary" 
                            className="flex-1 h-12 uppercase tracking-[0.2em] text-[10px] font-black border-terminal-border text-terminal-red/70 hover:text-terminal-red"
                            onClick={() => handleAction(selectedItem.id, 'rejected')}
                           >
                              Deny Authorization
                           </Button>
                           <Button 
                            className="flex-1 h-12 uppercase tracking-[0.2em] text-[10px] font-black bg-terminal-green text-black shadow-[0_0_20px_rgba(0,255,102,0.3)]"
                            onClick={() => handleAction(selectedItem.id, 'approved')}
                           >
                              Authorize Release
                           </Button>
                        </div>
                     </div>
                  </Card>
                </motion.div>
             ) : (
                <Card className="p-10 console-panel border-terminal-border bg-black/40">
                  <h3 className="text-[10px] font-black text-terminal-green/30 uppercase tracking-widest mb-10 border-b border-terminal-border/20 pb-2">Human Intent Monitoring</h3>
                  <div className="space-y-8 font-mono">
                     <div className="p-6 bg-black/20 border border-terminal-border/20 space-y-4">
                        <h5 className="text-[10px] font-black text-terminal-green uppercase tracking-widest">Strategist Checklist</h5>
                        <ul className="space-y-4">
                           {[
                             'Verify egress alignment with client brand vectors',
                             'Examine potential secondary narrative impact',
                             'Cross-reference with active execution batches'
                           ].map((item, i) => (
                             <li key={i} className="flex gap-3 text-[11px] font-medium text-terminal-text/60 italic leading-relaxed">
                                <div className="w-1.5 h-1.5 bg-terminal-green mt-1.5 shrink-0" />
                                {item}
                             </li>
                           ))}
                        </ul>
                     </div>
                     
                     <div className="p-6 bg-terminal-red/5 border border-terminal-red/20 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                           <AlertTriangle className="w-4 h-4 text-terminal-red shadow-[0_0_8px_rgba(255,77,77,0.4)]" />
                           <h5 className="text-[10px] font-black text-terminal-red uppercase tracking-widest">Administrative Alert</h5>
                        </div>
                        <p className="text-[11px] text-terminal-red/70 leading-relaxed italic font-medium">"All authorization logs are immutable. Ensure final tactical review of all synthetic vectors."</p>
                     </div>
                  </div>
                </Card>
             )}
           </AnimatePresence>

           <Card className="p-10 console-panel border-terminal-border bg-black/20">
              <h3 className="text-[10px] font-black text-terminal-green/20 uppercase tracking-widest mb-6 border-b border-terminal-border/10 pb-2">Gateway Health</h3>
              <div className="space-y-8 font-mono">
                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-terminal-green/40">Approval Velocity</span>
                       <span className="text-xl font-black italic text-terminal-text">94.2%</span>
                    </div>
                    <div className="w-full h-1 bg-black overflow-hidden border border-terminal-border/10">
                       <div className="h-full bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.5)]" style={{ width: '94.2%' }}></div>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-terminal-green/40">Latency Vector</span>
                       <span className="text-xl font-black italic text-terminal-text">12.5m</span>
                    </div>
                    <div className="w-full h-1 bg-black overflow-hidden border border-terminal-border/10">
                       <div className="h-full bg-terminal-green/50 shadow-[0_0_8px_rgba(0,255,102,0.2)]" style={{ width: '60%' }}></div>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
