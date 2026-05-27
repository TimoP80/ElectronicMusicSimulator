/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Record Label Release Management System
 * Full UI for managing releases, catalog, scheduling, and market analytics
 */

import React, { useState, useEffect } from "react";
import {
  Disc,
  Plus,
  Calendar,
  BarChart3,
  Settings,
  ChevronRight,
  Clock,
  Music,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Send,
  Filter,
  Search,
  Download,
  Upload,
  Play,
  Pause,
  SkipForward,
  Disc3,
  Disc2,
} from "lucide-react";
import {
  Release,
  ReleaseType,
  ReleaseStatus,
  ReleaseTrack,
  ReleaseTemplate,
  RELEASE_TEMPLATES,
  createEmptyRelease,
  createEmptyTrack,
  TrackMetadata,
  TrackDJ,
  TrackCommercial,
  TrackArtistic,
  MoodDescriptor,
  TargetAudience,
  GenreTrend,
  OptimalReleaseTime,
  ReleaseConflict,
} from "../types/releases";
import {
  getAllPlayerReleases,
  getAllReleases,
  addRelease,
  getRelease,
  updateRelease,
  deleteRelease,
  getNextCatalogNumber,
  initializeLabelCatalog,
  createReleaseFromTemplate,
  getOptimalReleaseDates,
  detectConflicts,
  getGenreTrend,
  getAllGenreTrends,
  getMarketConditions,
  getReleaseStats,
  getTotalDuration,
  formatDuration,
  formatReleaseType,
  formatReleaseStatus,
  calculateExpectedPerformance,
  sendDJPromo,
  getDJPromos,
} from "../data/releases";

interface ReleaseManagementProps {
  gameState: any; // Game state for context
  playerLabelId?: string;
  playerLabelName?: string;
}

type TabType = "dashboard" | "catalog" | "create" | "schedule" | "analytics" | "settings";

// ============================================
// SUB-COMPONENTS
// ============================================

