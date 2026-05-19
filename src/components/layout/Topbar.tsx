import React, { useState } from 'react';
import { Search, Bell, Command, User, ChevronDown, Check, Zap, Shield, Trash2, Layout, Activity, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Badge, Button } from '../ui/Primitives';

export const Topbar = () => {
  const { activeClientId, setActiveClient, clients, alerts, resolveAlert, narratives, campaigns } = useStore();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activeClient = clients.find(c => c.id === activeClientId);
  const unreadAlerts = alerts.filter(a => !a.resolved);

  const searchResults = searchQuery.length > 1 ? [
    ...narratives.filter(n => n.clientId === activeClientId && n.title.toLowerCase().includes(searchQuery.toLowerCase())).map(n => ({ type: 'Narrative', label: n.title, id: n.id })),
    ...campaigns.filter(c => c.clientId === activeClientId && c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => ({ type: 'Campaign', label: c.name, id: c.id }))
  ] : [];

  return (
    <header className="h-20 border-b border-terminal-border px-8 flex items-center justify-between bg-terminal-bg/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-10 flex-1 relative">
        <div 
          onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
          className="flex items-center gap-4 group cursor-pointer"
        >
          <div className="w-9 h-9 border border-terminal-border bg-terminal-green/5 flex items-center justify-center group-hover:border-terminal-green/60 transition-all">
             <Layout className="w-4 h-4 text-terminal-green/60 group-hover:text-terminal-green" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-terminal-text/30">Sector.Context</p>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-bold uppercase tracking-widest text-terminal-text group-hover:text-terminal-green transition-colors">{activeClient?.name}</p>
              <ChevronDown className={cn("w-3 h-3 text-terminal-text/30 transition-transform", isWorkspaceOpen && "rotate-180")} />
            </div>
          </div>
        </div>

        {/* Workspace Switcher Popover */}
        {isWorkspaceOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsWorkspaceOpen(false)} />
            <div className="absolute top-full left-0 mt-1 w-64 bg-terminal-panel border border-terminal-border p-1 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-terminal-text/20 p-3">Override Context</p>
              {clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => {
                    setActiveClient(client.id);
                    setIsWorkspaceOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 transition-all mb-1",
                    activeClientId === client.id ? "bg-terminal-green/10 text-terminal-green" : "text-terminal-text/40 hover:bg-terminal-green/5 hover:text-terminal-text"
                  )}
                >
                  <div className="text-left">
                    <p className="text-[11px] font-bold uppercase tracking-tight">{client.name}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40">{client.industry}</p>
                  </div>
                  {activeClientId === client.id && <Check className="w-3 h-3 text-terminal-green" />}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="relative max-w-sm w-full hidden lg:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-terminal-text/20 group-focus-within:text-terminal-green transition-colors" />
          <input 
            type="text" 
            placeholder="EXEC_SEARCH_QUERY..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-black/40 border border-terminal-border pl-11 pr-4 py-2.5 text-[10px] font-bold tracking-widest text-terminal-text focus:outline-none focus:border-terminal-green/40 transition-all placeholder:text-terminal-text/10"
          />

          {isSearchOpen && searchResults.length > 0 && (
            <>
              <div className="fixed inset-0 z-50" onClick={() => setIsSearchOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-full bg-terminal-panel border border-terminal-border p-1 z-[60] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                 <p className="text-[8px] font-black uppercase tracking-widest text-terminal-text/20 p-3 border-b border-terminal-border/40">Query.Results</p>
                 {searchResults.map((res, i) => (
                   <button 
                     key={i} 
                     className="w-full flex items-center justify-between p-3 hover:bg-terminal-green/5 transition-all text-left"
                     onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                   >
                     <div>
                       <p className="text-[10px] font-black text-terminal-text uppercase tracking-tight">{res.label}</p>
                       <p className="text-[8px] text-terminal-text/30 font-black uppercase tracking-[0.2em]">{res.type}</p>
                     </div>
                     <ArrowUpRight className="w-3 h-3 text-terminal-green/40" />
                   </button>
                 ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-1 relative">
           <div className="flex items-center">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  "p-3 text-terminal-text/30 hover:text-terminal-green transition-all hover:bg-terminal-green/5 relative",
                  isNotificationsOpen && "bg-terminal-green/10 text-terminal-green"
                )}
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-terminal-red shadow-[0_0_8px_rgba(255,77,77,0.6)]" />
                )}
              </button>
              <button className="p-3 text-terminal-text/30 hover:text-terminal-green transition-all hover:bg-terminal-green/5">
                <Shield className="w-4 h-4" />
              </button>
           </div>

           {/* Notifications Popover */}
           {isNotificationsOpen && (
             <>
               <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
               <div className="absolute top-full right-0 mt-1 w-96 bg-terminal-panel border border-terminal-border z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                 <div className="p-5 border-b border-terminal-border flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-widest text-terminal-green">Telemetry Alerts</p>
                    <Badge variant="default">{unreadAlerts.length} FLAGGED</Badge>
                 </div>
                 <div className="max-h-[400px] overflow-y-auto">
                    {alerts.length > 0 ? (
                      alerts.map(alert => (
                        <div key={alert.id} className={cn("p-5 border-b border-terminal-border/20 last:border-0 hover:bg-terminal-green/5 transition-all cursor-pointer group", alert.resolved && "opacity-30")}>
                           <div className="flex justify-between items-start gap-4">
                              <div className={cn(
                                "w-1 h-3 mt-0.5 shrink-0",
                                alert.severity === 'critical' ? 'bg-terminal-red shadow-[0_0_8px_rgba(255,77,77,0.4)]' :
                                alert.severity === 'high' ? 'bg-terminal-amber' : 'bg-terminal-green'
                              )} />
                              <div className="flex-1">
                                 <p className="text-[11px] font-bold text-terminal-text/80 group-hover:text-terminal-text transition-colors leading-tight">{alert.message}</p>
                                 <p className="text-[8px] font-black text-terminal-text/20 uppercase tracking-widest mt-2">SIG.{alert.id.toUpperCase()} // {alert.timestamp}</p>
                              </div>
                              {!alert.resolved && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resolveAlert(alert.id);
                                  }}
                                  className="text-[8px] font-black uppercase tracking-widest text-terminal-green/40 hover:text-terminal-green transition-colors border border-terminal-green/20 px-2 py-1"
                                >
                                  ACK
                                </button>
                              )}
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center opacity-20">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Pulse Detected</p>
                      </div>
                    )}
                 </div>
                 <button className="w-full py-3 text-[9px] font-black uppercase tracking-[0.2em] text-terminal-text/20 hover:text-terminal-text transition-colors border-t border-terminal-border/40">Audit.Logs</button>
               </div>
             </>
           )}
        </div>
        
        <div className="h-8 w-[1px] bg-terminal-border"></div>

        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black uppercase tracking-widest text-terminal-green group-hover:terminal-glow transition-all">A.RIVERA</p>
            <p className="text-[8px] text-terminal-text/30 font-black uppercase tracking-[0.1em] mt-0.5 whitespace-nowrap">ROOT_ACCESS • LVL.9</p>
          </div>
          <div className="w-10 h-10 border border-terminal-border bg-terminal-green/5 flex items-center justify-center group-hover:border-terminal-green/60 transition-all">
             <User className="w-4 h-4 text-terminal-green" />
          </div>
        </div>
      </div>
    </header>
  );
};
