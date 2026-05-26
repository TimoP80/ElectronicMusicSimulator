/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Record Label Release System - Data Module
 * Helper functions for release management, generation, and market simulation
 */

import {
  Release,
  ReleaseTrack,
  ReleaseType,
  ReleaseStatus,
  ReleaseTemplate,
  RELEASE_TEMPLATES,
  createEmptyRelease,
  createEmptyTrack,
  LabelCatalog,
  generateCatalogNumber,
  GenreTrend,
  MarketConditions,
  Region,
  ReleaseConflict,
  OptimalReleaseTime,
  DJPromotion,
} from "../types/releases";

// ============================================
// RELEASE DATABASE
// ============================================

const playerReleases: Map<string, Release> = new Map();
const aiLabelReleases: Map<string, Release> = new Map();

// ============================================
// RELEASE MANAGEMENT
// ============================================

export function addRelease(release: Release, isPlayer: boolean = true): void {
  const map = isPlayer ? playerReleases : aiLabelReleases;
  map.set(release.id, release);
}

export function getRelease(releaseId: string): Release | undefined {
  return playerReleases.get(releaseId) || aiLabelReleases.get(releaseId);
}

export function getAllPlayerReleases(): Release[] {
  return Array.from(playerReleases.values());
}

export function getAllReleases(): Release[] {
  return [...Array.from(playerReleases.values()), ...Array.from(aiLabelReleases.values())];
}

export function getReleasesByLabel(labelId: string): Release[] {
  return getAllReleases().filter(r => r.metadata.labelId === labelId);
}

export function getReleasesByStatus(status: ReleaseStatus): Release[] {
  return getAllReleases().filter(r => r.metadata.status === status);
}

export function updateRelease(releaseId: string, updates: Partial<Release>): Release | undefined {
  const release = getRelease(releaseId);
  if (!release) return undefined;
  
  const updated = { ...release, ...updates, updatedAt: new Date().toISOString() };
  
  if (playerReleases.has(releaseId)) {
    playerReleases.set(releaseId, updated);
  } else {
    aiLabelReleases.set(releaseId, updated);
  }
  
  return updated;
}

export function deleteRelease(releaseId: string): boolean {
  return playerReleases.delete(releaseId) || aiLabelReleases.delete(releaseId);
}

// ============================================
// CATALOG MANAGEMENT
// ============================================

const labelCatalogs: Map<string, LabelCatalog> = new Map();

export function initializeLabelCatalog(labelId: string, prefix: string, style: "sequential" | "year_based" | "genre_coded" = "sequential"): LabelCatalog {
  const existing = labelCatalogs.get(labelId);
  if (existing) return existing;
  
  const catalog: LabelCatalog = {
    labelId,
    catalogPrefix: prefix,
    currentNumber: 1,
    catalogStyle: style
  };
  
  labelCatalogs.set(labelId, catalog);
  return catalog;
}

export function getNextCatalogNumber(labelId: string): string {
  const catalog = labelCatalogs.get(labelId);
  if (!catalog) return "TBD";
  
  const number = generateCatalogNumber(catalog);
  catalog.currentNumber++;
  labelCatalogs.set(labelId, catalog);
  return number;
}

export function getLabelCatalog(labelId: string): LabelCatalog | undefined {
  return labelCatalogs.get(labelId);
}

// ============================================
// RELEASE CREATION HELPERS
// ============================================

export function createReleaseFromTemplate(
  labelId: string,
  labelName: string,
  templateType: ReleaseType,
  artistName: string
): Release {
  const release = createEmptyRelease(labelId, labelName, templateType);
  
  release.metadata.mainArtists = [artistName];
  release.metadata.catalogNumber = getNextCatalogNumber(labelId);
  release.metadata.isPlayerOwned = true;
  
  // Add tracks based on template
  const template = RELEASE_TEMPLATES.find(t => t.type === templateType) || RELEASE_TEMPLATES[0];
  const trackCount = template.trackCount.min + Math.floor(Math.random() * (template.trackCount.max - template.trackCount.min + 1));
  
  for (let i = 0; i < trackCount; i++) {
    const track = createEmptyTrack(`Track ${i + 1}`);
    track.metadata.title = `Untitled Track ${i + 1}`;
    release.tracks.push(track);
  }
  
  addRelease(release, release.metadata.isPlayerOwned);
  return release;
}

