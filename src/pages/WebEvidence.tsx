import React, { useState, useMemo } from 'react';
import { Card, Badge, Button } from '../components/ui/Primitives';
import { 
  Globe, 
  Newspaper, 
  MessageSquare, 
  Link as LinkIcon, 
  ExternalLink, 
  Search, 
  Filter, 
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  AlertTriangle,
  History,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { WebEvidenceHit, ExtractedNarrative, ScrapedPost, ScrapedComment } from '../types';

export default function WebEvidence() {
  const { webEvidence, extractedNarratives, activeSession } = useStore();
  const [activeTab, setActiveTab] = useState<'PORTAL_HITS' | 'FORUM_HITS' | 'NARRATIVE_TRACE' | 'RAW_COMMENTS' | 'POST_SOURCES'>('PORTAL_HITS');
  
  const [selectedNarrativeId, setSelectedNarrativeId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const portals = useMemo(() => webEvidence.filter(h => h.sourceType !== 'forum'), [webEvidence]);
  const forums = useMemo(() => webEvidence.filter(h => h.sourceType === 'forum'), [webEvidence]);

  const selectedNarrative = useMemo(() => 
    extractedNarratives.find(n => n.id === selectedNarrativeId) || extractedNarratives[0],
    [extractedNarratives, selectedNarrativeId]
  );

  const selectedPost = useMemo(() => 
    (activeSession?.scrapedPosts || []).find(p => p.id === selectedPostId) || (activeSession?.scrapedPosts[0]),
    [activeSession, selectedPostId]
  );

  return (
    <div className="space-y-6 px-1">
      {/* Tab Navigation */}
      <div className="flex bg-terminal-panel p-1 border border-terminal-border w-fit font-mono">
        {[
          { id: 'PORTAL_HITS', label: 'Portal Hits', icon: Newspaper },
          { id: 'FORUM_HITS', label: 'Forum Hits', icon: MessageSquare },
          { id: 'NARRATIVE_TRACE', label: 'Narrative Trace', icon: LinkIcon },
          { id: 'RAW_COMMENTS', label: 'Raw Comments', icon: History },
          { id: 'POST_SOURCES', label: 'Post Sources', icon: Globe },
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-[10px] uppercase font-black tracking-widest transition-all", 
              activeTab === tab.id ? "bg-terminal-green text-black" : "text-terminal-green/40 hover:text-terminal-green/70"
            )}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'PORTAL_HITS' && <PortalHitsTable hits={portals} />}
        {activeTab === 'FORUM_HITS' && <ForumHitsTable hits={forums} />}
        {activeTab === 'NARRATIVE_TRACE' && (
           <NarrativeTracePanel 
             selectedNarrative={selectedNarrative} 
             onSelectNarrative={(id) => setSelectedNarrativeId(id)}
           />
        )}
        {activeTab === 'RAW_COMMENTS' && <RawCommentsPanel />}
        {activeTab === 'POST_SOURCES' && <PostSourcesPanel />}
      </div>
    </div>
  );
}

function PortalHitsTable({ hits }: { hits: WebEvidenceHit[] }) {
  return (
    <Card className="console-panel border-terminal-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono">
          <thead className="bg-terminal-panel border-b border-terminal-border">
            <tr>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Source</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Title & Excerpt</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Narrative</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Sentiment</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black text-right">Relevance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terminal-border/20">
            {hits.map(hit => (
              <tr key={hit.id} className="hover:bg-terminal-green/[0.02] transition-colors group">
                <td className="p-4 align-top">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-terminal-text group-hover:text-terminal-green transition-colors">{hit.sourceName}</span>
                    <span className="text-[8px] text-terminal-green/30 lowercase">{hit.sourceDomain}</span>
                    <Badge variant="outline" className="mt-2 text-[7px] w-fit border-terminal-border/40 text-terminal-text/40">{hit.sourceType}</Badge>
                  </div>
                </td>
                <td className="p-4 max-w-md">
                   <div className="space-y-1">
                      <a href={hit.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-black text-terminal-text hover:underline flex items-center gap-1">
                        {hit.title} <ExternalLink className="w-2.5 h-2.5 opacity-30" />
                      </a>
                      <p className="text-[9px] text-terminal-text/50 italic line-clamp-2 leading-relaxed">"{hit.excerpt}"</p>
                      <span className="text-[8px] text-terminal-green/20 font-black uppercase">Published: {hit.publishedAt}</span>
                   </div>
                </td>
                <td className="p-4 align-top">
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-terminal-green/20 text-terminal-green/70">
                    {hit.narrativeId.replace('en-', 'NARRATIVE_')}
                  </Badge>
                </td>
                <td className="p-4 align-top">
                   <div className="flex items-center gap-2">
                     <SentimentIndicator sentiment={hit.sentiment} />
                     <span className="text-[9px] font-black uppercase text-terminal-text/60">{hit.pressureType}</span>
                   </div>
                </td>
                <td className="p-4 align-top text-right">
                   <div className="text-xl font-black italic tracking-tighter text-terminal-green">{Math.round(hit.relevanceScore * 100)}%</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ForumHitsTable({ hits }: { hits: WebEvidenceHit[] }) {
  return (
    <Card className="console-panel border-terminal-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono">
          <thead className="bg-terminal-panel border-b border-terminal-border">
            <tr>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Forum/Source</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Thread Excerpt</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black text-center">Sentiment</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Risk Marker</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terminal-border/20">
            {hits.map(hit => (
              <tr key={hit.id} className="hover:bg-terminal-red/[0.02] transition-colors group">
                <td className="p-4 align-top">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-terminal-text">{hit.sourceName}</span>
                    <span className="text-[8px] text-terminal-red/30 lowercase italic">regional node</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-terminal-text/80 leading-relaxed border-l-2 border-terminal-red/20 pl-3 italic">
                      "{hit.excerpt}"
                    </p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-[8px] font-black text-terminal-green/20">DOMAIN: {hit.sourceDomain}</span>
                      <span className="text-[8px] font-black text-terminal-green/20">ID: {hit.id}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <SentimentIndicator sentiment={hit.sentiment} />
                </td>
                <td className="p-4">
                  {hit.riskMarker ? (
                    <Badge className="bg-terminal-red text-black font-black text-[8px] animate-pulse">
                      <ShieldAlert className="w-2.5 h-2.5 mr-1" /> {hit.riskMarker}
                    </Badge>
                  ) : <span className="text-[8px] text-terminal-green/20">STABLE</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function NarrativeTracePanel({ selectedNarrative, onSelectNarrative }: { selectedNarrative: ExtractedNarrative | undefined, onSelectNarrative: (id: string) => void }) {
  const { extractedNarratives, webEvidence, activeSession } = useStore();
  
  if (!selectedNarrative) return null;

  const relevantHits = webEvidence.filter(h => h.narrativeId === selectedNarrative.id);
  const totalWeight = relevantHits.reduce((acc, h) => acc + h.relevanceScore, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-6 console-panel border-terminal-border">
          <h4 className="text-[10px] font-black uppercase text-terminal-green/40 mb-4 tracking-widest">Active Narratives</h4>
          <div className="space-y-2">
            {extractedNarratives.map(n => (
              <button 
                key={n.id}
                onClick={() => onSelectNarrative(n.id)}
                className={cn(
                  "w-full p-4 border text-left transition-all",
                  selectedNarrative.id === n.id 
                    ? "bg-terminal-green/10 border-terminal-green text-terminal-green shadow-[inset_0_0_10px_rgba(0,255,102,0.1)]" 
                    : "bg-black border-terminal-border/40 text-terminal-text/40 hover:border-terminal-green/40"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-black leading-none">{n.label}</span>
                  <SentimentIndicator sentiment={n.sentiment} size="sm" />
                </div>
                <div className="flex justify-between text-[8px] font-bold uppercase opacity-60">
                   <span>{n.commentCount} items</span>
                   <span>{Math.round(n.confidence * 100)}% conf</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
         <Card className="p-8 console-panel border-terminal-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Fingerprint className="w-32 h-32 text-terminal-green" />
            </div>
            
            <div className="flex items-start justify-between mb-8 border-b border-terminal-border pb-6 relative z-10">
               <div>
                  <Badge variant="outline" className="mb-2 text-terminal-green border-terminal-green/30 uppercase tracking-widest">Digital Trace: {selectedNarrative.id}</Badge>
                  <h2 className="text-4xl font-black italic tracking-tighter text-terminal-text">{selectedNarrative.label}</h2>
                  <p className="text-[11px] text-terminal-text/60 mt-2 max-w-xl leading-relaxed italic">"{selectedNarrative.description}"</p>
               </div>
               <div className="text-right">
                  <div className="text-4xl font-black italic text-terminal-green tracking-tighter">{(selectedNarrative.reachEstimate / 1000).toFixed(0)}K+</div>
                  <div className="text-[8px] font-black uppercase text-terminal-green/30">Calc Reach Pulse</div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
               <div className="space-y-4">
                  <h5 className="text-[9px] font-black uppercase text-terminal-green/40 flex items-center gap-2">
                    <Search className="w-3 h-3" /> Associated Keywords
                  </h5>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                     {selectedNarrative.keywords.map(kw => (
                       <span key={kw} className="bg-terminal-green/5 border border-terminal-green/20 text-terminal-green px-2 py-0.5 font-bold uppercase lowercase">{kw}</span>
                     ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <h5 className="text-[9px] font-black uppercase text-terminal-green/40 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> Narrative Pressure Vector
                  </h5>
                  <div className="flex items-center gap-3">
                     <span className={cn(
                       "text-[10px] font-black uppercase px-3 py-1 border",
                       selectedNarrative.sentiment === 'positive' ? 'text-terminal-green border-terminal-green/30 bg-terminal-green/5' : 'text-terminal-red border-terminal-red/30 bg-terminal-red/5'
                     )}>
                        {selectedNarrative.pressureType}
                     </span>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h5 className="text-[9px] font-black uppercase text-terminal-green/40 flex items-center gap-2 border-b border-terminal-border/20 pb-2">
                 <LinkIcon className="w-3 h-3" /> Evidence Propagation Map
               </h5>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relevantHits.map((hit, i) => (
                    <motion.div 
                      key={hit.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-terminal-panel/50 border border-terminal-border/20 relative"
                    >
                       <div className="flex justify-between items-start mb-2">
                          <Badge className="text-[8px] bg-black text-terminal-green/50 border-terminal-green/10">{hit.sourceType}</Badge>
                          <SentimentIndicator sentiment={hit.sentiment} size="xs" />
                       </div>
                       <h6 className="text-[10px] font-black text-terminal-text/80 mb-2 leading-snug">{hit.title}</h6>
                       <div className="flex items-center justify-between text-[8px] text-terminal-green/20 font-bold">
                          <span>{hit.sourceName}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}

function RawCommentsPanel() {
  const { activeSession } = useStore();
  const comments = activeSession?.scrapedComments || [];
  
  return (
    <Card className="console-panel border-terminal-border overflow-hidden">
      <div className="p-4 border-b border-terminal-border bg-terminal-panel flex justify-between items-center">
        <h4 className="text-[10px] font-black uppercase text-terminal-green/60 tracking-widest font-mono">Unified Comment Scrape Engine</h4>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 text-[9px] font-black uppercase text-terminal-green/30">
              <span className="w-2 h-2 rounded-full bg-terminal-green" /> Positive
           </div>
           <div className="flex items-center gap-2 text-[9px] font-black uppercase text-terminal-green/30">
              <span className="w-2 h-2 rounded-full bg-terminal-red" /> At-Risk
           </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono">
          <thead className="bg-terminal-panel border-b border-terminal-border">
            <tr>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Author</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Comment Text</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black text-center">Sentiment</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Intent Vector</th>
              <th className="p-4 text-[9px] uppercase text-terminal-green/40 font-black">Risk Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terminal-border/20 text-[11px]">
            {comments.map((comment) => (
              <tr key={comment.id} className="hover:bg-terminal-green/[0.01] transition-colors border-l-2 border-l-transparent hover:border-l-terminal-green">
                <td className="p-4 font-black">{comment.authorHandle}</td>
                <td className="p-4 italic text-terminal-text/60 leading-relaxed max-w-sm">"{comment.text}"</td>
                <td className="p-4 text-center">
                  <SentimentIndicator sentiment={comment.sentiment} />
                </td>
                <td className="p-4 font-black uppercase text-terminal-green/70">
                  {comment.intent}
                </td>
                <td className="p-4">
                   <div className="flex flex-wrap gap-1">
                      {comment.suspiciousSignals.map((sig, i) => (
                        <Badge key={i} className="bg-terminal-red/10 border-terminal-red/30 text-terminal-red text-[7px] font-black">{sig}</Badge>
                      ))}
                      {!comment.riskFlag && <span className="text-[8px] text-terminal-green/20">STABLE</span>}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PostSourcesPanel() {
  const { activeSession, webEvidence } = useStore();
  const posts = activeSession?.scrapedPosts || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-mono">
      {posts.map(post => {
        const hitsForPost = webEvidence.filter(h => h.originPostId === post.id);
        const sentiments = post.sentimentSplit;
        
        return (
          <Card key={post.id} className="console-panel border-terminal-border bg-black/40 hover:border-terminal-green/30 transition-all flex flex-col group">
             <div className="p-6 border-b border-terminal-border">
                <div className="flex justify-between items-start mb-4">
                   <Badge variant="outline" className="text-[10px] uppercase border-terminal-green/20 text-terminal-green/60">{post.platform}</Badge>
                   <SentimentIndicator sentiment={post.dominantSentiment} size="sm" />
                </div>
                <h5 className="text-[11px] font-black text-terminal-text leading-tight line-clamp-3 mb-2">{post.summary}</h5>
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-[8px] text-terminal-green/40 hover:text-terminal-green hover:underline">ACCESS SOURCE URL</a>
             </div>

             <div className="flex-1 p-6 space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-[7px] font-black uppercase tracking-[0.2em] text-terminal-green/30 mb-2">
                      <span>Sentiment Bias</span>
                      <span>Pos: {sentiments.positive}%</span>
                   </div>
                   <div className="flex h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-terminal-green" style={{ width: `${sentiments.positive}%` }} />
                      <div className="h-full bg-terminal-text/20" style={{ width: `${sentiments.neutral}%` }} />
                      <div className="h-full bg-terminal-red" style={{ width: `${sentiments.negative}%` }} />
                   </div>
                </div>

                <div className="space-y-4">
                   <h6 className="text-[9px] font-black uppercase text-terminal-green/20 tracking-widest">Extracted Narratives</h6>
                   <div className="flex flex-wrap gap-2">
                      {post.dominantNarratives.map(n => (
                        <Badge key={n} variant="outline" className="text-[8px] bg-terminal-green/5 border-terminal-green/20 text-terminal-green lowercase">{n}</Badge>
                      ))}
                   </div>
                </div>

                <div className="pt-6 border-t border-terminal-border/20 flex items-center justify-between">
                   <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-terminal-green/20">COMMENTS</span>
                        <span className="text-[10px] font-black">{post.commentCount}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-terminal-green/20">WEB_HITS</span>
                        <span className="text-[10px] font-black text-terminal-green">{hitsForPost.length}</span>
                      </div>
                   </div>
                   <Button variant="secondary" className="h-8 px-3 text-[9px] border-terminal-border group-hover:bg-terminal-green group-hover:text-black">RE_ANALYZE</Button>
                </div>
             </div>
          </Card>
        );
      })}
    </div>
  );
}

function SentimentIndicator({ sentiment, size = 'md' }: { sentiment: 'positive' | 'neutral' | 'negative' | string, size?: 'xs' | 'sm' | 'md' }) {
  const s = size === 'xs' ? 'w-1.5 h-1.5' : size === 'sm' ? 'w-2.5 h-2.5' : 'w-4 h-4';
  
  if (sentiment === 'positive') return <div className={cn("rounded-full bg-terminal-green shadow-[0_0_8px_#00FF66]", s)} />;
  if (sentiment === 'negative') return <div className={cn("rounded-full bg-terminal-red shadow-[0_0_8px_#FF4D4D]", s)} />;
  return <div className={cn("rounded-full bg-terminal-text/20", s)} />;
}
