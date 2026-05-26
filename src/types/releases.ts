/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Record Label Release System - Comprehensive Electronic Music Release Management
 * Supports Singles, EPs, Albums, Compilations, Remixes, Vinyl, Digital, and Promo releases
 */

// ============================================
// RELEASE TYPES & ENUMS
// ============================================

export type ReleaseType = 
  | "single" 
  | "ep" 
  | "album" 
  | "compilation" 
  | "remix_pack" 
  | "vinyl" 
  | "digital_only" 
  | "promo" 
  | "live_set";

export type ReleaseStatus = 
  | "draft" 
  | "scheduled" 
  | "mastering" 
  | "promo_phase" 
  | "released" 
  | "archived" 
  | "cancelled";

export type ReleaseFormat = 
  | "digital_streaming"
  | "digital_download"
  | "vinyl_12_black"
  | "vinyl_12_colored"
  | "vinyl_lp_black"
  | "vinyl_lp_colored"
  | "cd_single"
  | "cd_maxi"
  | "cassette"
  | "promo_cd"
  | "promo_digital"
  | "dj_pool";

export type MoodDescriptor = 
  | "dark" | "hypnotic" | "euphoric" | "melancholic" | "aggressive"
  | "dreamy" | "uplifting" | "menacing" | "romantic" | "mysterious"
  | "nostalgic" | "futuristic" | "raw" | "polished" | "organic"
  | "industrial" | "ethereal" | "tribal" | "minimal" | "maximal";

export type TargetAudience = 
  | "underground" 
  | "mainstream" 
  | "festival" 
  | "niche" 
  | "underground_festival"
  | "casual_listeners"
  | "dj_pool";

export type Region = 
  | "global" 
  | "europe" 
  | "north_america" 
  | "south_america" 
  | "asia" 
  | "australia"
  | "germany" 
  | "uk" 
  | "usa" 
  | "netherlands";

export type ContractType = 
  | "exclusive" 
  | "non_exclusive" 
  | "one_off" 
  | "profit_split" 
  | "work_for_hire";

// ============================================
// TRACK INTERFACE (Detailed DJ/Production Focused)
// ============================================

export interface TrackMetadata {
  title: string;
  duration: number; // in seconds
  bpm: number;
  key: string; // Camelot notation supported (e.g., "8A", "11B")
  keyStandard?: string; // Standard notation (e.g., "Am", "F#m")
  genre: string[];
  subgenre: string[];
  energy: number; // 1-10
  mood: MoodDescriptor[];
  loudness: number; // LUFS (e.g., -8, -14)
  masteringLevel: "draft" | "reference" | "mastered" | "broadcast";
}

export interface TrackCommercial {
  dancefloorRating: number; // 1-10
  experimentalScore: number; // 1-10
  commercialAppeal: number; // 1-10
  streamingOptimization: number; // 1-10
  viralPotential: number; // 1-10
}

export interface TrackDJ {
  usabilityScore: number; // 1-10 overall mixability
  introSuitability: "excellent" | "good" | "moderate" | "poor" | "none";
  outroSuitability: "excellent" | "good" | "moderate" | "poor" | "none";
  introLength: number; // seconds
  outroLength: number; // seconds
  beatgridAccuracy: number; // percentage 0-100
  phraseStructure: "16_bar" | "32_bar" | "64_bar" | "free_form";
  hasBreakdown: boolean;
  breakdownTimestamps: number[]; // array of timestamps in seconds
  dropIntensity: number; // 1-10
  harmonicCompatible: boolean;
  harmonicTags: string[]; // e.g., ["Camelot 8A", "Serum compatible"]
  keyChange: boolean;
  acapellaAvailable: boolean;
  stemsAvailable: boolean;
}

export interface TrackArtistic {
  soundDesignComplexity: number; // 1-10
  instrumentation: string[]; // e.g., ["modular_synth", "drums", "vocals", "field_recordings"]
  signatureElements: string[]; // e.g., ["acid_line", "hoover", "reese_bass"]
  emotionalTone: string[];
  narrativeTheme?: string;
  productionStyle: string[]; // e.g., ["lo-fi", "polished", "raw"]
}

