import React, { useState, useMemo, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, RefreshCw, Home, Globe, Flame, TrendingUp, MessageCircle, Search, Music, Disc, AlertTriangle, BarChart3, ExternalLink } from "lucide-react";
import {
  search, getNode, getNodesByType, getNodeUrl, getVirality, getTrendState,
  getWESState, addPostToThread, createThread, recordClick, triggerViralAttempt
} from "../utils/webEcosystem";
import { WebNode, SearchIntent, WESThread, ViralityData, TrendState } from "../types";

interface BrowserTab {
  id: string;
  title: string;
  type: "home" | "search" | "artist" | "label" | "release" | "forum" | "thread" | "trending";
  nodeId?: string;
  threadId?: string;
}

interface Props {
  onClose?: () => void;
  playerName?: string;
  initialSearch?: string;
}

export default function VirtualBrowser({ onClose, initialSearch }: Props) {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: "home", title: "Scene Web", type: "home" }
  ]);
  const [activeTabId, setActiveTabId] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIntent, setSearchIntent] = useState<SearchIntent>("general");
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const wes = getWESState();

  // Derive layout data from WES state
  const trendingNodes = useMemo(() => {
    if (!wes) return [];
    return [...wes.nodes]
      .map(n => ({ node: n, score: wes.attention[n.id]?.momentum || 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [wes, wes?.tick]);

  const viralNodes = useMemo(() => {
    if (!wes) return [];
    return Object.entries(wes.virality)
      .filter(([, v]) => v.state === "viral" || v.state === "peak" || v.state === "gaining")
      .map(([id, v]) => ({ node: getNode(id), virality: v }))
      .filter(x => x.node)
      .slice(0, 6);
  }, [wes, wes?.tick]);

  const recentForums = useMemo(() => {
    if (!wes) return [];
    return [...wes.threads].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
  }, [wes, wes?.tick]);

  const openTab = (tab: BrowserTab) => {
    setIsLoading(true);
    const existing = tabs.find(t => t.type === tab.type && t.nodeId === tab.nodeId && t.threadId === tab.threadId);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      setTabs([...tabs, { ...tab, id: `tab_${Date.now()}` }]);
      setActiveTabId(`tab_${Date.now()}`);
    }
    setTimeout(() => setIsLoading(false), 150);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) { onClose?.(); return; }
    const nt = tabs.filter(t => t.id !== tabId);
    setTabs(nt);
    if (activeTabId === tabId) setActiveTabId(nt[nt.length - 1].id);
  };

  // Auto-search on mount if initialSearch is provided
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, []);

  // Run search when searchQuery changes from initialSearch
  useEffect(() => {
    if (initialSearch && searchQuery === initialSearch) {
      handleSearch();
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    openTab({ id: "search", title: `Search: ${searchQuery}`, type: "search" });
    // record a click on result nodes as user interacts
    setTimeout(() => setIsLoading(false), 200);
  };

  const viewNode = (node: WebNode) => {
    if (node.type === "artist_page") openTab({ id: `artist_${node.id}`, title: node.title, type: "artist", nodeId: node.id });
    else if (node.type === "label_site") openTab({ id: `label_${node.id}`, title: node.title, type: "label", nodeId: node.id });
    else if (node.type === "release_page" || node.type === "track_page") openTab({ id: `release_${node.id}`, title: node.title, type: "release", nodeId: node.id });
    else if (node.type === "forum_thread") {
      const thread = wes?.threads.find(t => t.id === node.metadata?.threadId);
      if (thread) openTab({ id: `thread_${thread.id}`, title: thread.title, type: "thread", threadId: thread.id });
    }
    recordClick(node.id);
  };

  const renderViralityBadge = (v?: ViralityData) => {
    if (!v || v.state === "dead" || v.state === "forgotten") return null;
    const colors: Record<string, string> = {
      gaining: "text-amber-400 bg-amber-900/20 border-amber-700",
      viral: "text-rose-400 bg-rose-900/20 border-rose-700",
      peak: "text-purple-400 bg-purple-900/20 border-purple-700",
      declining: "text-slate-400 bg-slate-900/20 border-slate-700",
    };
    return (
      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${colors[v.state] || ""} font-mono`}>
        {v.state.toUpperCase()}
      </span>
    );
  };

  const renderSearchResults = () => {
    if (!searchQuery.trim()) return <p className="text-slate-500 text-sm">Enter a query to search the scene web.</p>;
    const results = search(searchQuery, searchIntent, 20);
    if (results.length === 0) return <p className="text-slate-500 text-sm">No results found for "{searchQuery}".</p>;
    return (
      <div className="space-y-1">
        {results.map((r, i) => {
          const node = r.node;
          const attn = wes?.attention[node.id];
          const vir = getVirality(node.id);
          return (
            <div key={node.id}
              onClick={() => viewNode(node)}
              className="bg-[#111114] rounded-lg px-4 py-3 border border-[#1A1A1E] hover:border-[#00FF95]/40 cursor-pointer transition-all flex items-start gap-4"
            >
              <div className="w-8 text-right shrink-0">
                <span className="text-slate-500 text-xs font-mono">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-bold truncate">{node.title}</span>
                  {renderViralityBadge(vir)}
                  <span className="text-[9px] text-slate-500 font-mono">{node.type.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                  <span>Score: {(r.score * 100).toFixed(0)}</span>
                  <span>Auth: {(r.authority * 100).toFixed(0)}%</span>
                  <span>Eng: {(r.engagement * 100).toFixed(0)}%</span>
                  <span>Fresh: {(r.freshness * 100).toFixed(0)}%</span>
                  <span>Trend: {r.trendBoost.toFixed(1)}x</span>
                </div>
                {attn && (
                  <div className="flex items-center gap-3 text-[9px] text-slate-600 mt-0.5">
                    <span>{attn.views} views</span>
                    <span>{attn.shares} shares</span>
                    <span>{attn.likes} likes</span>
                    <span>momentum: {attn.momentum.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            </div>
          );
        })}
      </div>
    );
  };

  const renderNodePage = (nodeId: string) => {
    const node = getNode(nodeId);
    if (!node) return <p className="text-slate-500 p-8">Node not found.</p>;
    const attn = wes?.attention[nodeId];
    const vir = getVirality(nodeId);
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-[#111114] rounded-xl border border-[#1A1A1E] p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Music className="h-4 w-4 text-[#00FF95]" />
            <span className="text-[10px] text-slate-500 font-mono">{node.type.replace("_", " ")}</span>
            {renderViralityBadge(vir)}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{node.title}</h1>
          <p className="text-sm text-slate-400">{node.content}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {node.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-[#050507] text-slate-500 rounded-full border border-[#1A1A1E]">{t}</span>)}
          </div>
          <a href={getNodeUrl(node)} className="text-[10px] text-slate-600 hover:text-[#00FF95] mt-2 inline-block">{getNodeUrl(node)}</a>
        </div>

        {/* Attention Stats */}
        {attn && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Views", value: attn.views, color: "text-blue-400" },
              { label: "Shares", value: attn.shares, color: "text-green-400" },
              { label: "Likes", value: attn.likes, color: "text-rose-400" },
              { label: "Momentum", value: attn.momentum.toFixed(2), color: "text-amber-400" },
            ].map(s => (
              <div key={s.label} className="bg-[#111114] rounded-lg p-3 border border-[#1A1A1E] text-center">
                <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {vir && (
          <div className="bg-[#111114] rounded-xl border border-[#1A1A1E] p-4">
            <h3 className="text-white text-sm font-bold mb-2 flex items-center gap-2"><Flame className="h-4 w-4 text-rose-400" /> Virality Profile</h3>
            <div className="grid grid-cols-3 gap-3 text-xs text-slate-400 font-mono">
              <span>Score: {vir.score.toFixed(1)}</span>
              <span>Amplification: {vir.amplificationFactor.toFixed(2)}x</span>
              <span>Network: {(vir.networkDensity * 100).toFixed(0)}%</span>
              <span>Influencer: {vir.influencerBoost.toFixed(2)}x</span>
              <span>Emotion: {(vir.emotionalIntensity * 100).toFixed(0)}%</span>
              <span>Novelty: {(vir.noveltyFactor * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderThread = (threadId: string) => {
    const thread = wes?.threads.find(t => t.id === threadId);
    if (!thread) return <p className="text-slate-500 p-8">Thread not found.</p>;
    const { dynamics } = thread;
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-[#111114] rounded-xl border border-[#1A1A1E] p-6 mb-4">
          <h1 className="text-xl font-bold text-white mb-2">{thread.title}</h1>
          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono mb-3">
            <span>Topic: {thread.topic}</span>
            <span>Posts: {thread.posts.length}</span>
          </div>
          {/* Thread Dynamics */}
          <div className="flex gap-4 mb-4">
            {[
              { label: "Toxicity", value: dynamics.toxicity, color: dynamics.toxicity > 0.6 ? "text-rose-400" : "text-slate-400" },
              { label: "Engagement", value: dynamics.engagement, color: dynamics.engagement > 0.6 ? "text-green-400" : "text-slate-400" },
              { label: "Polarization", value: dynamics.polarization, color: dynamics.polarization > 0.5 ? "text-amber-400" : "text-slate-400" },
            ].map(m => (
              <div key={m.label} className="flex-1">
                <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                  <span>{m.label}</span>
                  <span className={m.color}>{(m.value * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-[#050507] rounded overflow-hidden">
                  <div className={`h-full rounded transition-all ${m.color.replace("text-", "bg-")}`}
                    style={{ width: `${m.value * 100}%`, opacity: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-2">
          {thread.posts.map(post => (
            <div key={post.id} className="bg-[#111114] rounded-lg p-4 border border-[#1A1A1E]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#00FF95]">{post.authorId}</span>
                <span className="text-[9px] text-slate-600">{new Date(post.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-slate-300">{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Search */}
      <div className="bg-[#111114] rounded-2xl p-6 border border-[#1A1A1E]">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Scene Web</h1>
        <p className="text-slate-500 text-xs text-center mb-4 font-mono">Live attention economy simulation</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search artists, labels, tracks, forums..."
            className="flex-1 bg-[#050507] border border-[#1A1A1E] rounded-lg px-4 py-2 text-white text-sm focus:border-[#00FF95] outline-none font-mono"
          />
          <button onClick={handleSearch} className="px-6 py-2 bg-[#00FF95] text-black font-bold rounded-lg hover:bg-[#00FF95]/90 text-sm">Search</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["general", "music", "artist", "forum", "news", "gossip"] as SearchIntent[]).map(intent => (
            <button key={intent} onClick={() => { setSearchIntent(intent); handleSearch(); }}
              className={`text-[10px] px-2.5 py-1 rounded-full border font-mono transition-colors ${
                searchIntent === intent
                  ? "bg-[#00FF95]/10 border-[#00FF95] text-[#00FF95]"
                  : "border-[#1A1A1E] text-slate-500 hover:text-white hover:border-slate-500"
              }`}
            >
              {intent.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Viral Now */}
        <div className="bg-[#111114] rounded-xl border border-[#1A1A1E] p-4">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-400" /> Viral Now
          </h2>
          {viralNodes.length === 0 ? (
            <p className="text-slate-500 text-xs">No viral content at the moment.</p>
          ) : (
            <div className="space-y-2">
              {viralNodes.map(({ node, virality }) => (
                <div key={node!.id} onClick={() => viewNode(node!)}
                  className="bg-[#050507] rounded-lg p-3 border border-rose-900/30 hover:border-rose-500/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-xs font-bold truncate">{node!.title}</span>
                    {renderViralityBadge(virality)}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    Score: {virality!.score.toFixed(1)} | Ampl: {virality!.amplificationFactor.toFixed(1)}x
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Content */}
        <div className="bg-[#111114] rounded-xl border border-[#1A1A1E] p-4">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#00FF95]" /> Trending
          </h2>
          <div className="space-y-1">
            {trendingNodes.map(({ node, score }) => (
              <div key={node.id} onClick={() => viewNode(node)}
                className="flex items-center justify-between bg-[#050507] rounded px-3 py-2 hover:bg-[#1A1A1E] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {node.type === "artist_page" ? "🎤" : node.type === "forum_thread" ? "💬" : node.type === "label_site" ? "🏷️" : "📄"}
                  </span>
                  <span className="text-white text-xs truncate">{node.title}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono shrink-0 ml-2">M: {score.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Forums */}
      <div className="bg-[#111114] rounded-xl border border-[#1A1A1E] p-4">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-cyan-400" /> Active Discussions
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {recentForums.map(t => (
            <div key={t.id} onClick={() => openTab({ id: `thread_${t.id}`, title: t.title, type: "thread", threadId: t.id })}
              className="bg-[#050507] rounded-lg p-3 border border-[#1A1A1E] hover:border-cyan-700/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white text-xs font-bold truncate">{t.title}</span>
                {t.dynamics.toxicity > 0.6 && <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />}
              </div>
              <div className="flex items-center gap-3 text-[9px] text-slate-500 font-mono">
                <span>{t.posts.length} posts</span>
                <span>Eng: {(t.dynamics.engagement * 100).toFixed(0)}%</span>
                <span>Tox: {(t.dynamics.toxicity * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend State */}
      {wes && (
        <div className="bg-[#111114] rounded-xl border border-[#1A1A1E] p-4">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-400" /> Internet Pulse
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-[10px] text-slate-500 font-mono mb-2">Genre Trends</h3>
              <div className="space-y-1">
                {Object.entries(wes.trends.genres).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g, v]) => (
                  <div key={g} className="flex items-center gap-2">
                    <span className="text-[10px] text-white w-24 truncate">{g}</span>
                    <div className="flex-1 h-2 bg-[#050507] rounded overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00FF95] to-[#FF00FF] rounded"
                        style={{ width: `${Math.max(2, v)}%`, opacity: 0.7 }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono w-8 text-right">{v.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] text-slate-500 font-mono mb-2">Hot Topics</h3>
              <div className="space-y-1">
                {Object.entries(wes.trends.topics).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, v]) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="text-[10px] text-white w-24 truncate">{t.replace("_", " ")}</span>
                    <div className="flex-1 h-2 bg-[#050507] rounded overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded" style={{ width: `${v}%`, opacity: 0.6 }} />
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono w-8 text-right">{v.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] text-slate-500 font-mono mb-2">Sentiments</h3>
              <div className="space-y-1">
                {Object.entries(wes.trends.sentiments).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, v]) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-[10px] text-white w-24 truncate">{s}</span>
                    <div className="flex-1 h-2 bg-[#050507] rounded overflow-hidden">
                      <div className="h-full bg-amber-400 rounded" style={{ width: `${v}%`, opacity: 0.6 }} />
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono w-8 text-right">{v.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (!activeTab) return null;
    if (isLoading) return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-8 w-8 text-[#00FF95] animate-spin" />
      </div>
    );
    switch (activeTab.type) {
      case "home": return renderHome();
      case "search": return (
        <div className="max-w-4xl mx-auto p-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-[#00FF95]" />
            Results for "{searchQuery}"
            <span className="text-[10px] text-slate-500 font-mono">({searchIntent})</span>
          </h2>
          {renderSearchResults()}
        </div>
      );
      case "artist":
      case "label":
      case "release":
        return activeTab.nodeId ? renderNodePage(activeTab.nodeId) : null;
      case "thread":
        return activeTab.threadId ? renderThread(activeTab.threadId) : null;
      default:
        return renderHome();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0A0A0C] flex flex-col">
      {/* Browser Chrome */}
      <div className="bg-[#111114] border-b border-[#1A1A1E] px-2 py-2 flex items-center gap-2">
        <button onClick={() => { setActiveTabId("home"); setSearchQuery(""); }}
          className="p-1.5 rounded hover:bg-[#1A1A1E] text-slate-400 hover:text-white">
          <Home className="h-4 w-4" />
        </button>
        <button className="p-1.5 rounded hover:bg-[#1A1A1E] text-slate-400 hover:text-white opacity-30 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button className="p-1.5 rounded hover:bg-[#1A1A1E] text-slate-400 hover:text-white opacity-30 cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="flex-1 flex items-center bg-[#050507] rounded-lg px-3 py-1.5 border border-[#1A1A1E]">
          <Globe className="h-3.5 w-3.5 text-[#00FF95] mr-2 shrink-0" />
          <input type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search..."
            className="flex-1 bg-transparent text-xs text-white font-mono focus:outline-none"
          />
        </div>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab Bar */}
      <div className="bg-[#111114] border-b border-[#1A1A1E] px-2 py-1 flex items-center gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <div key={tab.id} onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-2 px-3 py-1 rounded-t-lg cursor-pointer text-xs font-mono max-w-[150px] ${
              activeTabId === tab.id
                ? "bg-[#0A0A0C] text-white border-t border-[#00FF95]"
                : "bg-[#050507] text-slate-400 hover:text-slate-300 border-t border-transparent"
            }`}
          >
            <Globe className="h-3 w-3 shrink-0" />
            <span className="truncate">{tab.title}</span>
            <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} className="ml-1 hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {wes ? renderContent() : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Web ecosystem not initialized. Advance a week to seed the web.
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-[#111114] border-t border-[#1A1A1E] px-4 py-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>WES v1.0 — {wes?.nodes.length || 0} nodes, {wes?.edges.length || 0} edges, {wes?.threads.length || 0} threads</span>
        <span>Tick {wes?.tick || 0}</span>
      </div>
    </div>
  );
}
