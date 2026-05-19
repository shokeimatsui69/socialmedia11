import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Map, 
  MessageSquareQuote, 
  FileText, 
  PenTool, 
  CheckSquare, 
  Activity, 
  MessagesSquare, 
  BarChart3, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
  Globe,
  MoreVertical,
  Search
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

const menuGroups = [
  {
    label: 'Mission Control',
    items: [
      { path: '/', icon: Zap, label: 'Ops Terminal' },
      { path: '/turbo-scan', icon: Search, label: 'TurboScan' },
      { path: '/analytics', icon: BarChart3, label: 'Executive Analytics' },
    ]
  },
  {
    label: 'Tactical Center',
    items: [
      { path: '/ingestion', icon: Database, label: 'Ingestion' },
      { path: '/audience-map', icon: Map, label: 'Network Intel' },
      { path: '/narratives', icon: MessageSquareQuote, label: 'Narrative Drift' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { path: '/content-prep', icon: PenTool, label: 'Response Planning' },
      { path: '/approvals', icon: CheckSquare, label: 'Approval Gate' },
      { path: '/execution', icon: Activity, label: 'Tactical Oversight' },
    ]
  },
  {
    label: 'Engagement',
    items: [
      { path: '/conversations', icon: MessagesSquare, label: 'Conversations' },
    ]
  },
  {
    label: 'Management',
    items: [
      { path: '/reports', icon: FileText, label: 'Briefings' },
      { path: '/settings', icon: Settings, label: 'System Settings' },
    ]
  }
];

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useStore();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-terminal-panel border-r border-terminal-border transition-all duration-300 z-50 flex flex-col",
      isSidebarOpen ? "w-64 max-lg:w-20" : "w-20"
    )}>
      <div className="p-6 flex items-center gap-3 border-b border-terminal-border">
        <div className="w-8 h-8 bg-terminal-green/10 border border-terminal-green/40 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-terminal-green animate-pulse" />
        </div>
        {isSidebarOpen && (
          <div className="flex flex-col max-lg:hidden">
            <span className="font-black text-xs uppercase tracking-[0.2em] text-terminal-green leading-none">CORE.OS</span>
            <span className="font-bold text-[9px] uppercase tracking-[0.1em] text-terminal-text/40">v4.0.2-Stable</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="pb-6">
            {isSidebarOpen && (
              <h3 className="px-3 text-[9px] font-black uppercase tracking-[0.25em] text-terminal-text/30 mb-3 flex items-center gap-2 max-lg:hidden">
                <span className="w-1 h-1 bg-terminal-text/20"></span>
                {group.label}
              </h3>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 transition-all group relative overflow-hidden",
                  isActive 
                    ? "bg-terminal-green/10 text-terminal-green border-l-2 border-terminal-green" 
                    : "text-terminal-text/50 hover:text-terminal-text hover:bg-terminal-green/5"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-4 h-4", isSidebarOpen ? "max-lg:mx-auto" : "mx-auto")} />
                    {isSidebarOpen && <span className="text-[11px] font-bold uppercase tracking-wider max-lg:hidden">{item.label}</span>}
                    {isActive && (
                       <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-terminal-green/5 to-transparent pointer-events-none" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-terminal-border space-y-3 bg-black/20">
        <button 
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 bg-terminal-green/5 border border-terminal-border/50 hover:border-terminal-green text-terminal-text/40 hover:text-terminal-green transition-all"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className={cn(
          "bg-terminal-green/5 border border-terminal-border p-3 flex items-center gap-3",
          !isSidebarOpen && "justify-center px-0",
          "max-lg:justify-center max-lg:px-0"
        )}>
          <div className="w-8 h-8 bg-terminal-green/20 border border-terminal-green/50 flex items-center justify-center shrink-0">
             <div className="w-4 h-4 bg-terminal-green/60 animate-spin-slow"></div>
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden max-lg:hidden">
              <p className="text-[10px] font-black uppercase tracking-widest truncate text-terminal-green">A.RIVERA</p>
              <p className="text-[8px] text-terminal-text/30 truncate font-bold uppercase">STRAT.OFFICER</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