export interface ReleaseTrack {
  id: string;
  metadata: TrackMetadata;
  commercial: TrackCommercial;
  dj: TrackDJ;
  artistic: TrackArtistic;
  version: "original" | "radio_edit" | "club_mix" | "extended" | "instrumental" | "acappela" | "dub" | "remix";
  remixedBy?: string;
  collaborationCredits: string[];
  ghostProduction: boolean;
  customTags: string[];
}

export interface TrackVersion {
  versionId: string;
  versionType: "original" | "radio_edit" | "club_mix" | "extended" | "instrumental" | "acappela" | "dub" | "remix" | "vip" | "dubplate";
  duration: number;
  bpm?: number;
  key?: string;
  notes?: string;
  createdAt: number;
}

// ============================================
// RELEASE INTERFACE
// ============================================

export interface ReleaseMetadata {
  title: string;
  type: ReleaseType;
  status: ReleaseStatus;
  catalogNumber: string; // e.g., "NEON-042"
  
  // Artists
  mainArtists: string[];
  featuredArtists: string[];
  remixerCredits: string[];
  
  // Label
  labelId: string;
  labelName: string;
  isPlayerOwned: boolean; // true if player is the label
  
  // Dates
  plannedReleaseDate: string; // ISO date string
  actualReleaseDate?: string;
  preOrderDate?: string;
  masteringDeadline?: string;
  promoStartDate?: string;
  
  // Description
  description?: string;
  genre: string[];
  subgenre: string[];
}

export interface ReleaseCommercial {
  retailPrice: number;
  streamingRoyaltyRate: number; // per stream
  vinylPressingCost: number;
  cdPressingCost: number;
  cassetteCost: number;
  masteringFee: number;
  artworkCost: number;
  marketingBudget: number;
  
  // Projections
  expectedStreams: number;
  expectedClubPlays: number;
  expectedRadioPlays: number;
  viralChance: number; // 0-1
  
  // Performance
  longTermCatalogValue: number; // 1-100
  culturalImpactRating: number; // 1-100
  undergroundCredibility: number; // 1-100
  mainstreamPotential: number; // 1-100
}

export interface ReleaseMarketing {
  leadSingle: boolean;
  promotionalBudget: number;
  marketingChannels: ("social_media" | "radio" | "dj_pools" | "spotify_playlists" | "youtube" | "music_blogs" | "tiktok" | "beatport")[];
  targetAudience: TargetAudience;
  regions: Region[];
  djPromoList: string[]; // DJ names to receive promos
  influencerList: string[];
  playlistPitches: string[];
  priorityLevel: "critical" | "high" | "medium" | "low";
  pressQuotes: string[];
  featuredInCurators: string[];
}

export interface ReleaseFormats {
  digital: boolean;
  vinyl: boolean;
  cd: boolean;
  cassette: boolean;
  promo: boolean;
  
  vinylType?: "12_black" | "12_colored" | "lp_black" | "lp_colored" | "limited_edition";
  vinylColor?: string; // e.g., "transparent blue", "splatter"
  vinylQuantity?: number;
  pressingPlant?: string;
  
  cdType?: "single" | "maxi" | "promo";
  cdQuantity?: number;
  
  djPoolIncluded: boolean;
  exclusiveContent: boolean;
}

export interface Release {
  id: string;
  metadata: ReleaseMetadata;
  tracks: ReleaseTrack[];
  versions: TrackVersion[];
  commercial: ReleaseCommercial;
  marketing: ReleaseMarketing;
  formats: ReleaseFormats;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  
  // Performance tracking (post-release)
  playCount: number;
  streamCount: number;
  clubPlays: number;
  radioPlays: number;
  chartPositions: { platform: string; position: number }[];
  reviews: string[];
  socialMentions: number;
  
