/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * World News Browser - Expanded view for browsing all scene news
 * Provides a full-featured news reader with filtering and detailed articles
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, X, ExternalLink, RefreshCw, ChevronLeft, ChevronRight,
  Search, Filter, Clock, TrendingUp, Flame, Users, Music,
  Radio, Award, AlertTriangle, MessageSquare, Calendar,
  Bookmark, Share2, Heart, Eye, ArrowUpRight, ArrowDownRight,
  Maximize2, Minimize2, Layers, Newspaper, Sparkles
} from 'lucide-react';
import { AINewsPost, AIRelease, LabelActivity } from '../types';

interface WorldNewsBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  news: AINewsPost[];
  releases: AIRelease[];
  labelActivities: LabelActivity[];
  onRefreshNews?: () => void;
}

type NewsCategory = 'all' | 'release' | 'gossip' | 'trend' | 'festival' | 'scandal' | 'collab';
type SortOrder = 'newest' | 'oldest' | 'hype_high' | 'hype_low';

const categoryIcons: Record<string, React.ReactNode> = {
  release: <Music className="h-4 w-4" />,
  gossip: <MessageSquare className="h-4 w-4" />,
  trend: <TrendingUp className="h-4 w-4" />,
  festival: <Calendar className="h-4 w-4" />,
  scandal: <AlertTriangle className="h-4 w-4" />,
  collab: <Users className="h-4 w-4" />,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  release: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  gossip: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  trend: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  festival: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  scandal: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  collab: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return dateStr.replace(/Year /, 'Y').replace(/, Month /, '.').replace(/, Week /, '.');
};

const getTimeAgo = (dateStr: string): string => {
  if (!dateStr) return '';
  // Extract week number for relative time
  const weekMatch = dateStr.match(/Week (\d+)/);
  if (weekMatch) {
    return `${weekMatch[1]}W ago`;
  }
  return formatDate(dateStr);
};

