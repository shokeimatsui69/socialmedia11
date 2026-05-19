import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Link, 
  LogOut, 
  ChevronRight, 
  CheckCircle,
  Database,
  Lock,
  Eye,
  Settings as SettingsIcon,
  ShieldCheck,
  Smartphone,
  Mail,
  Fingerprint,
  Zap,
  Key,
  Layers,
  Search,
  ExternalLink,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const { clients, integrations, userRole, activeClientId, activeSession, activityEvents } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'integrations' | 'billing'>('profile');

  const activeClient = clients.find(c => c.id === activeClientId);
  const userName = activeClient?.accountManager || "Alex Rivera";

  const tabs = [
    { id: 'profile', label: 'Identity_Link', icon: User },
    { id: 'security', label: 'Shield_Protocol', icon: ShieldCheck },
    { id: 'integrations', label: 'Neural_Bridges', icon: Link },
    { id: 'billing', label: 'Resource_Allocation', icon: Database },
  ] as const;

  return (
    <div className="space-y-12 pb-20 bg-terminal-bg min-h-screen font-mono relative overflow-hidden px-1">
      <div className="absolute inset-0 terminal-scanline opacity-30 pointer-events-none" />
      
      <div className="flex items-end justify-between border-b border-terminal-border/50 pb-8 relative z-10">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[2px] bg-terminal-green scale-x-150 origin-left" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon className="w-4 h-4 text-terminal-green animate-spin-slow shadow-[0_0_8px_rgba(0,255,102,0.4)]" />
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-terminal-green/50 italic">System Control Hub • Access Level 4</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter terminal-glow">Command<span className="text-terminal-green">Nexus</span></h1>
          <p className="text-terminal-text/40 text-sm mt-1 max-w-lg font-black uppercase tracking-tight italic leading-relaxed">Calibrate your tactical interface for <span className="text-terminal-green/60">{activeClient?.name}</span>, verify neural permissions, and manage resource scaling.</p>
        </div>
        {activeSession && (
           <div className="flex items-center gap-4 bg-terminal-green/5 border border-terminal-green/20 p-4 animate-pulse">
              <Activity className="w-5 h-5 text-terminal-green" />
              <div>
                 <p className="text-[10px] font-black text-terminal-green uppercase tracking-widest leading-none mb-1">Active_Neural_Link</p>
                 <p className="text-[8px] text-terminal-green/40 uppercase font-black uppercase tracking-widest">{activeSession.accountHandle} // SYNCING</p>
              </div>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-terminal-panel/30 border border-terminal-border/20 p-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 transition-all duration-300 group relative overflow-hidden mb-1",
                  activeTab === tab.id 
                    ? "bg-terminal-green/10 border border-terminal-green/30 text-terminal-green shadow-[0_0_20px_rgba(0,255,102,0.05)]" 
                    : "text-terminal-green/20 hover:text-terminal-green/50 hover:bg-terminal-green/5 border border-transparent"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-terminal-green" : "text-terminal-green/20")} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10 italic">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="ml-auto w-1.5 h-1.5 bg-terminal-green shadow-[0_0_8px_#00FF66]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="bg-panel/10 border border-terminal-border/10 p-6 space-y-4">
             <h4 className="text-[9px] font-black text-terminal-green/30 uppercase tracking-[0.2em] italic border-b border-terminal-border/10 pb-2">Session_Telemetry</h4>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black px-1">
                   <span className="text-terminal-text/30">CLIENT_ID</span>
                   <span className="text-terminal-green">{activeClientId.padStart(3, '0')}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black px-1">
                   <span className="text-terminal-text/30">ECHELON</span>
                   <span className="text-terminal-green">{userRole.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black px-1">
                   <span className="text-terminal-text/30">ENCRYPTION</span>
                   <span className="text-terminal-green">AES-4096</span>
                </div>
             </div>
          </div>
          
          <Button 
             variant="secondary" 
             className="w-full justify-start gap-4 px-6 h-14 border-terminal-border group text-terminal-red/40 hover:text-terminal-red hover:bg-terminal-red/5"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Terminate_Session</span>
          </Button>
        </div>

        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <Card className="p-10 console-panel border-terminal-border/30 bg-panel/30 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                      <User className="w-64 h-64 text-terminal-green" />
                   </div>
                   <h3 className="text-[10px] font-black text-terminal-text/30 uppercase tracking-[0.2em] mb-12 border-b border-terminal-border/20 pb-2 italic">Signal_Identity_Mapping</h3>
                   
                   <div className="flex items-center gap-10 mb-16 relative z-10">
                      <div className="relative group">
                         <div className="w-32 h-32 bg-black border-2 border-terminal-border/40 flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-terminal-green/40 p-2">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=000000`} alt="avatar" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
                         </div>
                         <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-terminal-bg border border-terminal-green flex items-center justify-center shadow-2xl hover:scale-110 transition-transform text-terminal-green">
                            <Fingerprint className="w-5 h-5" />
                         </button>
                      </div>
                      <div className="space-y-3">
                         <h4 className="text-4xl font-black italic text-terminal-text tracking-tighter uppercase leading-none">{userName}</h4>
                         <div className="flex items-center gap-4">
                            <Badge variant="positive" className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1">Tier_04_Access</Badge>
                            <span className="text-[10px] text-terminal-green/30 uppercase font-black tracking-widest italic">• NEURAL_LINK_ACTIVE</span>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-8 relative z-10">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] pl-1 italic">Tactical_Nominal</label>
                         <input type="text" defaultValue={userName} className="w-full bg-black/40 border border-terminal-border/20 p-5 text-sm font-black text-terminal-text outline-none focus:border-terminal-green/40 transition-all italic uppercase tracking-tight" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] pl-1 italic">Mandate_Echelon</label>
                         <input type="text" defaultValue={activeClient?.industry || "Strategic Lead Analyst"} className="w-full bg-black/40 border border-terminal-border/20 p-5 text-sm font-black text-terminal-text/60 outline-none focus:border-terminal-green/40 transition-all italic uppercase tracking-tight" />
                      </div>
                      <div className="col-span-2 space-y-3 pt-4">
                         <label className="text-[10px] font-black text-terminal-green/30 uppercase tracking-[0.2em] pl-1 italic">Egress_Relay_Email</label>
                         <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-green/20" />
                            <input type="email" defaultValue={`${userName.toLowerCase().replace(' ', '.')}@brandambassador.ai`} className="w-full bg-black/20 border border-terminal-border/10 p-5 pl-14 text-sm font-black text-terminal-text/20 outline-none italic tracking-tight uppercase" disabled />
                         </div>
                         <p className="text-[9px] text-terminal-green/20 italic uppercase tracking-widest pl-1 mt-2">Signal locked by corporate SAML egress policy.</p>
                      </div>
                   </div>
                   <div className="mt-12 flex justify-end">
                      <Button className="h-14 px-10 bg-terminal-green text-black uppercase tracking-[0.2em] text-[10px] font-black shadow-[0_0_20px_rgba(0,255,102,0.3)] italic">Verify & Sync Link</Button>
                   </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <Card className="p-10 console-panel border-terminal-border/20 bg-panel/20">
                   <h3 className="text-[10px] font-black text-terminal-text/30 uppercase tracking-[0.2em] mb-10 border-b border-terminal-border/20 pb-2 italic text-center">Permitted_Operations_Nodes</h3>
                   <div className="space-y-4">
                      {[
                        { role: 'Administrator', desc: 'Unrestricted neural egress across all tactical segments.', count: 2, icon: Shield, color: 'text-terminal-green' },
                        { role: 'Strategic Lead', desc: 'Calibration rights for bridge parameters and narratives.', count: 5, icon: Zap, color: 'text-terminal-green/70' },
                        { role: 'Tactical Analyst', desc: 'Restricted intelligence ingestion and monitoring rights.', count: 12, icon: Fingerprint, color: 'text-terminal-amber/70' },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-black/40 border border-terminal-border/10 group hover:border-terminal-green/30 transition-all cursor-pointer">
                           <div className="flex items-center gap-8">
                              <div className="w-14 h-14 bg-black border border-terminal-border/20 flex items-center justify-center group-hover:border-terminal-green/50 transition-colors">
                                 <r.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", r.color)} />
                              </div>
                              <div>
                                 <div className="flex items-center gap-4">
                                    <p className="text-xl font-black italic text-terminal-text group-hover:text-terminal-green transition-colors uppercase tracking-tight">{r.role}</p>
                                    <Badge variant="outline" className="border-terminal-border/30 text-[9px] font-black uppercase italic">{r.count} ACTIVE</Badge>
                                 </div>
                                 <p className="text-[11px] text-terminal-text/30 mt-1 italic uppercase tracking-tighter transition-colors group-hover:text-terminal-text/50">{r.desc}</p>
                              </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-terminal-green/10 group-hover:text-terminal-green transition-all -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                        </div>
                      ))}
                   </div>
                </Card>

                <Card className="p-10 border-terminal-red/30 bg-terminal-red/[0.02] relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-terminal-red/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                   <div className="flex items-start gap-10 relative z-10">
                      <div className="w-16 h-16 bg-black flex items-center justify-center shrink-0 border border-terminal-red/20 shadow-[0_0_20px_rgba(255,77,77,0.1)]">
                         <Lock className="w-6 h-6 text-terminal-red shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse" />
                      </div>
                      <div className="flex-1 space-y-6">
                         <h4 className="text-4xl font-black italic text-terminal-red tracking-tighter uppercase leading-none">Hardened_Perimeter</h4>
                         <p className="text-lg text-terminal-red/70 leading-snug italic font-black uppercase tracking-tight bg-black/40 p-6 border border-terminal-red/10">
                           "SYSTEM UTILIZES MULTI-SATURANT SAML V2. SELF-SERVICE VAULT MODIFICATION IS RESTRICTED BY CORPORATE MANDATE. CONTACT OPERATION LEADS FOR CREDENTIAL ROTATION."
                         </p>
                         <div className="flex gap-4 pt-4">
                            <Button className="h-14 px-10 bg-terminal-red text-black font-black uppercase text-[10px] tracking-widest shadow-2xl italic border-none">Audit_Secure_Logs</Button>
                            <Button variant="secondary" className="h-14 px-8 border-terminal-border/20 text-terminal-red/40 hover:text-terminal-red text-[10px] font-black uppercase tracking-widest italic hover:bg-terminal-red/5">Protocol_Override</Button>
                         </div>
                      </div>
                   </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div 
                key="integrations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <Card className="p-10 console-panel border-terminal-border/20 bg-panel/20">
                   <div className="flex items-center justify-between mb-12 border-b border-terminal-border/20 pb-6">
                      <h3 className="text-[10px] font-black text-terminal-text/30 uppercase tracking-[0.2em] italic">Neural_Feed_Connectors</h3>
                      <Button variant="secondary" className="h-10 px-6 uppercase tracking-widest text-[9px] font-black border-terminal-border/40 group">
                         <RefreshCw className="w-3.5 h-3.5 mr-2 group-hover:rotate-180 transition-transform duration-1000" /> Refresh_Links
                      </Button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {integrations.map((int, i) => (
                        <Card key={i} className="p-8 border border-terminal-border/10 bg-black/40 hover:border-terminal-green/30 group transition-all duration-500 relative overflow-hidden cursor-pointer">
                           <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-4 h-4 text-terminal-green/30" />
                           </div>
                           <div className="flex items-center gap-6 justify-between">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 bg-black border border-terminal-border/20 flex items-center justify-center text-terminal-green/10 group-hover:text-terminal-green group-hover:border-terminal-green group-hover:bg-terminal-green/5 transition-all shadow-2xl">
                                    <Smartphone className="w-6 h-6" />
                                 </div>
                                 <div className="overflow-hidden">
                                    <p className="text-xl font-black italic text-terminal-text uppercase tracking-tighter group-hover:text-terminal-green transition-colors truncate">{int.name}</p>
                                    <p className="text-[9px] text-terminal-green/20 uppercase font-black tracking-[0.2em] mt-1 italic">{int.type}</p>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2 shrink-0">
                                 <Badge variant={int.status === 'active' ? 'positive' : 'neutral'} className="text-[8px] font-black uppercase tracking-widest px-3 border-terminal-border/20">
                                    {int.status}
                                 </Badge>
                                 <span className="text-[8px] font-black text-terminal-green/10 uppercase tracking-widest group-hover:text-terminal-green/30 transition-colors">LATENCY: 14MS</span>
                              </div>
                           </div>
                        </Card>
                      ))}
                   </div>
                   <Button variant="secondary" className="w-full h-16 mt-10 bg-black shadow-none border-dashed border-terminal-border/30 text-[10px] font-black uppercase tracking-widest hover:border-terminal-green/50 hover:text-terminal-green transition-all group">
                      Browse_Neural_Marketplace 
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </Card>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div 
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <Card className="p-10 console-panel border-terminal-border bg-black/40 overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-terminal-green/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                   <h3 className="text-[10px] font-black text-terminal-text/30 uppercase tracking-[0.2em] mb-12 border-b border-terminal-border/20 pb-2 italic">Strategic_Resource_Echelon</h3>
                   
                   <div className="grid grid-cols-3 gap-6 mb-12">
                      <div className="p-10 border border-terminal-border/20 bg-terminal-bg relative group overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                            <Activity className="w-12 h-12 text-terminal-green" />
                         </div>
                         <p className="text-[9px] font-black text-terminal-green/20 uppercase tracking-[0.2em] mb-4">Neural_Cap</p>
                         <p className="text-5xl font-black italic text-terminal-text tracking-tighter">84<span className="text-xl text-terminal-green/30 font-normal ml-1">%</span></p>
                      </div>
                      <div className="p-10 border border-terminal-border/20 bg-terminal-bg relative group overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                            <Database className="w-12 h-12 text-terminal-green" />
                         </div>
                         <p className="text-[9px] font-black text-terminal-green/20 uppercase tracking-[0.2em] mb-4">Ingress_Hose</p>
                         <p className="text-5xl font-black italic text-terminal-text tracking-tighter">14.8<span className="text-xl text-terminal-green/30 font-normal ml-1">TB</span></p>
                      </div>
                      <div className="p-10 border border-terminal-border/20 bg-terminal-bg relative group overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                            <Key className="w-12 h-12 text-terminal-green" />
                         </div>
                         <p className="text-[9px] font-black text-terminal-green/20 uppercase tracking-[0.2em] mb-4">Tactical_Cr</p>
                         <p className="text-5xl font-black italic text-terminal-text tracking-tighter">12.5<span className="text-xl text-terminal-green/30 font-normal ml-1">K</span></p>
                      </div>
                   </div>

                   <div className="p-12 border border-terminal-green/20 bg-terminal-green/[0.02] relative group shadow-inner">
                      <div className="flex justify-between items-start mb-12 border-b border-terminal-border/10 pb-8">
                         <div className="space-y-3">
                            <h4 className="text-3xl font-black italic uppercase tracking-tighter text-terminal-text leading-none">Enterprise Tactical Tier</h4>
                            <p className="text-[10px] text-terminal-green/30 font-black uppercase tracking-[0.3em] italic">Next Allocation Synchronize: 12 May 2024</p>
                         </div>
                         <Badge variant="positive" className="text-[10px] font-black uppercase px-6 py-2 shadow-[0_0_20px_rgba(0,255,102,0.3)] border-none">Active Deployment</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                         {[
                           'Unlimited Neural Ingestion Nodes', 
                           'SAML Identity Interoperability', 
                           'Tactical API Egress (SLA 99.9%)', 
                           'Dedicated Operation Command Support',
                           'Custom Cluster Mapping Nodes',
                           'Escalated Human Mitigation Priority'
                         ].map((feat, i) => (
                           <div key={i} className="flex items-center gap-4 group">
                              <div className="w-6 h-6 border border-terminal-border/20 flex items-center justify-center bg-black transition-all group-hover:border-terminal-green">
                                 <CheckCircle className="w-3.5 h-3.5 text-terminal-green/40 group-hover:text-terminal-green transition-colors" />
                              </div>
                              <span className="text-[11px] font-black text-terminal-text/40 uppercase tracking-widest italic group-hover:text-terminal-text transition-colors">{feat}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const RefreshCw = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