  // Flags
  isViral: boolean;
  isFeatured: boolean;
  hasLeaked: boolean;
  leakSource?: string;
  isAwardNominated: boolean;
  awardNominations: string[];
}

// ============================================
// LABEL OPERATIONS
// ============================================

export interface LabelCatalog {
  labelId: string;
  catalogPrefix: string; // e.g., "SUB", "NEON", "CLR"
  currentNumber: number;
  catalogStyle: "sequential" | "year_based" | "genre_coded";
}

export interface LabelIdentity {
  aesthetic: "dark" | "bright" | "minimal" | "maximalist" | "retro" | "futuristic";
  genreFocus: string[];
  prestige: number; // 1-100
  reputation: number; // 1-100
  founded: string;
  location: string;
  website?: string;
  contactEmail: string;
  socialLinks: { platform: string; url: string }[];
}

export interface LabelContract {
  id: string;
  labelId: string;
  artistId: string;
  artistName: string;
  contractType: ContractType;
  signedDate: string;
  expiresDate?: string;
  royaltySplit: number; // artist's percentage
  advancePaid: number;
  recouped: boolean;
  exclusivity: boolean;
  creativeControl: "full" | "collaborative" | "label_determined";
  territories: Region[];
  disputeRisk: number; // 0-100
}

export interface LabelRelationship {
  artistId: string;
  artistName: string;
  labelId: string;
  labelName: string;
  loyalty: number; // 0-100
  reputationImpact: number; // positive or negative
  activeContracts: string[]; // contract IDs
  releaseHistory: string[]; // release IDs
  pendingReleases: string[];
  disputes: string[];
  totalEarningsFromLabel: number;
  averageRoyaltyRate: number;
}

// ============================================
// RELEASE PLANNING & SCHEDULING
// ============================================

export interface ReleaseSchedule {
  releases: Release[];
  conflicts: ReleaseConflict[];
  optimalTiming: OptimalReleaseTime[];
}

export interface ReleaseConflict {
  id: string;
  releaseIds: string[];
  type: "genre_overlap" | "same_week" | "same_label" | "similar_style";
  severity: "high" | "medium" | "low";
  suggestedResolution?: string;
}

export interface OptimalReleaseTime {
  date: string;
  reason: string; // e.g., "Festival season", "End of year rush"
  genreAlignment: number; // 1-10 how well it fits
  competition: number; // 1-10 how many releases expected
  recommendation: "excellent" | "good" | "fair" | "avoid";
}

export interface ReleaseCalendar {
  month: number;
  year: number;
  planned: Release[];
  released: Release[];
  anniversaries: { releaseId: string; yearsSince: number }[];
  trends: string[]; // e.g., ["techno rising", "dnb revival"]
}

// ============================================
// TREND & MARKET
// ============================================

export interface GenreTrend {
  genre: string;
  popularity: number; // 0-100
  trend: "rising" | "stable" | "declining";
  regionalHotspots: { region: Region; score: number }[];
  festivalPresence: number; // 0-100
  streamingGrowth: number; // percentage change
  undergroundCredibility: number; // 0-100
  commercialViability: number; // 0-100
}

export interface MarketConditions {
  season: "spring" | "summer" | "autumn" | "winter";
  festivalSeasonActive: boolean;
  globalTrends: GenreTrend[];
  regionalTrends: { region: Region; trends: GenreTrend[] }[];
  platformBonuses: { platform: string; bonus: number }[];
  culturalMomentum: number; // 0-100
}

// ============================================
// DJ INTEGRATION
// ============================================

export interface DJPromotion {
  releaseId: string;
  djName: string;
  djTier: "platinum" | "gold" | "silver" | "bronze";
  promoType: "digital" | "vinyl" | "cd" | "exclusive";
  sentDate: string;
  receivedDate?: string;
  charted: boolean;
  chartPosition?: number;
  feedback?: string;
  reaction: "positive" | "neutral" | "negative" | "pending";
  playInSet: boolean;
  setRecordingAvailable: boolean;
}

