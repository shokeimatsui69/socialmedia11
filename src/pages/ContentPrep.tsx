import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  PenTool, 
  MessageCircle, 
  Share2, 
  ShieldAlert, 
  Sparkles, 
  Eye, 
  Edit3, 
  MoreVertical,
  ChevronRight,
  CheckCircle2,
  Clock,
  Trash2,
  Send,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

export default function ContentPrep() {
  const { activeClientId, contentSuggestions, updateSuggestionStatus, clients } = useStore();
  const [activeTab, setActiveTab] = useState('Pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const activeClient = clients.find(c => c.id === activeClientId);
  const clientSuggestions = useMemo(() => 
    contentSuggestions.filter(s => s.clientId === activeClientId),
    [contentSuggestions, activeClientId]
  );

  const filteredSuggestions = useMemo(() => 
    clientSuggestions.filter(s => {
      if (activeTab === 'Pending') return s.status === 'pending';
      if (activeTab === 'Submitted') return s.status === 'approved'; // Using 'approved' as proxy for submitted to workflow
      if (activeTab === 'Flagged') return s.risk === 'high';
      return true;
    }),
    [clientSuggestions, activeTab]
  );

  const handleSubmit = async (id: string) => {
    setProcessingId(id);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    updateSuggestionStatus(id, 'approved');
    setProcessingId(null);
  };

  const handleIgnore = (id: string) => {
    updateSuggestionStatus(id, 'ignored');
  };

  return (
    <div className="space-y-10 bg-terminal-bg min-h-screen pb-20 relative overflow-hidden">
      <div className="absolute inset-0 terminal-scanline opacity-30" />
      
      <div className="flex items-end justify-between border-b border-terminal-border pb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-terminal-green/30 text-terminal-green">Content Engine</Badge>
            <span className="text-[10px] text-terminal-green/40 font-mono uppercase tracking-[0.2em]">{activeClient?.name} • Human-In-The-Loop</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter terminal-glow">Content<span className="text-terminal-green">Draft</span></h1>
          <p className="text-terminal-text/60 text-sm mt-1 max-w-lg font-mono">Advanced drafting suite for approved stakeholder communication and strategic replies.</p>
        </div>
        <div className="flex gap-2 bg-terminal-panel p-1.5 border border-terminal-border">
           {['Pending', 'Submitted', 'Flagged'].map((tab) => (
             <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 text-[10px] uppercase font-black tracking-widest transition-all font-mono", 
                  activeTab === tab ? "bg-terminal-green/10 text-terminal-green border border-terminal-green/30" : "text-terminal-green/40 hover:text-terminal-green/70"
                )}
              >
                {tab}
              </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-8 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-terminal-green/50 uppercase tracking-[0.2em] flex items-center gap-2 font-mono">
               <Sparkles className="w-3 h-3 text-terminal-green" />
               AI-Augmented Drafts
            </h3>
            <Badge variant="outline" className="text-[9px] font-black border-terminal-border text-terminal-text/50 uppercase tracking-widest">{filteredSuggestions.length} ITEMS</Badge>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((s) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="p-10 console-panel group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-terminal-green/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-terminal-green/10 transition-all duration-700"></div>
                      
                      <div className="flex items-start gap-8">
                        <div className="shrink-0 w-16 h-16 bg-black border border-terminal-border flex flex-col items-center justify-center group-hover:border-terminal-green/40 transition-all relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-br from-terminal-green/10 to-transparent"></div>
                           <PenTool className="w-5 h-5 text-terminal-green relative z-10" />
                           <span className="text-[8px] font-black text-terminal-green/50 uppercase tracking-widest mt-1 relative z-10 font-mono">DRAFT</span>
                        </div>
                        <div className="flex-1 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="capitalize text-[9px] font-black tracking-widest border-terminal-green/30 text-terminal-green">{s.platform}</Badge>
                              <Badge variant={s.risk === 'low' ? 'positive' : s.risk === 'medium' ? 'neutral' : 'negative'} className="text-[9px] font-black tracking-widest uppercase">Risk: {s.risk}</Badge>
                              <span className="text-terminal-green/20 text-xs">•</span>
                              <span className="text-[10px] text-terminal-green/40 font-mono uppercase tracking-widest">Strategy: <span className="text-terminal-text/80">{s.goal}</span></span>
                            </div>
                            <div className="text-[10px] text-terminal-green/40 uppercase font-black tracking-widest flex items-center gap-2 font-mono">
                               <Clock className="w-3 h-3" /> 2h ago
                            </div>
                          </div>

                          <div className="bg-black/40 p-8 border border-terminal-border text-lg font-mono italic text-terminal-text/90 leading-relaxed shadow-inner">
                             "{s.content}"
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-terminal-border">
                             <div className="flex items-center gap-6 font-mono">
                                <div className="text-[10px] text-terminal-green/40 uppercase font-bold tracking-widest flex flex-col">
                                   <span className="text-terminal-green/20 font-black">TONE</span>
                                   <span className="text-terminal-text/80">{s.tone}</span>
                                </div>
                                <div className="text-[10px] text-terminal-green/40 uppercase font-bold tracking-widest flex flex-col">
                                   <span className="text-terminal-green/20 font-black">STATUS</span>
                                   <span className={cn(s.status === 'pending' ? "text-terminal-amber" : "text-terminal-green")}>{s.status}</span>
                                </div>
                             </div>
                             <div className="flex gap-3">
                                <Button 
                                  variant="secondary" 
                                  className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-terminal-red/70 hover:text-terminal-red hover:bg-terminal-red/10 border-terminal-border font-mono"
                                  onClick={() => handleIgnore(s.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Ignore
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  className="h-12 px-6 text-[10px] font-black uppercase tracking-widest border-terminal-border font-mono"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Edit
                                </Button>
                                <Button 
                                  className="h-12 px-8 text-[10px] font-black uppercase tracking-widest bg-terminal-green text-black hover:bg-terminal-green/90 shadow-[0_0_15px_rgba(0,255,102,0.4)] group font-mono"
                                  onClick={() => handleSubmit(s.id)}
                                  disabled={processingId === s.id}
                                >
                                  {processingId === s.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>Submit for Approval <Send className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></>
                                  )}
                                </Button>
                             </div>
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
                  className="py-32 flex flex-col items-center justify-center text-center opacity-30 border border-dashed border-terminal-border"
                >
                  <CheckCircle2 className="w-16 h-16 mb-6 text-terminal-green/40" />
                  <p className="text-xl font-mono italic text-terminal-green/60 mb-2">Queue Exhausted</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-terminal-green/20 font-mono">All drafted content has been processed or submitted</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-10 relative z-10">
           <Card className="p-10 console-panel">
              <h4 className="text-[10px] font-black text-terminal-green/40 uppercase tracking-[0.2em] mb-8 border-b border-terminal-border pb-2 font-mono">Engagement Parameters</h4>
              <div className="space-y-8">
                 <div>
                   <p className="text-[11px] font-black uppercase tracking-widest mb-4 text-terminal-green/60 font-mono">Tone Calibration</p>
                   <div className="space-y-5">
                      {[
                        { t: 'Empathetic', v: 85, c: 'bg-terminal-green' },
                        { t: 'Authoritative', v: 45, c: 'bg-terminal-amber' },
                        { t: 'Enthusiastic', v: 65, c: 'bg-terminal-green' },
                        { t: 'Careful', v: 92, c: 'bg-terminal-red' }
                      ].map(item => (
                        <div key={item.t} className="space-y-2">
                           <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter text-terminal-green/40 font-mono">
                             <span>{item.t}</span>
                             <span className="text-terminal-text">{item.v}%</span>
                           </div>
                           <div className="w-full h-1 bg-terminal-green/5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.v}%` }}
                                className={cn("h-full shadow-[0_0_8px_rgba(0,255,102,0.4)]", item.c)}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                 </div>

                 <div className="pt-8 border-t border-terminal-border">
                    <p className="text-[11px] font-black uppercase tracking-widest mb-4 text-terminal-green/60 font-mono">Active Objection Handlers</p>
                    <div className="space-y-3">
                       <div className="text-[10px] font-mono p-4 bg-black/40 border border-terminal-border text-terminal-text/60 leading-relaxed italic">
                          If pricing is mentioned, highlight the 'EcoGear Buy-Back' program immediately.
                       </div>
                       <div className="text-[10px] font-mono p-4 bg-black/40 border border-terminal-border text-terminal-text/60 leading-relaxed italic">
                          For shipping delays, use the 'Empathetic Delay' template.
                       </div>
                    </div>
                 </div>

                 <Button variant="secondary" className="w-full h-14 uppercase tracking-[0.2em] text-[10px] font-black mt-4 border-terminal-border font-mono text-terminal-green">Adjust Global Parameters</Button>
              </div>
           </Card>

           <Card className="p-10 border-terminal-red/20 bg-terminal-red/5 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <ShieldAlert className="w-32 h-32" />
              </div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="w-10 h-10 bg-terminal-red/10 border border-terminal-red/20 flex items-center justify-center shrink-0">
                   <ShieldAlert className="w-5 h-5 text-terminal-red shadow-[0_0_10px_rgba(255,77,77,0.4)]" />
                </div>
                <div>
                   <p className="text-xs font-black text-terminal-red uppercase tracking-widest mb-2 italic tracking-tighter font-mono text-glow-red">Compliance Enforcement</p>
                   <p className="text-sm text-terminal-red/80 leading-relaxed font-mono italic">"System is strictly configured to prevent autonomous publishing. ALL synthetic outputs must be validated by a human stakeholder before escrow."</p>
                </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
