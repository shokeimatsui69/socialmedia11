import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  MessageSquare, 
  CornerDownRight, 
  User, 
  Clock, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Send,
  Save,
  Flag,
  CheckCircle,
  MessageCircle,
  Hash,
  ChevronLeft,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

export default function Conversations() {
  const { activeClientId, conversations, clients, activeSession } = useStore();
  
  const allThreads = useMemo(() => {
    const baseThreads = conversations.filter(t => t.clientId === activeClientId);
    
    if (activeSession && activeSession.scrapedComments.length > 0) {
      const sessionThreads = activeSession.scrapedComments.map(c => ({
        id: c.id,
        clientId: activeClientId,
        author: c.authorHandle,
        platform: activeSession.platform,
        content: c.text,
        timestamp: new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentiment: c.sentiment as any,
        tags: c.suspiciousSignals,
        intent: c.intent
      }));
      return [...sessionThreads, ...baseThreads];
    }
    
    return baseThreads;
  }, [conversations, activeClientId, activeSession]);

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(allThreads[0]?.id || null);

  const [filterPlatform, setFilterPlatform] = useState<string>('All');
  const [replyText, setReplyText] = useState('');

  const activeClient = clients.find(c => c.id === activeClientId);

  const filteredThreads = useMemo(() => 
    allThreads.filter(t => filterPlatform === 'All' || t.platform.toLowerCase().includes(filterPlatform.toLowerCase())),
    [allThreads, filterPlatform]
  );

  const selectedThread = useMemo(() => 
    allThreads.find(t => t.id === selectedThreadId),
    [allThreads, selectedThreadId]
  );

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    // Mock send logic
    setReplyText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-10 bg-terminal-bg relative overflow-hidden font-mono px-1">
      <div className="absolute inset-0 terminal-scanline opacity-30 pointer-events-none" />
      
      <div className="flex items-end justify-between shrink-0 border-b border-terminal-border pb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
            <span className="text-[10px] text-terminal-green/40 font-mono uppercase tracking-[0.2em]">{activeClient?.name} • Pulse Reception</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter terminal-glow">Unified<span className="text-terminal-green">Inbox</span></h1>
          <p className="text-terminal-text/60 text-sm mt-1 font-mono">Cross-platform signal reception and strategic human-in-the-loop engagement.</p>
        </div>
        <div className="flex gap-4 font-mono">
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 border border-terminal-border">
             <Search className="w-4 h-4 text-terminal-green/40" />
             <input className="bg-transparent border-none outline-none text-[10px] text-terminal-text/80 placeholder:text-terminal-green/20 w-48 font-black uppercase tracking-widest" placeholder="SEARCH SIGNALS..." />
          </div>
          <Button variant="secondary" className="h-12 px-6 uppercase tracking-widest text-[10px] font-black border-terminal-border text-terminal-green"><Filter className="w-4 h-4" /> Global Filters</Button>
        </div>
      </div>

      <div className="flex-1 flex gap-10 overflow-hidden relative z-10">
        {/* THREAD LIST */}
        <Card className="w-[400px] flex flex-col p-0 overflow-hidden bg-black/40 border-terminal-border console-panel">
           <div className="p-6 border-b border-terminal-border bg-terminal-panel/50 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/50">Live Stream</h3>
              <Badge variant="outline" className="px-2 py-0.5 text-[9px] font-black border-terminal-green/30 text-terminal-green">{filteredThreads.length} Signals</Badge>
           </div>
           <div className="flex items-center gap-2 px-4 py-3 border-b border-terminal-border overflow-x-auto no-scrollbar bg-black/20">
              {['All', 'Instagram', 'X', 'Facebook', 'TikTok'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setFilterPlatform(p)}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all",
                    filterPlatform === p ? "bg-terminal-green/10 text-terminal-green border border-terminal-green/30" : "text-terminal-green/30 hover:text-terminal-green/60"
                  )}
                >
                  {p}
                </button>
              ))}
           </div>
           <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/20 no-scrollbar p-2 space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredThreads.map((thread) => (
                  <motion.div 
                    layout
                    key={thread.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={cn(
                      "p-5 cursor-pointer transition-all relative overflow-hidden group border border-transparent",
                      selectedThreadId === thread.id ? "bg-terminal-green/5 border-terminal-green/30 shadow-[inset_0_0_20px_rgba(0,255,102,0.05)]" : "hover:bg-terminal-green/[0.02] hover:border-terminal-border/40"
                    )}
                  >
                    {selectedThreadId === thread.id && (
                       <motion.div layoutId="thread-indicator" className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.8)]" />
                    )}
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2", 
                            thread.sentiment === 'positive' ? "bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.5)]" : 
                            thread.sentiment === 'negative' ? "bg-terminal-red shadow-[0_0_8px_rgba(255,77,77,0.5)]" : "bg-terminal-green/20"
                          )}></div>
                          <span className="text-xs font-black text-terminal-text uppercase tracking-widest">{thread.author}</span>
                       </div>
                       <span className="text-[9px] text-terminal-green/40 font-black uppercase tracking-widest">{thread.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-terminal-text/60 font-medium italic line-clamp-2 leading-relaxed px-1">"{thread.content}"</p>
                    <div className="mt-4 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-black border border-terminal-border/40 flex items-center justify-center">
                             <Hash className="w-2.5 h-2.5 text-terminal-green/40" />
                          </div>
                          <span className="text-[9px] font-black text-terminal-green/30 uppercase tracking-[0.2em]">{thread.platform}</span>
                       </div>
                       <Badge variant={thread.sentiment} className="text-[8px] uppercase tracking-widest py-0 border-terminal-border/20 text-terminal-text/40">{thread.sentiment}</Badge>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </Card>

        {/* THREAD DETAIL */}
        <div className="flex-1 flex flex-col gap-10 overflow-hidden relative">
           <AnimatePresence mode="wait">
              {selectedThread ? (
                <motion.div 
                  key={selectedThread.id} 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex-1 flex flex-col gap-10 overflow-hidden"
                >
                  <Card className="flex-1 flex flex-col p-0 overflow-hidden console-panel border-terminal-border relative">
                     <div className="p-8 border-b border-terminal-border bg-terminal-panel/50 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                           <div className="w-16 h-16 bg-black border border-terminal-border/40 flex items-center justify-center font-black italic text-2xl text-terminal-green terminal-glow">
                             {selectedThread.author ? selectedThread.author[0].toUpperCase() : '?'}
                           </div>
                           <div>
                             <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-black italic text-terminal-text">{selectedThread.author}</h3>
                                <Badge variant={selectedThread.sentiment} className="text-[9px] font-black uppercase tracking-widest border-terminal-border/40">{selectedThread.sentiment}</Badge>
                             </div>
                             <p className="text-[10px] text-terminal-green/40 font-black uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                               RELEASED ORIGIN: <span className="text-terminal-green">{selectedThread.platform}</span> <ArrowUpRight className="w-3 h-3" />
                             </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-terminal-border">
                             <Clock className="w-3.5 h-3.5 text-terminal-green/40" />
                             <span className="text-[10px] font-black text-terminal-green/60 uppercase tracking-widest italic">ACTIVE SINCE {selectedThread.timestamp}</span>
                          </div>
                          <Button variant="secondary" className="p-3 h-12 w-12 border-terminal-border text-terminal-green"><MoreVertical className="w-5 h-5" /></Button>
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar bg-black/10">
                        <div className="flex gap-6 max-w-[85%]">
                           <div className="shrink-0 w-10 h-10 bg-black border border-terminal-border/40 flex items-center justify-center font-black text-[10px] uppercase text-terminal-green/40">{selectedThread.platform ? selectedThread.platform[0].toUpperCase() : '?'}</div>
                           <div className="space-y-3">
                              <div className="bg-black/40 p-6 border border-terminal-border text-sm italic text-terminal-text/80 leading-relaxed font-medium shadow-inner">
                                 {selectedThread.content}
                              </div>
                              <p className="text-[9px] font-black text-terminal-green/20 uppercase tracking-widest flex items-center gap-2">
                                 Tactical Receive Pulse <span className="opacity-30">|</span> {selectedThread.timestamp}
                              </p>
                           </div>
                        </div>

                        {/* SIMULATED REPLY SUGGESTION */}
                        <div className="flex flex-row-reverse gap-6 max-w-[85%] ml-auto">
                           <div className="shrink-0 w-10 h-10 bg-terminal-green text-black flex items-center justify-center font-black italic shadow-[0_0_20px_rgba(0,255,102,0.3)]">BA</div>
                           <div className="space-y-3 text-right">
                              <div className="bg-terminal-green/[0.03] p-6 border border-terminal-green/40 text-sm italic text-terminal-text leading-relaxed font-medium shadow-2xl relative group">
                                 <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.4)]" />
                                 "Tactical Response generated by Strategist Intelligence. Verification required before releasing pulse to {selectedThread.platform} egress."
                              </div>
                              <div className="flex items-center justify-end gap-3 text-[9px] font-black text-terminal-green/20 uppercase tracking-widest">
                                 <span>Pulse ID: #STRAT-SIGNAL-09{selectedThread.id}</span>
                                 <Badge variant="outline" className="py-0 text-[8px] border-terminal-green/40 text-terminal-green font-black">AWAITING RELEASE</Badge>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 border-t border-terminal-border bg-black/80 backdrop-blur-xl flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                           <Button variant="secondary" className="h-10 px-5 text-[9px] font-black uppercase tracking-widest border-terminal-border text-terminal-green/60 hover:text-terminal-green group">
                              <CornerDownRight className="w-3.5 h-3.5 mr-2 group-hover:translate-x-1 transition-transform" /> Reply as Strategist
                           </Button>
                           <Button variant="secondary" className="h-10 px-5 text-[9px] font-black uppercase tracking-widest text-terminal-red/40 italic border-terminal-border hover:bg-terminal-red/5 hover:text-terminal-red transition-all">
                              Escalate to Human Resolution
                           </Button>
                           <div className="ml-auto flex items-center gap-3">
                              <span className="text-[9px] text-terminal-green/20 font-bold uppercase tracking-widest">Channel Security:</span>
                              <Badge variant="outline" className="text-[8px] py-0 px-2 flex items-center gap-1 border-terminal-green/40 text-terminal-green"><ShieldCheck className="w-3 h-3" /> ENCRYPTED</Badge>
                           </div>
                        </div>
                        <div className="relative group">
                           <textarea 
                             value={replyText}
                             onChange={(e) => setReplyText(e.target.value)}
                             placeholder="Type strategic release pulse here..." 
                             className="w-full bg-black border border-terminal-border p-8 pr-48 text-sm font-black italic text-terminal-text placeholder:text-terminal-green/10 focus:outline-none focus:border-terminal-green/40 transition-all min-h-[150px] resize-none shadow-inner"
                           />
                           <div className="absolute top-8 right-8 flex flex-col gap-3 font-mono">
                             <Button 
                               variant="secondary" 
                               className="w-32 h-14 uppercase tracking-[0.2em] text-[10px] font-black border-terminal-border text-terminal-green/60 hover:text-terminal-green"
                               onClick={handleSendReply}
                             >
                                <Save className="w-4 h-4 mr-2" /> DRAFT
                             </Button>
                             <Button 
                               className="w-32 h-14 uppercase tracking-[0.2em] text-[10px] font-black bg-terminal-green text-black shadow-2xl hover:bg-terminal-green/90 shadow-[0_0_20px_rgba(0,255,102,0.4)]"
                               onClick={handleSendReply}
                             >
                                <Send className="w-4 h-4 mr-2" /> RELEASE
                             </Button>
                           </div>
                        </div>
                     </div>
                  </Card>
                </motion.div>
              ) : (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex-1 flex flex-col items-center justify-center text-center p-20"
                 >
                    <div className="w-32 h-32 bg-black border border-terminal-border flex items-center justify-center mb-8 shadow-2xl">
                       <MessageCircle className="w-12 h-12 text-terminal-green/20" />
                    </div>
                    <h3 className="text-3xl font-black italic text-terminal-green/40 mb-2">Awaiting Selection</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-terminal-green/20">Select a reception signal from the stream to initiate resolution</p>
                 </motion.div>
              )}
           </AnimatePresence>

           {/* INSIGHTS PANEL (HORIZONTAL STRIP) */}
           <div className="flex gap-6 h-48 mt-10">
              <Card className="flex-1 p-8 console-panel border-terminal-border bg-black/40 flex items-center gap-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                    <TrendingUp className="w-32 h-32 text-terminal-green" />
                 </div>
                 <div className="w-24 h-24 border-4 border-terminal-green/10 flex flex-col items-center justify-center relative shrink-0">
                    <div className="absolute inset-1 border-2 border-terminal-green shadow-[0_0_15px_rgba(0,255,102,0.5)] border-t-transparent animate-spin-slow"></div>
                    <p className="text-xl font-black italic text-terminal-text">Pos+</p>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40 italic">Sentiment Vector Analysis</h4>
                    <p className="text-[11px] text-terminal-text/60 font-medium italic leading-relaxed max-w-xs">
                       "Strategic analysis indicates a dominant positive resonance. No historical friction detected in last 24 months of interaction."
                    </p>
                 </div>
              </Card>

              <Card className="w-80 p-8 console-panel border-terminal-border bg-black/40 flex flex-col justify-between">
                 <div className="flex items-center justify-between border-b border-terminal-border/20 pb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40">Signal Integrity</h4>
                    <Badge variant="positive" className="text-[8px] py-0 border-terminal-green/40 text-terminal-green">VETTED</Badge>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[9px] font-black uppercase tracking-widest text-terminal-green/40">Verification Match</span>
                       <span className="text-xl font-black italic text-terminal-text">99.8%</span>
                    </div>
                    <div className="w-full h-1 bg-terminal-panel overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '99.8%' }} className="h-full bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.5)]" />
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
}