export interface DJChart {
  djName: string;
  chartDate: string;
  tracks: { releaseId: string; position: number; weeksOnChart: number }[];
  chartType: "traxsource" | "beatport" | "club_chart" | "radio";
}

// ============================================
// PRESET TEMPLATES
// ============================================

export interface ReleaseTemplate {
  name: string;
  type: ReleaseType;
  trackCount: { min: number; max: number };
  suggestedFormats: ReleaseFormat[];
  requiredMetadata: (keyof ReleaseMetadata)[];
  commercialDefaults: Partial<ReleaseCommercial>;
  marketingDefaults: Partial<ReleaseMarketing>;
}

export const RELEASE_TEMPLATES: ReleaseTemplate[] = [
  {
    name: "Digital Single",
    type: "single",
    trackCount: { min: 1, max: 3 },
    suggestedFormats: ["digital_streaming", "digital_download", "promo_digital"],
    requiredMetadata: ["title", "mainArtists", "labelId"],
    commercialDefaults: { retailPrice: 1.29, marketingBudget: 500 },
    marketingDefaults: { priorityLevel: "medium", targetAudience: "underground" }
  },
  {
    name: "Digital EP",
    type: "ep",
    trackCount: { min: 3, max: 6 },
    suggestedFormats: ["digital_streaming", "digital_download", "promo_digital", "dj_pool"],
    requiredMetadata: ["title", "mainArtists", "labelId"],
    commercialDefaults: { retailPrice: 5.99, marketingBudget: 1500 },
    marketingDefaults: { priorityLevel: "high", targetAudience: "underground_festival" }
  },
  {
    name: "Full Album",
    type: "album",
    trackCount: { min: 8, max: 15 },
    suggestedFormats: ["digital_streaming", "digital_download", "vinyl_lp_black", "cd_single"],
    requiredMetadata: ["title", "mainArtists", "labelId"],
    commercialDefaults: { retailPrice: 12.99, marketingBudget: 5000 },
    marketingDefaults: { priorityLevel: "critical", targetAudience: "mainstream" }
  },
  {
    name: "Vinyl EP",
    type: "vinyl",
    trackCount: { min: 2, max: 4 },
    suggestedFormats: ["vinyl_12_colored", "digital_streaming"],
    requiredMetadata: ["title", "mainArtists", "labelId"],
    commercialDefaults: { vinylPressingCost: 800, marketingBudget: 1000 },
    marketingDefaults: { priorityLevel: "high", targetAudience: "underground" }
  },
  {
    name: "Limited Vinyl",
    type: "vinyl",
    trackCount: { min: 2, max: 4 },
    suggestedFormats: ["vinyl_12_colored"],
    requiredMetadata: ["title", "mainArtists", "labelId"],
    commercialDefaults: { vinylPressingCost: 1200, retailPrice: 18.99 },
    marketingDefaults: { priorityLevel: "high", targetAudience: "niche" }
  },
  {
    name: "Remix Pack",
    type: "remix_pack",
    trackCount: { min: 2, max: 6 },
    suggestedFormats: ["digital_streaming", "promo_digital"],
    requiredMetadata: ["title", "mainArtists", "labelId"],
    commercialDefaults: { retailPrice: 4.99, marketingBudget: 800 },
    marketingDefaults: { priorityLevel: "medium", targetAudience: "dj_pool" }
  },
  {
    name: "DJ Promo Pack",
    type: "promo",
    trackCount: { min: 1, max: 10 },
    suggestedFormats: ["promo_digital", "promo_cd", "dj_pool"],
    requiredMetadata: ["title", "mainArtists", "labelId"],
    commercialDefaults: { marketingBudget: 300 },
    marketingDefaults: { priorityLevel: "low", targetAudience: "dj_pool" }
  },
  {
    name: "Compilation",
    type: "compilation",
    trackCount: { min: 10, max: 20 },
    suggestedFormats: ["digital_streaming", "vinyl_lp_black", "cd_maxi"],
    requiredMetadata: ["title", "labelId"],
    commercialDefaults: { retailPrice: 9.99, marketingBudget: 2000 },
    marketingDefaults: { priorityLevel: "medium", targetAudience: "mainstream" }
  }
];