export function duplicateRelease(releaseId: string, newTitle: string): Release | undefined {
  const original = getRelease(releaseId);
  if (!original) return undefined;
  
  const newRelease = {
    ...original,
    id: `release_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    metadata: {
      ...original.metadata,
      title: newTitle,
      status: "draft" as ReleaseStatus,
      catalogNumber: getNextCatalogNumber(original.metadata.labelId)
    },
    tracks: original.tracks.map(t => ({
      ...t,
      id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    playCount: 0,
    streamCount: 0,
    clubPlays: 0,
    radioPlays: 0,
    chartPositions: [],
    reviews: [],
    socialMentions: 0,
    isViral: false,
    isFeatured: false,
    hasLeaked: false,
    isAwardNominated: false,
    awardNominations: []
  };
  
  addRelease(newRelease, original.metadata.isPlayerOwned);
  return newRelease;
}

// ============================================
// TRACK UTILITIES
// ============================================

export function addTrackToRelease(releaseId: string, track: ReleaseTrack): Release | undefined {
  const release = getRelease(releaseId);
  if (!release) return undefined;
  
  release.tracks.push(track);
  release.updatedAt = new Date().toISOString();
  
  if (playerReleases.has(releaseId)) {
    playerReleases.set(releaseId, release);
  } else {
    aiLabelReleases.set(releaseId, release);
  }
  
  return release;
}

export function removeTrackFromRelease(releaseId: string, trackId: string): Release | undefined {
  const release = getRelease(releaseId);
  if (!release) return undefined;
  
  release.tracks = release.tracks.filter(t => t.id !== trackId);
  release.updatedAt = new Date().toISOString();
  
  if (playerReleases.has(releaseId)) {
    playerReleases.set(releaseId, release);
  } else {
    aiLabelReleases.set(releaseId, release);
  }
  
  return release;
}

export function getTrackByIndex(releaseId: string, index: number): ReleaseTrack | undefined {
  const release = getRelease(releaseId);
  return release?.tracks[index];
}

export function getTotalDuration(release: Release): number {
  return release.tracks.reduce((sum, track) => sum + track.metadata.duration, 0);
}

export function getAverageBPM(release: Release): number {
  if (release.tracks.length === 0) return 128;
  const total = release.tracks.reduce((sum, track) => sum + track.metadata.bpm, 0);
  return Math.round(total / release.tracks.length);
}

export function getPrimaryGenre(release: Release): string {
  if (release.metadata.genre.length > 0) return release.metadata.genre[0];
  if (release.tracks.length > 0 && release.tracks[0].metadata.genre.length > 0) {
    return release.tracks[0].metadata.genre[0];
  }
  return "Techno";
}

// ============================================
// RELEASE SCHEDULING
// ============================================

export function detectConflicts(releases: Release[]): ReleaseConflict[] {
  const conflicts: ReleaseConflict[] = [];
  
  for (let i = 0; i < releases.length; i++) {
    for (let j = i + 1; j < releases.length; j++) {
      const r1 = releases[i];
      const r2 = releases[j];
      
      // Same week check
      const date1 = new Date(r1.metadata.plannedReleaseDate);
      const date2 = new Date(r2.metadata.plannedReleaseDate);
      const weekDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24 * 7);
      
      if (weekDiff < 1) {
        conflicts.push({
          id: `conflict_${r1.id}_${r2.id}`,
          releaseIds: [r1.id, r2.id],
          type: "same_week",
          severity: "medium",
          suggestedResolution: `Release ${r1.metadata.title} and ${r2.metadata.title} within same week. Consider staggering.`
        });
      }
      
      // Same label check
      if (r1.metadata.labelId === r2.metadata.labelId && r1.id !== r2.id) {
        conflicts.push({
          id: `conflict_label_${r1.id}_${r2.id}`,
          releaseIds: [r1.id, r2.id],
          type: "same_label",
          severity: "low",
          suggestedResolution: `Both releases from ${r1.metadata.labelName}. Label may want to stagger.`
        });
      }
      
      // Genre overlap
      const genre1 = r1.metadata.genre;
      const genre2 = r2.metadata.genre;
      const overlap = genre1.filter(g => genre2.includes(g));
      
      if (overlap.length > 0) {
        conflicts.push({
          id: `conflict_genre_${r1.id}_${r2.id}`,
          releaseIds: [r1.id, r2.id],
          type: "genre_overlap",
          severity: weekDiff < 2 ? "high" : "low",
          suggestedResolution: `Both releases in ${overlap.join(", ")}. Consider different release dates.`
        });
      }
    }
  }
  
  return conflicts;
}

export function getOptimalReleaseDates(
  genre: string,
  count: number = 4
): OptimalReleaseTime[] {
  const now = new Date();
  const results: OptimalReleaseTime[] = [];
  
  const seasonalReasons: Record<string, string[]> = {
    "Techno": ["Winter warehouse season", "Spring festival warmup", "Summer festival peak", "Fall peak season"],
    "House": ["Summer open-air season", "Spring rooftop sessions", "Winter indoor events", "Fall club return"],
    "Trance": ["Festival season", "Winter trance events", "Summer open flights", "Spring reunion events"],
    "Drum and Bass": ["Rave season", "Summer festival circuit", "Winter indoor meets", "Spring jump-up season"],
    "default": ["Market opportunity", "Genre trending", "Seasonal demand", "Event alignment"]
  };
  
  const reasons = seasonalReasons[genre] || seasonalReasons["default"];
  
  for (let i = 0; i < count; i++) {
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + (i * 3));
    
    const month = futureDate.getMonth();
    let recommendation: "excellent" | "good" | "fair" | "avoid" = "good";
    
    // Festival season (May-September)
    if (month >= 4 && month <= 8) {
      recommendation = "excellent";
    }
    // Year end rush (November-December)
    else if (month >= 10) {
      recommendation = "good";
    }
    // Slow season (January-February)
    else if (month <= 1) {
      recommendation = "fair";
    }
    
    results.push({
      date: futureDate.toISOString().split("T")[0],
      reason: reasons[i % reasons.length],
      genreAlignment: Math.floor(Math.random() * 3) + 7,
      competition: Math.floor(Math.random() * 5) + 3,
      recommendation
    });
  }
  
  return results;
}

// ============================================
// MARKET & TREND SIMULATION
// ============================================

const marketTrends: Map<string, GenreTrend> = new Map([
  ["Techno", { genre: "Techno", popularity: 78, trend: "rising", regionalHotspots: [{ region: "germany", score: 95 }, { region: "uk", score: 75 }], festivalPresence: 85, streamingGrowth: 15, undergroundCredibility: 90, commercialViability: 65 }],
  ["House", { genre: "House", popularity: 85, trend: "stable", regionalHotspots: [{ region: "uk", score: 90 }, { region: "usa", score: 80 }], festivalPresence: 90, streamingGrowth: 5, undergroundCredibility: 70, commercialViability: 85 }],
  ["Trance", { genre: "Trance", popularity: 55, trend: "stable", regionalHotspots: [{ region: "netherlands", score: 88 }, { region: "uk", score: 70 }], festivalPresence: 75, streamingGrowth: 2, undergroundCredibility: 80, commercialViability: 60 }],
  ["Hardstyle", { genre: "Hardstyle", popularity: 62, trend: "rising", regionalHotspots: [{ region: "netherlands", score: 92 }, { region: "germany", score: 85 }], festivalPresence: 88, streamingGrowth: 12, undergroundCredibility: 75, commercialViability: 70 }],
  ["Drum and Bass", { genre: "Drum and Bass", popularity: 68, trend: "rising", regionalHotspots: [{ region: "uk", score: 95 }, { region: "australia", score: 78 }], festivalPresence: 82, streamingGrowth: 18, undergroundCredibility: 85, commercialViability: 75 }],
]);

export function getGenreTrend(genre: string): GenreTrend | undefined {
  return marketTrends.get(genre);
}

export function getAllGenreTrends(): GenreTrend[] {
  return Array.from(marketTrends.values());
}

export function updateGenreTrend(genre: string, updates: Partial<GenreTrend>): void {
  const existing = marketTrends.get(genre);
  if (existing) {
    marketTrends.set(genre, { ...existing, ...updates });
  } else {
    marketTrends.set(genre, {
      genre,
      popularity: 50,
      trend: "stable",
      regionalHotspots: [],
      festivalPresence: 50,
      streamingGrowth: 0,
      undergroundCredibility: 50,
      commercialViability: 50,
      ...updates
    });
  }
}

export function getMarketConditions(): MarketConditions {
  const month = new Date().getMonth();
  let season: "spring" | "summer" | "autumn" | "winter" = "spring";
  
  if (month >= 2 && month <= 4) season = "spring";
  else if (month >= 5 && month <= 7) season = "summer";
  else if (month >= 8 && month <= 10) season = "autumn";
  else season = "winter";
  
  return {
    season,
    festivalSeasonActive: month >= 5 && month <= 8,
    globalTrends: getAllGenreTrends(),
    regionalTrends: [
      { region: "europe", trends: getAllGenreTrends() },
      { region: "north_america", trends: getAllGenreTrends() }
    ],
    platformBonuses: [
      { platform: "spotify", bonus: 1.2 },
      { platform: "beatport", bonus: 1.5 },
      { platform: "soundcloud", bonus: 1.1 }
    ],
    culturalMomentum: 75
  };
}

// ============================================
// DJ PROMOTION SYSTEM
// ============================================

const djPromotions: Map<string, DJPromotion[]> = new Map();

export function sendDJPromo(
  releaseId: string,
  djName: string,
  djTier: "platinum" | "gold" | "silver" | "bronze",
  promoType: "digital" | "vinyl" | "cd" | "exclusive"
): DJPromotion {
  const promo: DJPromotion = {
    releaseId,
    djName,
    djTier,
    promoType,
    sentDate: new Date().toISOString(),
    charted: false,
    reaction: "pending",
    playInSet: false,
    setRecordingAvailable: false
  };
  
  const existing = djPromotions.get(releaseId) || [];
  existing.push(promo);
  djPromotions.set(releaseId, existing);
  
  return promo;
}

export function getDJPromos(releaseId: string): DJPromotion[] {
  return djPromotions.get(releaseId) || [];
}

export function recordDJFeedback(
  releaseId: string,
  djName: string,
  feedback: string,
  reaction: "positive" | "neutral" | "negative"
): void {
  const promos = djPromotions.get(releaseId);
  if (!promos) return;
  
  const promo = promos.find(p => p.djName === djName);
  if (promo) {
    promo.feedback = feedback;
    promo.reaction = reaction;
    promo.receivedDate = new Date().toISOString();
    
    if (reaction === "positive") {
      promo.playInSet = Math.random() > 0.3;
      promo.charted = Math.random() > 0.5;
      if (promo.charted) {
        promo.chartPosition = Math.floor(Math.random() * 20) + 1;
      }
    }
  }
}

// ============================================
// PERFORMANCE CALCULATIONS
// ============================================

export function calculateExpectedPerformance(release: Release): {
  streams: number;
  clubPlays: number;
  radioPlays: number;
  viralChance: number;
  overallScore: number;
} {
  let baseStreams = 1000;
  let baseClubPlays = 10;
  let baseRadioPlays = 2;
  let viralChance = 0.01;
  
  // Track-based modifiers
  release.tracks.forEach(track => {
    baseStreams *= (1 + track.commercial.streamingOptimization / 50);
    baseClubPlays *= (1 + track.commercial.dancefloorRating / 20);
    viralChance += track.commercial.viralPotential / 500;
  });
  
  // Format modifiers
  if (release.formats.vinyl) {
    baseStreams *= 0.7; // Vinyl usually gets fewer streams
    baseClubPlays *= 1.3; // But more club plays
  }
  
  // Marketing budget impact
  baseStreams *= (1 + release.marketing.promotionalBudget / 10000);
  
  // Underground vs mainstream
  if (release.marketing.targetAudience === "underground") {
    baseClubPlays *= 1.5;
    baseStreams *= 0.6;
  } else if (release.marketing.targetAudience === "mainstream") {
    baseStreams *= 1.5;
    baseClubPlays *= 0.8;
  }
  
  // Viral chance based on features
  if (release.metadata.featuredArtists.length > 0) {
    viralChance *= 1.5;
  }
  if (release.marketing.priorityLevel === "critical") {
    viralChance *= 2;
  }
  
  const overallScore = (
    (baseStreams / 100) * 0.3 +
    (baseClubPlays * 10) * 0.4 +
    (baseRadioPlays * 50) * 0.1 +
    (viralChance * 1000) * 0.2
  );
  
  return {
    streams: Math.round(baseStreams),
    clubPlays: Math.round(baseClubPlays),
    radioPlays: Math.round(baseRadioPlays),
    viralChance: Math.min(viralChance, 0.5),
    overallScore: Math.round(overallScore)
  };
}

export function updateReleasePerformance(releaseId: string): void {
  const release = getRelease(releaseId);
  if (!release) return;
  
  const performance = calculateExpectedPerformance(release);
  
  release.streamCount = performance.streams;
  release.clubPlays = performance.clubPlays;
  release.radioPlays = performance.radioPlays;
  
  if (Math.random() < performance.viralChance) {
    release.isViral = true;
  }
  
  updateRelease(releaseId, release);
}

// ============================================
// FORMATTING HELPERS
// ============================================

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatReleaseType(type: ReleaseType): string {
  const labels: Record<ReleaseType, string> = {
    single: "Single",
    ep: "EP",
    album: "Album",
    compilation: "Compilation",
    remix_pack: "Remix Pack",
    vinyl: "Vinyl",
    digital_only: "Digital Only",
    promo: "Promo",
    live_set: "Live Set"
  };
  return labels[type] || type;
}

export function formatReleaseStatus(status: ReleaseStatus): string {
  const labels: Record<ReleaseStatus, string> = {
    draft: "Draft",
    scheduled: "Scheduled",
    mastering: "Mastering",
    promo_phase: "Promo Phase",
    released: "Released",
    archived: "Archived",
    cancelled: "Cancelled"
  };
  return labels[status] || status;
}

export function formatKey(key: string): string {
  // Convert Camelot to standard notation
  const camelotMap: Record<string, string> = {
    "1A": "Abm", "1B": "B", "2A": "Ebm", "2B": "F#", "3A": "Bbm", "3B": "Db",
    "4A": "Gm", "4B": "Ab", "5A": "Dbm", "5B": "Eb", "6A": "Cm", "6B": "F",
    "7A": "Fm", "7B": "Bb", "8A": "Bm", "8B": "D", "9A": "Gbm", "9B": "A",
    "10A": "Em", "10B": "B", "11A": "Am", "11B": "C", "12A": "Dm", "12B": "G"
  };
  return camelotMap[key] || key;
}

// ============================================
// EXPORT/IMPORT FOR MODDING
// ============================================

export function exportReleaseToJSON(release: Release): string {
  return JSON.stringify(release, null, 2);
}

export function importReleaseFromJSON(json: string): Release | null {
  try {
    const parsed = JSON.parse(json);
    // Validate basic structure
    if (!parsed.metadata || !parsed.tracks) {
      throw new Error("Invalid release structure");
    }
    addRelease(parsed, parsed.metadata.isPlayerOwned);
    return parsed;
  } catch (e) {
    console.error("Failed to import release:", e);
    return null;
  }
}

export function exportAllReleases(): string {
  return JSON.stringify({
    player: Array.from(playerReleases.values()),
    aiLabels: Array.from(aiLabelReleases.values()),
    catalogs: Array.from(labelCatalogs.entries())
  }, null, 2);
}

// ============================================
// STATISTICS
// ============================================

export function getReleaseStats(): {
  total: number;
  player: number;
  byStatus: Record<ReleaseStatus, number>;
  byType: Record<ReleaseType, number>;
  totalStreams: number;
  totalClubPlays: number;
} {
  const all = getAllReleases();
  const player = getAllPlayerReleases();
  
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let totalStreams = 0;
  let totalClubPlays = 0;
  
  all.forEach(r => {
    byStatus[r.metadata.status] = (byStatus[r.metadata.status] || 0) + 1;
    byType[r.metadata.type] = (byType[r.metadata.type] || 0) + 1;
    totalStreams += r.streamCount;
    totalClubPlays += r.clubPlays;
  });
  
  return {
    total: all.length,
    player: player.length,
    byStatus: byStatus as Record<ReleaseStatus, number>,
    byType: byType as Record<ReleaseType, number>,
    totalStreams,
    totalClubPlays
  };
}