const ReleaseCard: React.FC<{
  release: Release;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ release, onView, onEdit, onDelete }) => {
  const statusColors: Record<ReleaseStatus, string> = {
    draft: "bg-slate-600",
    scheduled: "bg-blue-600",
    mastering: "bg-yellow-600",
    promo_phase: "bg-purple-600",
    released: "bg-green-600",
    archived: "bg-slate-700",
    cancelled: "bg-red-600",
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-white text-sm">{release.metadata.title}</h3>
          <p className="text-slate-400 text-xs">
            {release.metadata.mainArtists.join(", ") || "Unknown Artist"}
          </p>
        </div>
        <span className={`${statusColors[release.metadata.status]} px-2 py-1 rounded text-xs text-white`}>
          {formatReleaseStatus(release.metadata.status)}
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
        <div className="text-center">
          <div className="text-slate-400">Type</div>
          <div className="text-white font-medium">{formatReleaseType(release.metadata.type)}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400">Tracks</div>
          <div className="text-white font-medium">{release.tracks.length}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400">Cat#</div>
          <div className="text-white font-medium text-xs">{release.metadata.catalogNumber}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400">Price</div>
          <div className="text-white font-medium">${release.commercial.retailPrice.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button onClick={onView} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-1.5 rounded flex items-center justify-center gap-1">
          <Eye size={12} /> View
        </button>
        <button onClick={onEdit} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 rounded flex items-center justify-center gap-1">
          <Edit3 size={12} /> Edit
        </button>
        <button onClick={onDelete} className="bg-red-600 hover:bg-red-500 text-white text-xs py-1.5 px-2 rounded">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

const TrackRow: React.FC<{
  track: ReleaseTrack;
  index: number;
  onEdit: () => void;
}> = ({ track, index, onEdit }) => {
  const energyColor = track.metadata.energy >= 7 ? "text-red-400" : track.metadata.energy >= 4 ? "text-yellow-400" : "text-green-400";
  
  return (
    <div className="bg-slate-700/50 p-3 rounded border border-slate-600 flex items-center gap-4">
      <div className="text-slate-500 font-mono text-sm w-6">{index + 1}</div>
      <div className="flex-1">
        <div className="font-medium text-white text-sm">{track.metadata.title}</div>
        <div className="text-slate-400 text-xs flex gap-4 mt-1">
          <span>{formatDuration(track.metadata.duration)}</span>
          <span>{track.metadata.bpm} BPM</span>
          <span>{track.metadata.key}</span>
          <span className={energyColor}>⚡ {track.metadata.energy}/10</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 bg-slate-600 px-2 py-1 rounded">{track.version}</span>
        {track.dj.usabilityScore >= 7 && (
          <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded" title="DJ Friendly">DJ</span>
        )}
        {track.ghostProduction && (
          <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">Ghost Produced</span>
        )}
        <button onClick={onEdit} className="text-slate-400 hover:text-white">
          <Edit3 size={14} />
        </button>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, subtitle, icon, color = "text-blue-400" }) => (
  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-400 text-xs">{title}</span>
      <span className={color}>{icon}</span>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    {subtitle && <div className="text-slate-500 text-xs">{subtitle}</div>}
  </div>
);

const TrendIndicator: React.FC<{ trend: GenreTrend }> = ({ trend }) => {
  const color = trend.trend === "rising" ? "text-green-400" : trend.trend === "declining" ? "text-red-400" : "text-slate-400";
  const arrow = trend.trend === "rising" ? "↑" : trend.trend === "declining" ? "↓" : "→";
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 text-xs">{trend.genre}</span>
      <span className={`${color} text-xs font-bold`}>{arrow}</span>
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color.replace("text-", "bg-")}`} style={{ width: `${trend.popularity}%` }} />
      </div>
    </div>
  );
};

const ConflictCard: React.FC<{ conflict: ReleaseConflict; releases: Release[] }> = ({ conflict, releases }) => {
  const r1 = releases.find(r => r.id === conflict.releaseIds[0]);
  const r2 = releases.find(r => r.id === conflict.releaseIds[1]);
  
  const severityColors = {
    high: "border-red-500 bg-red-900/20",
    medium: "border-yellow-500 bg-yellow-900/20",
    low: "border-blue-500 bg-blue-900/20"
  };
  
  return (
    <div className={`p-3 rounded border ${severityColors[conflict.severity]} mb-2`}>
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle size={14} className={conflict.severity === "high" ? "text-red-400" : "text-yellow-400"} />
        <span className="text-white text-xs font-bold capitalize">{conflict.type.replace("_", " ")}</span>
        <span className="text-slate-400 text-xs ml-auto">{conflict.severity} severity</span>
      </div>
      <p className="text-slate-300 text-xs mb-1">
        {r1?.metadata.title} vs {r2?.metadata.title}
      </p>
      {conflict.suggestedResolution && (
        <p className="text-slate-500 text-xs">{conflict.suggestedResolution}</p>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ReleaseManagement: React.FC<ReleaseManagementProps> = ({
  gameState,
  playerLabelId = "player_label_1",
  playerLabelName = "My Label"
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReleaseStatus | "all">("all");
  const [filterType, setFilterType] = useState<ReleaseType | "all">("all");
  const [stats, setStats] = useState(getReleaseStats());
  const [genreTrends, setGenreTrends] = useState<GenreTrend[]>([]);
  const [conflicts, setConflicts] = useState<ReleaseConflict[]>([]);
  const [optimalDates, setOptimalDates] = useState<OptimalReleaseTime[]>([]);
  
  // Initialize
  useEffect(() => {
    initializeLabelCatalog(playerLabelId, "MYL", "sequential");
    loadReleases();
    loadMarketData();
  }, [playerLabelId]);
  
  const loadReleases = () => {
    const all = getAllReleases();
    setReleases(all.length > 0 ? all : getDemoReleases());
    setStats(getReleaseStats());
  };
  
  const loadMarketData = () => {
    setGenreTrends(getAllGenreTrends());
    setOptimalDates(getOptimalReleaseDates("Techno", 4));
    const allReleases = getAllReleases();
    if (allReleases.length > 0) {
      setConflicts(detectConflicts(allReleases));
    }
  };
  
  const getDemoReleases = (): Release[] => {
    // Generate demo releases for testing
    const demoData: Partial<Release>[] = [
      { metadata: { title: "Neon Shadows EP", type: "ep", status: "released", catalogNumber: "MYL-001", mainArtists: ["DJ Aurora"], featuredArtists: [], remixerCredits: [], labelId: playerLabelId, labelName: playerLabelName, isPlayerOwned: true, plannedReleaseDate: "2024-01-15", genre: ["Techno"], subgenre: [] } },
      { metadata: { title: "Midnight Protocol", type: "single", status: "scheduled", catalogNumber: "MYL-002", mainArtists: ["Synth Master"], featuredArtists: [], remixerCredits: [], labelId: playerLabelId, labelName: playerLabelName, isPlayerOwned: true, plannedReleaseDate: "2024-03-01", genre: ["Techno"], subgenre: [] } },
      { metadata: { title: "Digital Dreams", type: "album", status: "draft", catalogNumber: "MYL-003", mainArtists: ["Cyber Wave"], featuredArtists: [], remixerCredits: [], labelId: playerLabelId, labelName: playerLabelName, isPlayerOwned: true, plannedReleaseDate: "2024-06-01", genre: ["House"], subgenre: [] } },
    ];
    
    return demoData.map((d, i) => ({
      ...createEmptyRelease(playerLabelId, playerLabelName),
      ...d,
      tracks: [createEmptyTrack("Track 1"), createEmptyTrack("Track 2")],
    }));
  };
  
  const handleCreateRelease = (type: ReleaseType) => {
    const release = createReleaseFromTemplate(playerLabelId, playerLabelName, type, gameState?.playerName || "Player");
    addRelease(release, true);
    loadReleases();
    setSelectedRelease(release);
    setIsCreating(false);
  };
  
  const handleUpdateRelease = (updates: Partial<Release>) => {
    if (!selectedRelease) return;
    const updated = updateRelease(selectedRelease.id, updates);
    if (updated) {
      setSelectedRelease(updated);
      loadReleases();
    }
  };
  
  const handleDeleteRelease = (releaseId: string) => {
    if (confirm("Are you sure you want to delete this release?")) {
      deleteRelease(releaseId);
      setSelectedRelease(null);
      loadReleases();
    }
  };
  
  const handleSendPromo = (releaseId: string, djName: string) => {
    sendDJPromo(releaseId, djName, "gold", "digital");
    alert(`Promo sent to ${djName}!`);
  };
  
  // Filter releases
  const filteredReleases = releases.filter(r => {
    if (filterStatus !== "all" && r.metadata.status !== filterStatus) return false;
    if (filterType !== "all" && r.metadata.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.metadata.title.toLowerCase().includes(q) ||
             r.metadata.mainArtists.some(a => a.toLowerCase().includes(q)) ||
             r.metadata.catalogNumber.toLowerCase().includes(q);
    }
    return true;
  });
  
  // Tab content
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
    { id: "catalog", label: "Catalog", icon: <Disc size={16} /> },
    { id: "create", label: "Create", icon: <Plus size={16} /> },
    { id: "schedule", label: "Schedule", icon: <Calendar size={16} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];
  
  // ============================================
  // RENDER TABS
  // ============================================
  
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Releases" value={releases.length} icon={<Disc size={20} />} color="text-blue-400" />
        <StatCard title="Total Streams" value={stats.totalStreams.toLocaleString()} icon={<Music size={20} />} color="text-green-400" />
        <StatCard title="Club Plays" value={stats.totalClubPlays.toLocaleString()} icon={<Play size={20} />} color="text-purple-400" />
        <StatCard title="Catalog Value" value={`$${(stats.totalStreams * 0.004).toFixed(0)}`} icon={<DollarSign size={20} />} color="text-yellow-400" subtitle="Est. earnings" />
      </div>
      
      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-bold mb-3">Quick Actions</h3>
        <div className="flex gap-3">
          <button onClick={() => setActiveTab("create")} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus size={16} /> New Release
          </button>
          <button onClick={() => setActiveTab("schedule")} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <Calendar size={16} /> Plan Schedule
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <Download size={16} /> Export Catalog
          </button>
        </div>
      </div>
      
      {/* Recent Releases */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-bold mb-3">Recent Releases</h3>
        <div className="grid grid-cols-3 gap-4">
          {filteredReleases.slice(0, 6).map(release => (
            <ReleaseCard
              key={release.id}
              release={release}
              onView={() => setSelectedRelease(release)}
              onEdit={() => setSelectedRelease(release)}
              onDelete={() => handleDeleteRelease(release.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Genre Trends */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-bold mb-3">Genre Market Trends</h3>
        <div className="space-y-2">
          {genreTrends.map(trend => (
            <TrendIndicator key={trend.genre} trend={trend} />
          ))}
        </div>
      </div>
      
      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-700">
          <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Release Conflicts
          </h3>
          {conflicts.slice(0, 3).map(conflict => (
            <ConflictCard key={conflict.id} conflict={conflict} releases={releases} />
          ))}
        </div>
      )}
    </div>
  );
  
  const renderCatalog = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search releases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-10 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ReleaseStatus | "all")}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="mastering">Mastering</option>
          <option value="promo_phase">Promo Phase</option>
          <option value="released">Released</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ReleaseType | "all")}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
        >
          <option value="all">All Types</option>
          <option value="single">Single</option>
          <option value="ep">EP</option>
          <option value="album">Album</option>
          <option value="vinyl">Vinyl</option>
          <option value="compilation">Compilation</option>
          <option value="remix_pack">Remix Pack</option>
        </select>
      </div>
      
      {/* Release Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredReleases.map(release => (
          <ReleaseCard
            key={release.id}
            release={release}
            onView={() => setSelectedRelease(release)}
            onEdit={() => setSelectedRelease(release)}
            onDelete={() => handleDeleteRelease(release.id)}
          />
        ))}
        {filteredReleases.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-500">
            No releases found. Create your first release!
          </div>
        )}
      </div>
    </div>
  );
  
  const renderCreate = () => (
    <div className="space-y-6">
      <h2 className="text-white font-bold text-xl">Create New Release</h2>
      
      {/* Release Templates */}
      <div className="grid grid-cols-4 gap-4">
        {RELEASE_TEMPLATES.map(template => (
          <button
            key={template.name}
            onClick={() => handleCreateRelease(template.type)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-lg p-4 text-center transition-colors"
          >
            <Disc2 size={32} className="mx-auto mb-2 text-blue-400" />
            <div className="text-white font-medium">{template.name}</div>
            <div className="text-slate-400 text-xs mt-1">
              {template.trackCount.min}-{template.trackCount.max} tracks
            </div>
          </button>
        ))}
      </div>
      
      {/* Advanced Creation */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-bold mb-3">Advanced Options</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Label</label>
            <select className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
              <option>{playerLabelName}</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Genre Focus</label>
            <select className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
              <option>Techno</option>
              <option>House</option>
              <option>Trance</option>
              <option>Drum and Bass</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Release Date</label>
            <input type="date" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Marketing Budget</label>
            <input type="number" placeholder="$500" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-white font-bold mb-4">Release Calendar</h3>
          <div className="space-y-3">
            {releases
              .filter(r => r.metadata.status !== "draft" && r.metadata.status !== "archived")
              .sort((a, b) => new Date(a.metadata.plannedReleaseDate).getTime() - new Date(b.metadata.plannedReleaseDate).getTime())
              .slice(0, 8)
              .map(release => (
                <div key={release.id} className="flex items-center gap-3 p-2 bg-slate-700/50 rounded">
                  <div className="text-slate-400 text-xs w-20">
                    {new Date(release.metadata.plannedReleaseDate).toLocaleDateString()}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{release.metadata.title}</div>
                    <div className="text-slate-400 text-xs">{formatReleaseType(release.metadata.type)}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    release.metadata.status === "released" ? "bg-green-600" :
                    release.metadata.status === "scheduled" ? "bg-blue-600" :
                    "bg-yellow-600"
                  }`}>
                    {release.metadata.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
        
        {/* Optimal Dates */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-white font-bold mb-4">Optimal Release Dates</h3>
          <div className="space-y-3">
            {optimalDates.map((opt, i) => (
              <div key={i} className={`p-3 rounded border ${
                opt.recommendation === "excellent" ? "border-green-500 bg-green-900/20" :
                opt.recommendation === "good" ? "border-blue-500 bg-blue-900/20" :
                "border-slate-600"
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white text-sm font-medium">{new Date(opt.date).toLocaleDateString()}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    opt.recommendation === "excellent" ? "bg-green-600" :
                    opt.recommendation === "good" ? "bg-blue-600" :
                    "bg-slate-600"
                  }`}>
                    {opt.recommendation}
                  </span>
                </div>
                <div className="text-slate-400 text-xs">{opt.reason}</div>
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span>Genre Fit: {opt.genreAlignment}/10</span>
                  <span>Competition: {opt.competition}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Conflicts */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" /> Schedule Conflicts
        </h3>
        {conflicts.length > 0 ? (
          <div className="space-y-2">
            {conflicts.map(conflict => (
              <ConflictCard key={conflict.id} conflict={conflict} releases={releases} />
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-sm flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" /> No conflicts detected
          </div>
        )}
      </div>
    </div>
  );
  
  const renderAnalytics = () => {
    const market = getMarketConditions();
    return (
      <div className="space-y-6">
        {/* Market Overview */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-white font-bold mb-4">Market Conditions</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded">
              <div className="text-slate-400 text-xs mb-1">Season</div>
              <div className="text-white font-bold capitalize">{market.season}</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded">
              <div className="text-slate-400 text-xs mb-1">Festival Season</div>
              <div className={`font-bold ${market.festivalSeasonActive ? "text-green-400" : "text-slate-400"}`}>
                {market.festivalSeasonActive ? "Active" : "Off Season"}
              </div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded">
              <div className="text-slate-400 text-xs mb-1">Cultural Momentum</div>
              <div className="text-white font-bold">{market.culturalMomentum}%</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded">
              <div className="text-slate-400 text-xs mb-1">Platforms</div>
              <div className="text-white font-bold">{market.platformBonuses.length}</div>
            </div>
          </div>
        </div>
        
        {/* Genre Performance */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-white font-bold mb-4">Genre Performance</h3>
          <div className="space-y-4">
            {genreTrends.map(trend => (
              <div key={trend.genre} className="p-3 bg-slate-700/50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{trend.genre}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    trend.trend === "rising" ? "bg-green-600" :
                    trend.trend === "declining" ? "bg-red-600" :
                    "bg-slate-600"
                  }`}>
                    {trend.trend}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Popularity</span>
                    <div className="text-white font-medium">{trend.popularity}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Festival</span>
                    <div className="text-white font-medium">{trend.festivalPresence}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Underground</span>
                    <div className="text-white font-medium">{trend.undergroundCredibility}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Growth</span>
                    <div className={`font-medium ${trend.streamingGrowth > 0 ? "text-green-400" : "text-red-400"}`}>
                      {trend.streamingGrowth > 0 ? "+" : ""}{trend.streamingGrowth}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Release Performance */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-white font-bold mb-4">Release Performance Forecast</h3>
          <div className="space-y-3">
            {releases.slice(0, 5).map(release => {
              const perf = calculateExpectedPerformance(release);
              return (
                <div key={release.id} className="p-3 bg-slate-700/50 rounded flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-white font-medium">{release.metadata.title}</div>
                    <div className="text-slate-400 text-xs">{release.metadata.catalogNumber}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-6 text-xs">
                    <div className="text-center">
                      <div className="text-slate-400">Streams</div>
                      <div className="text-white font-medium">{perf.streams.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">Club Plays</div>
                      <div className="text-white font-medium">{perf.clubPlays}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">Viral</div>
                      <div className="text-white font-medium">{(perf.viralChance * 100).toFixed(1)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">Score</div>
                      <div className="text-blue-400 font-medium">{perf.overallScore}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-bold mb-4">Label Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Label Name</label>
            <input type="text" defaultValue={playerLabelName} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Catalog Prefix</label>
            <input type="text" defaultValue="MYL" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Default Genre</label>
            <select className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
              <option>Techno</option>
              <option>House</option>
              <option>Trance</option>
              <option>Drum and Bass</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Default Price</label>
            <input type="number" defaultValue="5.99" step="0.01" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <button className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">Save Settings</button>
      </div>
      
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-bold mb-4">Data Export/Import</h3>
        <div className="flex gap-3">
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <Download size={16} /> Export All Releases
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <Upload size={16} /> Import Release
          </button>
        </div>
      </div>
    </div>
  );
  
  // ============================================
  // RELEASE DETAIL VIEW
  // ============================================
  
  const renderReleaseDetail = () => {
    if (!selectedRelease) return null;
    
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
        <div className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700">
          {/* Header */}
          <div className="sticky top-0 bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <div>
              <h2 className="text-white font-bold text-xl">{selectedRelease.metadata.title}</h2>
              <p className="text-slate-400 text-sm">
                {selectedRelease.metadata.mainArtists.join(", ")} • {selectedRelease.metadata.catalogNumber}
              </p>
            </div>
            <button onClick={() => setSelectedRelease(null)} className="text-slate-400 hover:text-white">
              <XCircle size={24} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-700/50 p-3 rounded text-center">
                <div className="text-slate-400 text-xs">Type</div>
                <div className="text-white font-medium">{formatReleaseType(selectedRelease.metadata.type)}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded text-center">
                <div className="text-slate-400 text-xs">Status</div>
                <div className="text-white font-medium">{formatReleaseStatus(selectedRelease.metadata.status)}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded text-center">
                <div className="text-slate-400 text-xs">Price</div>
                <div className="text-white font-medium">${selectedRelease.commercial.retailPrice.toFixed(2)}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded text-center">
                <div className="text-slate-400 text-xs">Duration</div>
                <div className="text-white font-medium">{formatDuration(getTotalDuration(selectedRelease))}</div>
              </div>
            </div>
            
            {/* Tracks */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold">Tracks ({selectedRelease.tracks.length})</h3>
                <button className="text-blue-400 text-sm hover:text-blue-300">+ Add Track</button>
              </div>
              <div className="space-y-2">
                {selectedRelease.tracks.map((track, i) => (
                  <TrackRow key={track.id} track={track} index={i} onEdit={() => {}} />
                ))}
              </div>
            </div>
            
            {/* Formats */}
            <div>
              <h3 className="text-white font-bold mb-3">Release Formats</h3>
              <div className="flex gap-2">
                {selectedRelease.formats.digital && <span className="bg-blue-600 px-3 py-1 rounded text-xs text-white">Digital</span>}
                {selectedRelease.formats.vinyl && <span className="bg-purple-600 px-3 py-1 rounded text-xs text-white">Vinyl</span>}
                {selectedRelease.formats.cd && <span className="bg-yellow-600 px-3 py-1 rounded text-xs text-white">CD</span>}
                {selectedRelease.formats.promo && <span className="bg-red-600 px-3 py-1 rounded text-xs text-white">Promo</span>}
              </div>
            </div>
            
            {/* Performance */}
            <div>
              <h3 className="text-white font-bold mb-3">Performance Forecast</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-slate-400 text-xs">Streams</div>
                  <div className="text-green-400 font-bold text-lg">{selectedRelease.streamCount.toLocaleString()}</div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-slate-400 text-xs">Club Plays</div>
                  <div className="text-purple-400 font-bold text-lg">{selectedRelease.clubPlays}</div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-slate-400 text-xs">Viral Chance</div>
                  <div className="text-yellow-400 font-bold text-lg">{(selectedRelease.commercial.viralChance * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-slate-400 text-xs">Underground</div>
                  <div className="text-white font-bold text-lg">{selectedRelease.commercial.undergroundCredibility}%</div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
                <Edit3 size={16} /> Edit Release
              </button>
              <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2">
                <Send size={16} /> Send DJ Promo
              </button>
              <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // ============================================
  // MAIN RENDER
  // ============================================
  
  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-white font-bold text-2xl flex items-center gap-3">
              <Disc size={28} className="text-blue-400" />
              Record Label Release System
            </h1>
            <p className="text-slate-400 text-sm mt-1">{playerLabelName} • {releases.length} Releases</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-800 p-1 rounded-lg w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "catalog" && renderCatalog()}
          {activeTab === "create" && renderCreate()}
          {activeTab === "schedule" && renderSchedule()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "settings" && renderSettings()}
        </div>
        
        {/* Release Detail Modal */}
        {selectedRelease && renderReleaseDetail()}
      </div>
    </div>
  );
};

export default ReleaseManagement;