// ============================================
// FACTORY FUNCTIONS
// ============================================

export function createEmptyRelease(
  labelId: string,
  labelName: string,
  type: ReleaseType = "single"
): Release {
  const now = new Date().toISOString();
  const template = RELEASE_TEMPLATES.find(t => t.type === type) || RELEASE_TEMPLATES[0];
  
  return {
    id: `release_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    metadata: {
      title: "Untitled Release",
      type,
      status: "draft",
      catalogNumber: "TBD",
      mainArtists: [],
      featuredArtists: [],
      remixerCredits: [],
      labelId,
      labelName,
      isPlayerOwned: false,
      plannedReleaseDate: now,
      description: "",
      genre: [],
      subgenre: []
    },
    tracks: [],
    versions: [],
    commercial: {
      retailPrice: template.commercialDefaults?.retailPrice || 1.29,
      streamingRoyaltyRate: 0.004,
      vinylPressingCost: 0,
      cdPressingCost: 0,
      cassetteCost: 0,
      masteringFee: 200,
      artworkCost: 150,
      marketingBudget: template.marketingDefaults?.promotionalBudget || 500,
      expectedStreams: 10000,
      expectedClubPlays: 50,
      expectedRadioPlays: 5,
      viralChance: 0.05,
      longTermCatalogValue: 50,
      culturalImpactRating: 50,
      undergroundCredibility: 60,
      mainstreamPotential: 40
    },
    marketing: {
      leadSingle: false,
      promotionalBudget: template.marketingDefaults?.promotionalBudget || 500,
      marketingChannels: [],
      targetAudience: template.marketingDefaults?.targetAudience || "underground",
      regions: ["global"],
      djPromoList: [],
      influencerList: [],
      playlistPitches: [],
      priorityLevel: template.marketingDefaults?.priorityLevel || "medium",
      pressQuotes: [],
      featuredInCurators: []
    },
    formats: {
      digital: true,
      vinyl: false,
      cd: false,
      cassette: false,
      promo: false,
      djPoolIncluded: false,
      exclusiveContent: false
    },
    createdAt: now,
    updatedAt: now,
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
}

export function createEmptyTrack(title: string = "Untitled Track"): ReleaseTrack {
  return {
    id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    metadata: {
      title,
      duration: 420, // 7 minutes default
      bpm: 128,
      key: "8A",
      keyStandard: "Cm",
      genre: ["Techno"],
      subgenre: [],
      energy: 5,
      mood: ["dark"],
      loudness: -8,
      masteringLevel: "draft"
    },
    commercial: {
      dancefloorRating: 5,
      experimentalScore: 5,
      commercialAppeal: 5,
      streamingOptimization: 5,
      viralPotential: 5
    },
    dj: {
      usabilityScore: 5,
      introSuitability: "good",
      outroSuitability: "good",
      introLength: 32,
      outroLength: 32,
      beatgridAccuracy: 95,
      phraseStructure: "64_bar",
      hasBreakdown: false,
      breakdownTimestamps: [],
      dropIntensity: 7,
      harmonicCompatible: true,
      harmonicTags: [],
      keyChange: false,
      acapellaAvailable: false,
      stemsAvailable: false
    },
    artistic: {
      soundDesignComplexity: 5,
      instrumentation: ["synth"],
      signatureElements: [],
      emotionalTone: ["mysterious"],
      narrativeTheme: undefined,
      productionStyle: ["modern"]
    },
    version: "original",
    collaborationCredits: [],
    ghostProduction: false,
    customTags: []
  };
}

export function generateCatalogNumber(label: LabelCatalog): string {
  const padded = String(label.currentNumber).padStart(3, "0");
  return `${label.catalogPrefix}-${padded}`;
}