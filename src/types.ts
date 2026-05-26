/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum MusicGenre {
  TECHNO = "Techno",
  TRANCE = "Trance",
  HOUSE = "House",
  DRUM_AND_BASS = "Drum & Bass",
  DUBSTEP = "Dubstep",
  SYNTHWAVE = "Synthwave",
  INDUSTRIAL = "Industrial",
  AMBIENT = "Ambient",
  HARDSTYLE = "Hardstyle",
  EXPERIMENTAL = "Experimental",
  CHIPTUNE = "Chiptune",
  DOWNTEMPO = "Downtempo",
  FUTURE_BASS = "Future Bass",
  UK_GARAGE = "UK Garage",
  DEEP_HOUSE = "Deep House",
  PSYTRANCE = "Psytrance"
}

export interface TrackStats {
  bpm: number;
  energy: number;          // 0-100
  groove: number;          // 0-100
  soundDesign: number;      // 0-100 (gear dependent)
  mixingQuality: number;    // 0-100 (skill dependent)
  originality: number;     // 0-100 (experimentation dependent)
  catchiness: number;      // 0-100
  emotionalTone: number;   // 0-100 (0=dark/cold, 100=uplifting/warm)
  danceability: number;    // 0-100
  complexity: number;      // 0-100
  experimentalFactor: number; // 0-100
}

export interface Track {
  id: string;
  title: string;
  primaryGenre: MusicGenre;
  secondaryGenre: MusicGenre | null;
  stats: TrackStats;
  composedAt: string; // Game date
  stems: {
    beat: string;
    bass: string;
    synth: string;
    fx: string;
    vocal: string;
  };
  artworkUrl?: string;
  ideasSpent: number;
}

export interface ReleasedTrack extends Track {
  releaseId: string;
  releaseDate: string;
  labelId: string | null; // null = self-released (independent)
  playCount: number;
  totalRoyaltiesEarned: number;
  hypeBoost: number;
  reviews: string[];
  socialBuzz: string[];
}

export interface RecordLabel {
  id: string;
  name: string;
  description: string;
  prestige: number; // 1-100
  preferredGenres: MusicGenre[];
  royaltySplit: number; // e.g. 0.5 means 50/50
  signingAdvance: number;
  requirements: {
    minFans: number;
    minHype: number;
    genreMatch: boolean;
  };
  dealLength: number; // in tracks
}

export interface GearItem {
  id: string;
  name: string;
  category: "laptop" | "daw" | "headphones" | "synth" | "drum_machine" | "acoustic" | "utility";
  cost: number;
  statBonus: {
    soundDesign?: number;
    mixing?: number;
    catchiness?: number;
    inspiration?: number;
  };
  description: string;
  owned: boolean;
  unlockedAtPrestige: number;
}

export interface CharacterSkill {
  id: string;
  name: string;
  description: string;
  level: number; // 1-5
  maxLevel: number;
  cost: number; // Skill points or money
  category: "production" | "engineering" | "performance" | "marketing";
}

export interface VirtualArtist {
  id: string;
  name: string;
  primaryGenre: MusicGenre;
  ego: number; // 1-100
  fame: number; // 1-100
  relationship: number; // -100 to 100
  status: "rival" | "mentor" | "friend" | "colleague" | "neutral";
  bio: string;
  gender: "male" | "female" | "non-binary";
  pronouns: string;
}

export interface TourStop {
  cityId: string;
  venueName: string;
  capacity: number;
  ticketPrice: number;
  showDate: string;
  completed: boolean;
  performerHype: number; // Hype of the tour stop
  incomeEarned: number;
}

export interface MusicTrend {
  id: string;
  name: string;
  description: string;
  hotGenre: MusicGenre;
  decayingGenre: MusicGenre;
  hypeMultiplier: number;
  durationMonths: number;
  source: string; // e.g. "TikTok Viral", "Berlin Warehouse Scene"
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  vibe: string;
  costToTravel: number;
  genrePopularityBoosts: { [key in MusicGenre]?: number }; // Percentage boosts
  gigsUnlocked: boolean;
  prestigeNeeded: number;
  description: string;
  venues: {
    name: string;
    capacity: number;
    payout: number;
    ticketPrice: number;
    relevance: number; // prestige requirement
    tier: "underground" | "club" | "superclub" | "festival";
  }[];
}

export interface EventLog {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "system" | "release" | "gig" | "burnout" | "scandal" | "label";
}

export interface GameState {
  artistName: string;
  pseudonym: string;
  avatarSeed: string;
  gameDate: {
    year: number;
    month: number;
    week: number;
  };
  stats: {
    fans: number;
    hype: number;          // 0-100 (decaying)
    prestige: number;      // 0-100 (overall career level)
    money: number;
    inspiration: number;   // 0-100
    burnout: number;       // 0-100
    skillPoints: number;
  };
  skills: { [key: string]: number }; // Skill ID -> Skill level
  gear: string[]; // Owned GearItem IDs
  tracks: Track[]; // Composed tracks not yet released
  releases: ReleasedTrack[]; // Tracks released
  signedLabelId: string | null;
  tracksDueToLabel: number;
  currentTrend: MusicTrend;
  log: EventLog[];
  currentCityId: string;
  completedGigsCount: number;
  allTimeEarnings: number;
}
