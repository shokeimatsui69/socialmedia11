import React from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  Users, 
  Layers, 
  Settings as SettingsIcon, 
  Activity, 
  BarChart3, 
  Box, 
  Plus,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';

const clients = [
  { id: '1', name: 'EcoGear', status: 'optimal', campaigns: 12, platforms: 5, reach: '1.2M', growth: '+12.4%' },
  { id: '2', name: 'LuxeLiving', status: 'optimal', campaigns: 4, platforms: 3, reach: '450k', growth: '+2.1%' },
  { id: '3', name: 'Innovatech', status: 'issues', campaigns: 8, platforms: 6, reach: '890k', growth: '-4.2%' },
];

export default function ClientWorkspace() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Workspace</h1>
          <p className="text-zinc-400">Multi-account management and white-label configuration.</p>
        </div>
        <Button className="py-6 px-8 rounded-xl shadow-lg shadow-violet-500/20">
          <Plus className="w-5 h-5" /> Onboard New Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="p-0 overflow-hidden group hover:border-violet-500/50 transition-all">
             <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-bold text-xl text-zinc-100">{client.name[0]}</div>
                  <div>
                    <h3 className="font-bold text-zinc-100">{client.name}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Standard Enterprise Plan</p>
                  </div>
                </div>
                <div className="text-right">
                   <Badge variant={client.status === 'optimal' ? 'positive' : 'negative'}>{client.status === 'optimal' ? 'OPTIMAL' : 'ANOMALY'}</Badge>
                </div>
             </div>
             <div className="p-6 grid grid-cols-2 gap-y-6 border-b border-zinc-900">
                <div>
                   <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Active Campaigns</p>
                   <p className="text-xl font-bold text-zinc-100">{client.campaigns}</p>
                </div>
                <div>
                   <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Growth (MoM)</p>
                   <p className={cn("text-xl font-bold", client.growth.startsWith('+') ? "text-emerald-500" : "text-rose-500")}>{client.growth}</p>
                </div>
                <div>
                   <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Monitored Reach</p>
                   <p className="text-xl font-bold text-zinc-100">{client.reach}</p>
                </div>
                <div>
                   <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Connectors</p>
                   <p className="text-xl font-bold text-zinc-100">{client.platforms}</p>
                </div>
             </div>
             <div className="p-4 bg-zinc-950/80 flex items-center justify-between">
                <Button variant="ghost" className="text-[10px] h-8 text-zinc-400 hover:text-white">Workspace Settings</Button>
                <Button variant="secondary" className="text-[10px] h-8 px-4 py-0 flex items-center gap-1.5">
                   Enter Workspace <ArrowRight className="w-3 h-3" />
                </Button>
             </div>
          </Card>
        ))}

        <Card className="border-dashed border-zinc-800 bg-transparent flex flex-col items-center justify-center py-20 group hover:border-violet-500/50 transition-all cursor-pointer">
           <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-violet-600/10 transition-colors">
              <Plus className="w-6 h-6 text-zinc-600 group-hover:text-violet-500" />
           </div>
           <p className="mt-4 font-bold text-zinc-600 group-hover:text-zinc-200 transition-colors">Add Workspace</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 font-mono">White-Label Branding</h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-zinc-800 rounded-lg"><Box className="w-5 h-5 text-violet-400" /></div>
                     <div>
                        <p className="text-sm font-bold">Standard Brand Kit</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Applied to 2 clients</p>
                     </div>
                  </div>
                  <Button variant="outline" className="text-xs h-8">Manage</Button>
               </div>
               
               <div>
                  <p className="text-xs font-bold text-zinc-400 mb-3">Custom Domain Mapping</p>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between text-xs p-2.5 bg-zinc-950 rounded-lg border border-zinc-900">
                        <span className="text-zinc-500 select-all">intelligence.ecogear.com</span>
                        <Badge variant="positive" className="text-[8px]">MAPPED</Badge>
                     </div>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="p-6 border-violet-500/20 bg-violet-500/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-violet-400 mb-4">Strategic Capacity</h3>
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed italic">"Your current analyst team is at 65% capacity. You have headroom for 2 additional Enterprise clients in the current Q2 window."</p>
            <div className="flex gap-4">
               <div className="flex-1 p-4 bg-zinc-950/40 rounded-xl border border-violet-500/20 text-center">
                  <p className="text-2xl font-black text-violet-400">08/12</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Occupied Seats</p>
               </div>
               <div className="flex-1 p-4 bg-zinc-950/40 rounded-xl border border-violet-500/20 text-center">
                  <p className="text-2xl font-black text-violet-400">124h</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Monitoring Headroom</p>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