export default function WorldNewsBrowser({ 
  isOpen, 
  onClose, 
  news, 
  releases, 
  labelActivities,
  onRefreshNews 
}: WorldNewsBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<AINewsPost | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'news' | 'releases' | 'labels'>('news');

  // Filter and sort news
  const filteredNews = useMemo(() => {
    let filtered = [...news];
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.headline.toLowerCase().includes(query) ||
        n.body?.toLowerCase().includes(query) ||
        n.relatedArtists.some(a => a.toLowerCase().includes(query)) ||
        n.relatedLabels.some(l => l.toLowerCase().includes(query))
      );
    }
    
    // Bookmarks filter
    if (showBookmarks) {
      filtered = filtered.filter(n => bookmarkedIds.has(n.id));
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return a.date.localeCompare(b.date);
        case 'hype_high':
          return (b.hypeImpact || 0) - (a.hypeImpact || 0);
        case 'hype_low':
          return (a.hypeImpact || 0) - (b.hypeImpact || 0);
        default: // newest
          return b.date.localeCompare(a.date);
      }
    });
    
    return filtered;
  }, [news, selectedCategory, sortOrder, searchQuery, showBookmarks, bookmarkedIds]);

  // Stats
  const stats = useMemo(() => ({
    total: news.length,
    release: news.filter(n => n.category === 'release').length,
    gossip: news.filter(n => n.category === 'gossip').length,
    trend: news.filter(n => n.category === 'trend').length,
    festival: news.filter(n => n.category === 'festival').length,
    scandal: news.filter(n => n.category === 'scandal').length,
    collab: news.filter(n => n.category === 'collab').length,
  }), [news]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[150] bg-black/90 flex items-center justify-center ${isFullscreen ? '' : 'p-4'}`}>
      <div className={`bg-[#0A0A0F] border border-[#1A1A1E] rounded-2xl overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl max-h-[90vh]'
      }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F0F1A] to-[#1A1A2E] px-6 py-4 border-b border-[#2A2A3E]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF00FF]/30 to-[#00FF95]/30 flex items-center justify-center">
                  <Newspaper className="h-5 w-5 text-[#00FF95]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">World Scene News</h2>
                  <p className="text-xs text-slate-400">Live underground electronic music news feed</p>
                </div>
              </div>
              
              {/* Stats badges */}
              <div className="hidden md:flex items-center gap-2 ml-4">
                <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-mono">
                  {stats.release} Releases
                </span>
                <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-mono">
                  {stats.gossip} Gossip
                </span>
                <span className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-mono">
                  {stats.trend} Trends
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={`p-2 rounded-lg transition-colors ${showBookmarks ? 'bg-[#FF00FF]/20 text-[#FF00FF]' : 'bg-[#1A1A1E] text-slate-400 hover:text-white'}`}
                title="Show bookmarks"
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-[#1A1A1E] text-slate-400 hover:text-white transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#1A1A1E] text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="flex items-center gap-1 mt-4 border-b border-[#2A2A3E]">
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'news' 
                  ? 'text-[#00FF95] border-[#00FF95]' 
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Radio className="h-4 w-4" /> News Feed
              </span>
            </button>
            <button
              onClick={() => setActiveTab('releases')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'releases' 
                  ? 'text-blue-400 border-blue-400' 
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Music className="h-4 w-4" /> Scene Releases
              </span>
            </button>
            <button
              onClick={() => setActiveTab('labels')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'labels' 
                  ? 'text-purple-400 border-purple-400' 
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4" /> Label Activity
              </span>
            </button>
          </div>
        </div>

        {activeTab === 'news' && (
          <>
            {/* Filters bar */}
            <div className="bg-[#0F0F15] px-6 py-3 border-b border-[#1A1A1E]">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search news, artists, labels..."
                    className="w-full bg-[#1A1A1E] border border-[#2A2A3E] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF95]"
                  />
                </div>
                
                {/* Category filters */}
                <div className="flex items-center gap-1 flex-wrap">
                  {(['all', 'release', 'gossip', 'trend', 'festival', 'scandal', 'collab'] as NewsCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? cat === 'all' 
                            ? 'bg-[#00FF95]/20 text-[#00FF95]' 
                            : `${categoryColors[cat]?.bg} ${categoryColors[cat]?.text}`
                          : 'bg-[#1A1A1E] text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
                
                {/* Sort */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="bg-[#1A1A1E] border border-[#2A2A3E] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#00FF95]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="hype_high">Highest Hype</option>
                  <option value="hype_low">Lowest Hype</option>
                </select>
              </div>
            </div>

            {/* News feed */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredNews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No news found</p>
                  <p className="text-sm">Try adjusting your filters or check back later</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredNews.map((article, index) => {
                    const colors = categoryColors[article.category] || categoryColors.release;
                    const isBookmarked = bookmarkedIds.has(article.id);
                    
                    return (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-[#0F0F15] border border-[#1A1A1E] rounded-xl p-5 hover:border-[#2A2A3E] transition-all cursor-pointer group"
                      >
                        {/* Category badge & actions */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text}`}>
                            {categoryIcons[article.category]}
                            <span className="text-xs font-medium capitalize">{article.category}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
                              className={`p-1.5 rounded-lg transition-colors ${isBookmarked ? 'text-[#FF00FF]' : 'text-slate-500 hover:text-white'}`}
                            >
                              <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                            </button>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(article.date)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Headline */}
                        <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#00FF95] transition-colors line-clamp-2">
                          {article.headline}
                        </h3>
                        
                        {/* Body preview */}
                        {article.body && (
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {article.body}
                          </p>
                        )}
                        
                        {/* Tags & stats */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1E]">
                          <div className="flex items-center gap-2 flex-wrap">
                            {article.relatedArtists.slice(0, 2).map((artist, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded bg-[#1A1A1E] text-[#00FF95]">
                                @{artist}
                              </span>
                            ))}
                            {article.relatedLabels.slice(0, 1).map((label, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded bg-[#1A1A1E] text-purple-400">
                                {label}
                              </span>
                            ))}
                          </div>
                          
                          {article.hypeImpact !== 0 && (
                            <div className={`flex items-center gap-1 text-xs font-mono ${
                              article.hypeImpact > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {article.hypeImpact > 0 ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              {Math.abs(article.hypeImpact)} hype
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'releases' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {releases.slice().reverse().map((release) => (
                <div
                  key={release.id}
                  className="bg-[#0F0F15] border border-[#1A1A1E] rounded-xl overflow-hidden hover:border-[#2A2A3E] transition-all"
                >
                  <div className="aspect-square bg-black relative">
                    <img
                      src={`https://picsum.photos/seed/${release.trackTitle}/400/400`}
                      alt={release.trackTitle}
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    {release.isViral && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1">
                        <Flame className="h-3 w-3" /> VIRAL
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-white truncate mb-1">{release.trackTitle}</h4>
                    <p className="text-sm text-[#00FF95] mb-2">{release.artistName}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{release.genre}</span>
                      <span className="text-slate-500">{release.format}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1A1A1E]">
                      <div>
                        <div className="text-lg font-bold text-[#00FF95]">{(release.playCount / 1000).toFixed(1)}K</div>
                        <div className="text-[10px] text-slate-500">plays</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-white">Q{release.quality}%</div>
                        <div className="text-[10px] text-slate-500">quality</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {releases.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Music className="h-12 w-12 mb-4 opacity-50" />
                <p>No releases in the scene yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'labels' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {labelActivities.slice().reverse().map((activity) => (
                <div
                  key={activity.id}
                  className="bg-[#0F0F15] border border-[#1A1A1E] rounded-xl p-5 hover:border-[#2A2A3E] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.type === 'signing' ? 'bg-green-500/20 text-green-400' :
                      activity.type === 'release' ? 'bg-blue-500/20 text-blue-400' :
                      activity.type === 'tour' ? 'bg-yellow-500/20 text-yellow-400' :
                      activity.type === 'closure' ? 'bg-red-500/20 text-red-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {activity.type === 'signing' ? '✍️' :
                       activity.type === 'release' ? '💿' :
                       activity.type === 'tour' ? '🎤' :
                       activity.type === 'closure' ? '💔' :
                       '🏆'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-purple-400">{activity.labelName}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#1A1A1E] text-slate-400 capitalize">{activity.type}</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{activity.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{activity.artistName}</span>
                        <span>•</span>
                        <span>{formatDate(activity.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {labelActivities.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Layers className="h-12 w-12 mb-4 opacity-50" />
                <p>No label activity yet</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#0A0A0F] px-6 py-3 border-t border-[#1A1A1E] flex items-center justify-between text-xs text-slate-500">
          <span>Showing {activeTab === 'news' ? filteredNews.length : activeTab === 'releases' ? releases.length : labelActivities.length} items</span>
          <span className="flex items-center gap-2">
            <Globe className="h-3 w-3" />
            World Scene Monitor • AI Powered
          </span>
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 z-[160] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-[#0A0A0F] border border-[#2A2A3E] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${categoryColors[selectedArticle.category]?.bg} ${categoryColors[selectedArticle.category]?.text}`}>
                  {categoryIcons[selectedArticle.category]}
                  <span className="text-sm font-medium capitalize">{selectedArticle.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(selectedArticle.id)}
                    className={`p-2 rounded-lg ${bookmarkedIds.has(selectedArticle.id) ? 'bg-[#FF00FF]/20 text-[#FF00FF]' : 'bg-[#1A1A1E] text-slate-400'}`}
                  >
                    <Bookmark className="h-4 w-4" fill={bookmarkedIds.has(selectedArticle.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 rounded-lg bg-[#1A1A1E] text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">{selectedArticle.headline}</h2>
              
              {selectedArticle.body && (
                <p className="text-slate-300 mb-6 leading-relaxed">{selectedArticle.body}</p>
              )}
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Related Artists</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.relatedArtists.map((artist, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-[#1A1A1E] text-[#00FF95] text-sm">
                        @{artist}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Related Labels</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.relatedLabels.map((label, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-[#1A1A1E] text-purple-400 text-sm">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1E]">
                  <span className="text-sm text-slate-500">{formatDate(selectedArticle.date)}</span>
                  {selectedArticle.hypeImpact !== 0 && (
                    <span className={`flex items-center gap-1 font-mono ${
                      selectedArticle.hypeImpact > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedArticle.hypeImpact > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 transform rotate-180" />}
                      {Math.abs(selectedArticle.hypeImpact)} hype impact
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
