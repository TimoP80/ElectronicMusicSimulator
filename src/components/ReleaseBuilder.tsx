/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Disc, Plus, X, Check, Clock, Music, DollarSign, Users, 
  TrendingUp, Filter, Search, Play, Send, Repeat, 
  Calendar, ChevronDown, ChevronRight, Star, AlertCircle,
  Image, ListMusic, Sparkles, ArrowRight, GripVertical
} from "lucide-react";
import { Track } from "../types";

interface ReleaseBuilderProps {
  availableTracks: Track[];
  existingReleases?: { id: string; title: string; tracks: string[] }[];
  onCreateRelease: (release: {
    title: string;
    type: 'single' | 'ep' | 'album' | 'remix_ep';
    selectedTracks: string[];
    coverUrl?: string;
    scheduledDate?: string;
  }) => void;
  onRequestRemix?: (trackId: string, requestedArtist?: string) => void;
  gameState: any;
}

interface SelectedTrack extends Track {
  position: number;
}

export default function ReleaseBuilder({ 
  availableTracks, 
  existingReleases = [],
  onCreateRelease,
  onRequestRemix,
  gameState 
}: ReleaseBuilderProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseType, setReleaseType] = useState<'single' | 'ep' | 'album' | 'remix_ep'>('single');
  const [selectedTracks, setSelectedTracks] = useState<SelectedTrack[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRemixPanel, setShowRemixPanel] = useState(false);
  const [remixRequestTrack, setRemixRequestTrack] = useState<Track | null>(null);
  const [selectedRemixArtist, setSelectedRemixArtist] = useState("");
  const [remixBudget, setRemixBudget] = useState(0);
  
  // Get unique genres from all tracks
  const allGenres = Array.from(new Set(availableTracks.flatMap(t => [t.primaryGenre, t.secondaryGenre].filter(Boolean))));

  // Filter tracks
  const filteredTracks = availableTracks.filter(track => {
    const matchesGenre = genreFilter === "all" || track.primaryGenre === genreFilter || track.secondaryGenre === genreFilter;
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase());
    const notInRelease = !existingReleases.some(r => r.tracks.includes(track.id));
    return matchesGenre && matchesSearch && notInRelease;
  });

  // Handle track selection
  const toggleTrack = (track: Track) => {
    const isSelected = selectedTracks.some(t => t.id === track.id);
    if (isSelected) {
      setSelectedTracks(selectedTracks.filter(t => t.id !== track.id).map((t, i) => ({ ...t, position: i + 1 })));
    } else {
      if (selectedTracks.length < maxTracks) {
        setSelectedTracks([...selectedTracks, { ...track, position: selectedTracks.length + 1 }]);
      }
    }
  };

  // Handle remix request
  const handleRequestRemix = () => {
    if (remixRequestTrack && onRequestRemix) {
      onRequestRemix(remixRequestTrack.id, selectedRemixArtist || undefined);
      setShowRemixPanel(false);
      setRemixRequestTrack(null);
      setSelectedRemixArtist("");
      setRemixBudget(0);
    }
  };

  // Reorder tracks
  const reorderTracks = (fromIndex: number, toIndex: number) => {
    const newTracks = [...selectedTracks];
    const [removed] = newTracks.splice(fromIndex, 1);
    newTracks.splice(toIndex, 0, removed);
    setSelectedTracks(newTracks.map((t, i) => ({ ...t, position: i + 1 })));
  };

  // Max tracks based on release type
  const maxTracks = releaseType === 'single' ? 3 : releaseType === 'ep' ? 6 : releaseType === 'album' ? 20 : 8;

  // Calculate release duration
  const totalDuration = selectedTracks.reduce((sum, t) => sum + (t.durationSeconds || 240), 0);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle create
  const handleCreate = () => {
    if (releaseTitle.trim() && selectedTracks.length > 0) {
      onCreateRelease({
        title: releaseTitle,
        type: releaseType,
        selectedTracks: selectedTracks.map(t => t.id),
        coverUrl: coverUrl || undefined,
        scheduledDate: scheduledDate || undefined
      });
    }
  };

  // Get release type info
  const releaseTypeInfo = {
    single: { name: "Single", max: 3, desc: "1-3 tracks, ideal for singles with club mix versions", icon: "🎵" },
    ep: { name: "EP", max: 6, desc: "4-6 tracks, extended play release for deeper exploration", icon: "💿" },
    album: { name: "Album", max: 20, desc: "7-20 tracks, full-length studio album", icon: "📀" },
    remix_ep: { name: "Remix EP", max: 8, desc: "Various artists remixing your tracks", icon: "🔄" }
  };

  return (
    <div className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#111114] px-6 py-4 border-b border-[#1A1A1E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF00FF]/15 rounded-lg">
              <Disc className="h-5 w-5 text-[#FF00FF]" />
            </div>
            <div>
              <h2 className="text-white font-bold">Release Builder</h2>
              <p className="text-slate-400 text-xs">Assemble and schedule your next release</p>
            </div>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${step >= s ? 'text-[#00FF95]' : 'text-slate-500'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= s ? 'bg-[#00FF95] text-black' : 'bg-[#1A1A1E]'
                  }`}>
                    {step > s ? <Check size={12} /> : s}
                  </div>
                  <span className="text-xs font-mono hidden sm:block">
                    {s === 1 ? 'Details' : s === 2 ? 'Tracks' : 'Review'}
                  </span>
                </div>
                {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-[#00FF95]' : 'bg-[#1A1A1E]'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Step 1: Release Details */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Release Title */}
            <div>
              <label className="block text-[10px] font-mono text-[#00FF95] uppercase tracking-widest mb-1.5 font-bold">
                Release Title
              </label>
              <input
                type="text"
                value={releaseTitle}
                onChange={(e) => setReleaseTitle(e.target.value)}
                placeholder="e.g. Midnight Protocols EP"
                className="w-full bg-[#050507] border border-[#1A1A1E] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#00FF95]/60 outline-none font-mono"
              />
            </div>

            {/* Release Type */}
            <div>
              <label className="block text-[10px] font-mono text-[#00FF95] uppercase tracking-widest mb-1.5 font-bold">
                Release Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(releaseTypeInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setReleaseType(key as any)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      releaseType === key
                        ? 'bg-[#111114] border-[#FF00FF] text-white'
                        : 'bg-[#050507] border-[#1A1A1E] hover:border-[#FF00FF]/30 text-slate-400'
                    }`}
                  >
                    <div className="text-xl mb-1">{info.icon}</div>
                    <div className="font-bold text-sm">{info.name}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{info.max} max</div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">
                {releaseTypeInfo[releaseType].desc}
              </p>
            </div>

            {/* Custom Cover */}
            <div>
              <label className="block text-[10px] font-mono text-[#00FF95] uppercase tracking-widest mb-1.5 font-bold">
                Cover Art URL (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://picsum.photos/seed/cover/300/300"
                  className="flex-1 bg-[#050507] border border-[#1A1A1E] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#00FF95]/60 outline-none font-mono"
                />
                {coverUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#1A1A1E]">
                    <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-[10px] font-mono text-[#00FF95] uppercase tracking-widest mb-1.5 font-bold">
                Schedule Release (optional)
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-[#050507] border border-[#1A1A1E] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#00FF95]/60 outline-none font-mono"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!releaseTitle.trim()}
              className="w-full bg-[#111114] hover:bg-[#1A1A1E] border border-[#00FF95] text-[#00FF95] font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Select Tracks
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Track Selection */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Selected tracks preview */}
            {selectedTracks.length > 0 && (
              <div className="bg-[#111114] border border-[#1A1A1E] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-[#00FF95] uppercase tracking-widest font-bold">
                    Selected Tracks ({selectedTracks.length}/{maxTracks})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Total: {formatDuration(totalDuration)}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedTracks.map((track, idx) => (
                    <div 
                      key={track.id} 
                      className="flex items-center gap-2 bg-[#050507] p-2 rounded border border-[#1A1A1E]"
                    >
                      <GripVertical size={12} className="text-slate-500" />
                      <span className="text-[#FF00FF] text-xs font-bold w-5">{track.position}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{track.title}</div>
                        <div className="text-slate-500 text-[9px]">{track.primaryGenre} • {formatDuration(track.durationSeconds || 240)}</div>
                      </div>
                      <div className="flex gap-1">
                        {idx > 0 && (
                          <button onClick={() => reorderTracks(idx, idx - 1)} className="text-slate-500 hover:text-white p-1">↑</button>
                        )}
                        {idx < selectedTracks.length - 1 && (
                          <button onClick={() => reorderTracks(idx, idx + 1)} className="text-slate-500 hover:text-white p-1">↓</button>
                        )}
                        <button onClick={() => toggleTrack(track)} className="text-rose-400 hover:text-rose-300 p-1">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tracks..."
                  className="w-full bg-[#050507] border border-[#1A1A1E] rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:border-[#00FF95]/60 outline-none font-mono"
                />
              </div>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="bg-[#050507] border border-[#1A1A1E] rounded-lg px-3 py-2 text-white text-sm outline-none"
              >
                <option value="all">All Genres</option>
                {allGenres.filter(Boolean).map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Available tracks */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {filteredTracks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No available tracks</p>
                  <p className="text-[10px]">Compose new tracks in the DAW</p>
                </div>
              ) : (
                filteredTracks.map(track => {
                  const isSelected = selectedTracks.some(t => t.id === track.id);
                  const inExistingRelease = existingReleases.some(r => r.tracks.includes(track.id));
                  
                  return (
                    <div
                      key={track.id}
                      onClick={() => !inExistingRelease && toggleTrack(track)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#111114] border-[#00FF95]'
                          : inExistingRelease
                          ? 'bg-[#050507] border-[#1A1A1E] opacity-50 cursor-not-allowed'
                          : 'bg-[#050507] border-[#1A1A1E] hover:border-[#FF00FF]/30'
                      }`}
                    >
                      {isSelected ? (
                        <div className="w-6 h-6 rounded bg-[#00FF95] flex items-center justify-center">
                          <Check size={14} className="text-black" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded border border-slate-600" />
                      )}
                      
                      <div className="w-12 h-12 rounded bg-black flex-shrink-0">
                        <img 
                          src={track.artworkUrl || `https://picsum.photos/seed/${track.title}/100/100`} 
                          alt={track.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{track.title}</div>
                        <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                          <span>{track.primaryGenre}</span>
                          <span>•</span>
                          <span>{track.stats?.bpm || 130} BPM</span>
                          <span>•</span>
                          <span>{formatDuration(track.durationSeconds || 240)}</span>
                          {track.versionName && <span className="text-[#FF00FF]">• {track.versionName}</span>}
                        </div>
                      </div>
                      
                      {inExistingRelease && (
                        <span className="text-[9px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                          In Release
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-[#050507] hover:bg-[#1A1A1E] border border-[#1A1A1E] text-slate-300 font-bold py-3 rounded-lg transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedTracks.length === 0}
                className="flex-1 bg-[#111114] hover:bg-[#1A1A1E] border border-[#00FF95] text-[#00FF95] font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                Review Release
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Create */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Release summary */}
            <div className="bg-[#111114] border border-[#1A1A1E] rounded-lg p-4">
              <div className="flex gap-4">
                {/* Cover */}
                <div className="w-32 h-32 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-[#1A1A1E]">
                  <img 
                    src={coverUrl || `https://picsum.photos/seed/${releaseTitle}/300/300`} 
                    alt={releaseTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <div className="text-[10px] text-[#FF00FF] font-mono uppercase tracking-widest mb-1">
                    {releaseTypeInfo[releaseType].name}
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">{releaseTitle}</h3>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Tracks</span>
                      <span className="text-white font-bold">{selectedTracks.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Duration</span>
                      <span className="text-white font-bold">{formatDuration(totalDuration)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Artist</span>
                      <span className="text-white font-bold">{gameState?.pseudonym || "You"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tracklist */}
              <div className="mt-4 pt-4 border-t border-[#1A1A1E]">
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Tracklist</div>
                <div className="space-y-1">
                  {selectedTracks.map((track, idx) => (
                    <div key={track.id} className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 w-4">{idx + 1}</span>
                      <span className="text-white flex-1">{track.title}</span>
                      <span className="text-slate-500">{formatDuration(track.durationSeconds || 240)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Remix Request Section */}
            <div className="bg-[#050507] border border-[#1A1A1E] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-[#FF00FF]" />
                  <span className="text-white font-bold text-sm">Request Remixes</span>
                </div>
                <button
                  onClick={() => setShowRemixPanel(!showRemixPanel)}
                  className="text-[10px] text-[#00FF95] hover:underline"
                >
                  {showRemixPanel ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showRemixPanel ? (
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400">
                    Request remixes from AI artists in the scene. They'll charge a fee based on their fame level.
                  </p>
                  
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Select Track to Remix</label>
                    <select
                      value={remixRequestTrack?.id || ""}
                      onChange={(e) => {
                        const track = selectedTracks.find(t => t.id === e.target.value);
                        setRemixRequestTrack(track || null);
                      }}
                      className="w-full bg-[#111114] border border-[#1A1A1E] rounded px-3 py-2 text-white text-xs"
                    >
                      <option value="">Select a track...</option>
                      {selectedTracks.map(track => (
                        <option key={track.id} value={track.id}>{track.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  {remixRequestTrack && (
                    <>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Request From (optional)</label>
                        <select
                          value={selectedRemixArtist}
                          onChange={(e) => setSelectedRemixArtist(e.target.value)}
                          className="w-full bg-[#111114] border border-[#1A1A1E] rounded px-3 py-2 text-white text-xs"
                        >
                          <option value="">Any available artist (cheapest)</option>
                          {gameState?.virtualArtists?.slice(0, 20).map((artist: any) => (
                            <option key={artist.id} value={artist.name}>
                              {artist.name} ({artist.fame} fame)
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-[#111114] rounded">
                        <div className="text-[10px] text-slate-400">
                          Estimated cost based on artist fame
                        </div>
                        <div className="text-[#FF00FF] font-bold">
                          ${remixBudget > 0 ? remixBudget.toFixed(0) : 'Varies'}
                        </div>
                      </div>
                      
                      <button
                        onClick={handleRequestRemix}
                        className="w-full bg-[#FF00FF]/20 border border-[#FF00FF] text-[#FF00FF] px-4 py-2 rounded text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <Send size={12} />
                        Send Remix Request
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500">
                  {selectedTracks.length} tracks available for remix requests
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-[#050507] hover:bg-[#1A1A1E] border border-[#1A1A1E] text-slate-300 font-bold py-3 rounded-lg transition-all"
              >
                Back to Tracks
              </button>
              <button
                onClick={handleCreate}
                disabled={!releaseTitle.trim() || selectedTracks.length === 0}
                className="flex-1 bg-[#00FF95] hover:bg-[#00FF95]/90 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Check size={16} />
                Create Release
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}