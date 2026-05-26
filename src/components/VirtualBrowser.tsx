/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Globe, X, ExternalLink, ChevronLeft, ChevronRight, RefreshCw, Home, Star, Calendar, MapPin, Disc, Music } from "lucide-react";
import { RecordLabel, VirtualArtist, AIRelease } from "../types";
import { VirtualArtist as VirtualArtistType } from "../types";

// Generate fake URL for an entity
const getLabelUrl = (label: RecordLabel) => `https://${label.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-records.scene`;
const getArtistUrl = (artist: VirtualArtistType) => `https://${artist.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.scene-artists.com`;
const getReleaseUrl = (release: AIRelease, artistName: string) => `https://${artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${release.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.scene-releases.com`;

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  type: 'label' | 'artist' | 'release' | 'search' | 'home';
  data?: any;
}

interface VirtualBrowserProps {
  gameState: any;
  onClose?: () => void;
}

export default function VirtualBrowser({ gameState, onClose }: VirtualBrowserProps) {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'home', title: 'Scene Home', url: 'https://electronic-scene.com', type: 'home' }
  ]);
  const [activeTabId, setActiveTabId] = useState('home');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [addressBar, setAddressBar] = useState('https://electronic-scene.com');
  const [viewingLabel, setViewingLabel] = useState<RecordLabel | null>(null);
  const [viewingArtist, setViewingArtist] = useState<VirtualArtistType | null>(null);
  const [viewingRelease, setViewingRelease] = useState<{ release: AIRelease; artist: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId);

  // Navigate to a URL
  const navigateTo = (tab: BrowserTab) => {
    setIsLoading(true);
    setAddressBar(tab.url);
    
    // Parse URL and determine what to show
    const url = tab.url.toLowerCase();
    
    if (url.includes('-records.scene')) {
      // Label website
      const labelName = url.split('-records.scene')[0].replace('https://', '');
      const label = gameState?.aiNews?.find((l: any) => 
        l.labelName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === labelName
      )?.label || gameState?.labelActivities?.[0]?.label;
      
      // Try to find from labels data
      const matchedLabel = gameState?.virtualArtists?.[0] ? 
        { 
          id: '1', 
          name: labelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          genre: 'Electronic',
          prestige: Math.floor(Math.random() * 40) + 20,
          foundedYear: 2015,
          description: 'An underground electronic music label dedicated to pushing the boundaries of sound.',
          url: tab.url
        } : null;
      
      setViewingLabel(matchedLabel);
      setViewingArtist(null);
      setViewingRelease(null);
      setSearchResults([]);
    } else if (url.includes('.scene-artists.com')) {
      // Artist website
      const artistName = url.split('.scene-artists.com')[0].replace('https://', '').replace(/-/g, ' ');
      const matchedArtist = gameState?.virtualArtists?.find((a: VirtualArtistType) => 
        a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === url.split('.scene-artists.com')[0].replace('https://', '')
      );
      
      setViewingArtist(matchedArtist || {
        id: '1',
        name: artistName.replace(/\b\w/g, l => l.toUpperCase()),
        genre: 'Techno',
        fame: Math.floor(Math.random() * 50) + 30,
        ego: Math.floor(Math.random() * 50) + 20,
        imageUrl: `https://picsum.photos/seed/${artistName}/200/200`
      });
      setViewingLabel(null);
      setViewingRelease(null);
      setSearchResults([]);
    } else if (url.includes('.scene-releases.com')) {
      setViewingRelease(null);
      setViewingLabel(null);
      setViewingArtist(null);
      setSearchResults([]);
    } else {
      setViewingLabel(null);
      setViewingArtist(null);
      setViewingRelease(null);
      setSearchResults([]);
    }
    
    setTimeout(() => setIsLoading(false), 300);
  };

  // Open a new tab
  const openNewTab = (title: string, url: string, type: BrowserTab['type'], data?: any) => {
    const newTab: BrowserTab = {
      id: `tab_${Date.now()}`,
      title,
      url,
      type,
      data
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    navigateTo(newTab);
  };

  // Close a tab
  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      onClose?.();
      return;
    }
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  // Perform search
  const performSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    const query = searchQuery.toLowerCase();
    
    // Search through artists, labels, releases
    const results: any[] = [];
    
    // Search artists
    gameState?.virtualArtists?.forEach((artist: VirtualArtistType) => {
      if (artist.name.toLowerCase().includes(query)) {
        results.push({
          type: 'artist',
          name: artist.name,
          url: getArtistUrl(artist),
          data: artist
        });
      }
    });
    
    // Search in news/activities for labels
    gameState?.labelActivities?.forEach((activity: any) => {
      if (activity.label?.toLowerCase().includes(query) || activity.description?.toLowerCase().includes(query)) {
        results.push({
          type: 'label',
          name: activity.label || 'Unknown Label',
          url: `https://${(activity.label || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-records.scene`,
          data: activity.label
        });
      }
    });
    
    setSearchResults(results);
    setIsLoading(false);
  };

  // Navigate to home
  const goHome = () => {
    const homeTab = tabs.find(t => t.type === 'home');
    if (homeTab) {
      setActiveTabId(homeTab.id);
      navigateTo(homeTab);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0A0A0C] flex flex-col">
      {/* Browser Chrome */}
      <div className="bg-[#111114] border-b border-[#1A1A1E] px-2 py-2 flex items-center gap-2">
        {/* Navigation buttons */}
        <button
          onClick={() => goHome()}
          className="p-1.5 rounded hover:bg-[#1A1A1E] text-slate-400 hover:text-white transition-colors"
          title="Home"
        >
          <Home className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCanGoBack(!canGoBack)}
          className="p-1.5 rounded hover:bg-[#1A1A1E] text-slate-400 hover:text-white transition-colors"
          title="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCanGoForward(!canGoForward)}
          className="p-1.5 rounded hover:bg-[#1A1A1E] text-slate-400 hover:text-white transition-colors"
          title="Forward"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          className="p-1.5 rounded hover:bg-[#1A1A1E] text-slate-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        
        {/* Address bar */}
        <div className="flex-1 flex items-center bg-[#050507] rounded-lg px-3 py-1.5 border border-[#1A1A1E]">
          <Globe className="h-3.5 w-3.5 text-[#00FF95] mr-2" />
          <input
            type="text"
            value={addressBar}
            onChange={(e) => setAddressBar(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigateTo({ ...activeTab!, url: addressBar })}
            className="flex-1 bg-transparent text-xs text-white font-mono focus:outline-none"
          />
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Tab bar */}
      <div className="bg-[#111114] border-b border-[#1A1A1E] px-2 py-1 flex items-center gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => {
              setActiveTabId(tab.id);
              navigateTo(tab);
            }}
            className={`flex items-center gap-2 px-3 py-1 rounded-t-lg cursor-pointer text-xs font-mono max-w-[150px] ${
              activeTabId === tab.id
                ? 'bg-[#0A0A0C] text-white border-t border-[#00FF95]'
                : 'bg-[#050507] text-slate-400 hover:text-slate-300 border-t border-transparent'
            }`}
          >
            <Globe className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="ml-1 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-auto bg-[#0A0A0C]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-[#00FF95] animate-spin mx-auto mb-2" />
              <span className="text-slate-400 text-sm font-mono">Loading...</span>
            </div>
          </div>
        ) : viewingLabel ? (
          /* Label Website */
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-gradient-to-br from-[#1A1A1E] to-[#0A0A0C] rounded-2xl border border-[#1A1A1E] overflow-hidden">
              {/* Header */}
              <div className="bg-[#FF00FF]/10 px-8 py-12 text-center border-b border-[#FF00FF]/20">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FF00FF] to-purple-600 mx-auto mb-4 flex items-center justify-center">
                  <Disc className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">{viewingLabel.name}</h1>
                <p className="text-slate-400 font-mono text-sm">Est. {viewingLabel.foundedYear} • {viewingLabel.genre}</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className="px-3 py-1 bg-[#FF00FF]/20 text-[#FF00FF] text-xs font-mono rounded-full">
                    Prestige: {viewingLabel.prestige}
                  </span>
                  <a href={viewingLabel.url} className="text-xs text-slate-500 hover:text-[#00FF95] flex items-center gap-1">
                    {viewingLabel.url} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                <p className="text-slate-300 text-sm leading-relaxed mb-8">
                  {viewingLabel.description}
                </p>
                
                {/* Latest releases */}
                <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                  <Music className="h-5 w-5 text-[#00FF95]" />
                  Latest Releases
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {gameState?.aiReleases?.slice(0, 6).map((release: AIRelease, idx: number) => {
                    const artist = gameState?.virtualArtists?.[idx % (gameState?.virtualArtists?.length || 1)];
                    return (
                      <div
                        key={idx}
                        onClick={() => openNewTab(release.title, getReleaseUrl(release, artist?.name || 'Unknown'), 'release', { release, artist: artist?.name })}
                        className="bg-[#111114] rounded-lg border border-[#1A1A1E] hover:border-[#00FF95]/50 cursor-pointer transition-all group"
                      >
                        <div className="aspect-square bg-black">
                          <img
                            src={`https://picsum.photos/seed/${release.title}/200/200`}
                            alt={release.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <h3 className="text-white text-xs font-bold truncate">{release.title}</h3>
                          <p className="text-slate-500 text-[10px]">{artist?.name || 'Unknown Artist'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : viewingArtist ? (
          /* Artist Website */
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-gradient-to-br from-[#1A1A1E] to-[#0A0A0C] rounded-2xl border border-[#1A1A1E] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#00FF95]/10 to-[#FF00FF]/10 px-8 py-12 border-b border-[#1A1A1E]">
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-[#00FF95]/30">
                    <img
                      src={viewingArtist.imageUrl || `https://picsum.photos/seed/${viewingArtist.name}/200/200`}
                      alt={viewingArtist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">{viewingArtist.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-400 font-mono mb-3">
                      <span className="flex items-center gap-1">
                        <Music className="h-4 w-4" /> {viewingArtist.genre}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400" /> Fame: {viewingArtist.fame}
                      </span>
                    </div>
                    <a href={getArtistUrl(viewingArtist)} className="text-xs text-slate-500 hover:text-[#00FF95]">
                      {getArtistUrl(viewingArtist)}
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-[#111114] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[#00FF95]">{viewingArtist.fame}</div>
                    <div className="text-xs text-slate-500 font-mono">Fame</div>
                  </div>
                  <div className="bg-[#111114] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[#FF00FF]">{viewingArtist.ego}</div>
                    <div className="text-xs text-slate-500 font-mono">Ego</div>
                  </div>
                  <div className="bg-[#111114] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">{viewingArtist.fame > 70 ? 'Rival' : 'Neutral'}</div>
                    <div className="text-xs text-slate-500 font-mono">Status</div>
                  </div>
                  <div className="bg-[#111114] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-400">{viewingArtist.genre}</div>
                    <div className="text-xs text-slate-500 font-mono">Primary</div>
                  </div>
                </div>
                
                {/* Recent Releases */}
                <h2 className="text-lg font-display font-bold text-white mb-4">Recent Discography</h2>
                <div className="space-y-2">
                  {gameState?.aiReleases?.filter((r: AIRelease) => r.artistName === viewingArtist.name).slice(0, 5).map((release: AIRelease, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-[#111114] rounded-lg p-3 border border-[#1A1A1E] hover:border-[#00FF95]/30 cursor-pointer transition-all">
                      <img
                        src={`https://picsum.photos/seed/${release.title}/60/60`}
                        alt={release.title}
                        className="w-12 h-12 rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-white text-sm font-bold">{release.title}</h3>
                        <p className="text-slate-500 text-xs">Released Week {release.week || idx + 1}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[#00FF95] text-sm font-mono">{release.quality || 75}%</div>
                        <div className="text-slate-500 text-[10px]">Quality</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : viewingRelease ? (
          /* Release Website */
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-gradient-to-br from-[#1A1A1E] to-[#0A0A0C] rounded-2xl border border-[#1A1A1E] overflow-hidden">
              <div className="flex">
                <div className="w-80 bg-black">
                  <img
                    src={`https://picsum.photos/seed/${viewingRelease.release.title}/300/300`}
                    alt={viewingRelease.release.title}
                    className="w-full aspect-square object-cover"
                  />
                </div>
                <div className="flex-1 p-8">
                  <h1 className="text-3xl font-display font-bold text-white mb-2">{viewingRelease.release.title}</h1>
                  <h2 className="text-xl text-[#00FF95] mb-6">{viewingRelease.artist}</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#111114] rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">Quality Score</div>
                      <div className="text-2xl font-bold text-[#00FF95]">{viewingRelease.release.quality || 75}%</div>
                    </div>
                    <div className="bg-[#111114] rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">Play Count</div>
                      <div className="text-2xl font-bold text-cyan-400">{viewingRelease.release.playCount?.toLocaleString() || '12,500'}</div>
                    </div>
                  </div>
                  <a href={getReleaseUrl(viewingRelease.release, viewingRelease.artist)} className="text-xs text-slate-500 hover:text-[#00FF95]">
                    {getReleaseUrl(viewingRelease.release, viewingRelease.artist)}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          /* Search Results */
          <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-xl font-display font-bold text-white mb-6">Search Results for "{searchQuery}"</h2>
            <div className="space-y-2">
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  onClick={() => openNewTab(result.name, result.url, result.type, result.data)}
                  className="flex items-center gap-4 bg-[#111114] rounded-lg p-4 border border-[#1A1A1E] hover:border-[#00FF95]/50 cursor-pointer transition-all"
                >
                  {result.type === 'artist' ? (
                    <img
                      src={`https://picsum.photos/seed/${result.name}/60/60`}
                      alt={result.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-[#FF00FF]/20 flex items-center justify-center">
                      <Disc className="h-6 w-6 text-[#FF00FF]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{result.name}</h3>
                    <p className="text-slate-500 text-xs">{result.type === 'artist' ? 'Artist' : 'Record Label'}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Home Page / Default */
          <div className="max-w-4xl mx-auto p-8">
            {/* Search bar */}
            <div className="bg-[#111114] rounded-2xl p-6 mb-8 border border-[#1A1A1E]">
              <h1 className="text-2xl font-display font-bold text-white mb-4 text-center">
                🔍 Electronic Scene Search
              </h1>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                  placeholder="Search artists, labels, releases..."
                  className="flex-1 bg-[#050507] border border-[#1A1A1E] rounded-lg px-4 py-2 text-white text-sm focus:border-[#00FF95] outline-none font-mono"
                />
                <button
                  onClick={performSearch}
                  className="px-6 py-2 bg-[#00FF95] text-black font-bold rounded-lg hover:bg-[#00FF95]/90 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
            
            {/* Trending Artists */}
            <h2 className="text-xl font-display font-bold text-white mb-4">🔥 Trending Artists</h2>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {gameState?.virtualArtists?.slice(0, 8).map((artist: VirtualArtistType) => (
                <div
                  key={artist.id}
                  onClick={() => openNewTab(artist.name, getArtistUrl(artist), 'artist', artist)}
                  className="bg-[#111114] rounded-lg border border-[#1A1A1E] hover:border-[#00FF95]/50 cursor-pointer transition-all group"
                >
                  <img
                    src={artist.imageUrl || `https://picsum.photos/seed/${artist.name}/200/200`}
                    alt={artist.name}
                    className="w-full aspect-square object-cover rounded-t-lg"
                  />
                  <div className="p-3">
                    <h3 className="text-white text-sm font-bold truncate">{artist.name}</h3>
                    <p className="text-slate-500 text-xs">{artist.genre}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px]">
                      <Star className="h-3 w-3 text-amber-400" />
                      <span className="text-slate-400">{artist.fame} fame</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Hot Labels */}
            <h2 className="text-xl font-display font-bold text-white mb-4">🏷️ Hot Labels</h2>
            <div className="grid grid-cols-3 gap-4">
              {['Subterranean Records', 'Aurora Beats', 'Neon Wave Collective', 'Deep Frequency', 'Stellar Sound', 'Pulse Records'].map((labelName, idx) => (
                <div
                  key={idx}
                  onClick={() => openNewTab(labelName, `https://${labelName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-records.scene`, 'label')}
                  className="bg-[#111114] rounded-lg border border-[#1A1A1E] hover:border-[#FF00FF]/50 cursor-pointer transition-all p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF00FF] to-purple-600 flex items-center justify-center">
                      <Disc className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{labelName}</h3>
                      <p className="text-slate-500 text-xs">Electronic / Techno</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Status bar */}
      <div className="bg-[#111114] border-t border-[#1A1A1E] px-4 py-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Virtual Scene Browser v1.0</span>
        <span>{tabs.length} tabs open</span>
      </div>
    </div>
  );
}