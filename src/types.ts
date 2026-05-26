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
  PSYTRANCE = "Psytrance",
  // New genres from Genres.json
  PROGRESSIVE_TRANCE = "Progressive Trance",
  MELODIC_TRANCE = "Melodic Trance",
  TECH_TRANCE = "Tech Trance",
  UPLIFTING_TRANCE = "Uplifting Trance",
  HARD_HOUSE = "Hard House",
  HARDCORE = "Hardcore",
  GABBER = "Gabber",
  NUSTYLE_HARDCORE = "Nustyle Hardcore",
  SPEEDCORE = "Speedcore",
  METALCORE = "Metalcore",
  TERRORCORE = "Terrorcore",
  NOISECORE = "Noisecore",
  FRENCHCORE = "Frenchcore",
  JUMPSTYLE = "Jumpstyle",
  HANDS_UP = "Hands Up",
  CLUB_TRANCE = "Club Trance",
  DARK_PSY = "Dark psy",
  FULL_ON = "Full On",
  GOA_TRANCE = "Goa Trance",
  PROGRESSIVE_PSYTRANCE = "Progressive Psytrance",
  BIG_BEAT = "Big Beat",
  NU_SKOOL_BREAKS = "Nu skool breaks",
  RAGGACORE = "Raggacore",
  CHEMICAL_BREAKS = "Chemical breaks",
  PROGRESSIVE_BREAKS = "Progressive breaks",
  ACID_HOUSE = "Acid House",
  ACID_TRANCE = "Acid Trance",
  SUOMISAUNDI = "Suomisaundi",
  DETROIT_TECHNO = "Detroit Techno",
  MINIMAL_TECHNO = "Minimal Techno",
  SCHRANZ = "Schranz",
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

// Simulated AI Artist Release
export interface AIRelease {
  id: string;
  artistName: string;
  artistId: string;
  genre: MusicGenre;
  trackTitle: string;
  releaseDate: string; // Game date
  labelName: string | null;
  labelId: string | null;
  format: ReleaseFormat;
  playCount: number;
  quality: number; // 0-100 quality score
  isViral: boolean;
  hypeGenerated: number;
  source: "ai_release" | "viral" | "collaboration";
}

// Release format types
export type ReleaseFormat = "Vinyl EP" | "CD Single" | "CD Maxi" | "Digital EP" | "Web Album" | "Vinyl LP" | "Cassette";

// Simulated AI News Post
export interface AINewsPost {
  id: string;
  date: string; // Game date
  headline: string;
  body: string;
  category: "release" | "gossip" | "trend" | "festival" | "scandal" | "collab";
  relatedArtists: string[];
  relatedLabels: string[];
  relatedGenres: MusicGenre[];
  hypeImpact: number; // Positive or negative
}

// Simulated Label Activity
export interface LabelActivity {
  id: string;
  labelId: string;
  labelName: string;
  date: string;
  type: "signing" | "release" | "tour" | "closure" | "award";
  description: string;
  artistName?: string;
  trackTitle?: string;
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
  
  // AI Simulation data
  aiReleases: AIRelease[];      // Simulated releases from other artists
  aiNews: AINewsPost[];        // Simulated news posts
  labelActivities: LabelActivity[]; // Simulated label activities
  
  // Virtual artists (AI competitors/rivals)
  virtualArtists: VirtualArtist[];
}

// Types imported from JSON data files
export interface SubgenreData {
  "@name": string;
  BPM?: {
    min: string;
    max: string;
  };
  Length?: {
    min: string;
    max: string;
  };
  Popularity?: {
    "@modifier": string;
    "#text": string;
  };
  GenreAttributes?: {
    Attrib: string | string[];
  };
}

export interface GenreData {
  "@name": string;
  Subgenre: SubgenreData | SubgenreData[];
}

export interface GenresDatabase {
  Genrelist: {
    Genre: GenreData[];
  };
}

export interface MsgData {
  "@id": string;
  RandomMsg?: string | string[];
}

export interface ReleaseNoteMessages {
  MsgData: MsgData[];
}

export interface SceneGroup {
  ReleaseCommentMessages: string;
  ReleaseNoteMessages: ReleaseNoteMessages;
  NFOSettings?: {
    WordWrapWidth: string;
    MaxTitleLength: string;
  };
  "@name"?: string;
  "@prefix"?: string;
  "@country"?: string;
  "@founded"?: string;
}

export interface SceneGroupsDatabase {
  ReleaseGroupDB: {
    SceneGroup: SceneGroup[];
  };
}

export interface SubGenreDB {
  "@min_bpm": string;
  "@bpm_random_mod": string;
  "@override_length": string;
  "@length_base_override": string;
  "@length_mod_override": string;
  "@font": string;
  "#text": string;
}

export interface GenreDB {
  "@displayname": string;
  "@LengthBase": string;
  "@RandomModifier": string;
  "@descriptivename": string;
  "@nonremix_append_string": string;
  SubGenres: {
    SubGenre: SubGenreDB | SubGenreDB[];
  };
  RecordInfoText?: {
    VA_Entries?: {
      Text: string;
    };
    SingleRel_Entries: string;
  };
  CompilationNames?: {
    NameGroup: NameGroup[];
  };
}

export interface NameGroup {
  "@FixSubGenre": string;
  "@FixedSubGenreIndex": string;
  "@MinimumYear": string;
  "@MaximumYear": string;
  "@flags": string;
  "@MinimumCDCount": string;
  "@MaximumCDCount": string;
  "name": {
    "@volumeprefix": string;
    "@counttype": string;
    "#text": string;
  };
  RandomReleaseCount: {
    "@min": string;
    "@max": string;
  };
  RecordLabels?: {
    label_name: labelName[];
  };
}

export interface labelName {
  "@rel_id_template": string;
  "#text": string;
}

export interface TrackVersion {
  "@TrackNum": string;
  "@lengthmin": string;
  "@lengthmod": string;
  "@RandomTrackname": string;
  "type": string | string[];
}

export interface ReleaseType {
  "@name": string;
  "@displayname": string;
  "@sourceTag": string;
  "@TotalMaxLength": string;
  "@AllowRandomArtists": string;
  "@TrackFormatting": string;
  "@Remixes": string;
  TrackVersion?: TrackVersion[];
}

export interface SongGeneratorDatabase {
  SongDataBase: {
    Genre: GenreDB[];
    ReleaseTypes?: {
      ReleaseType: ReleaseType[];
    };
  };
}

// Song names database interface
export interface SongNamesDatabase {
  SongNames: {
    SongNameGroup: SongNameGroup[];
  };
}

export interface SongNameGroup {
  "@genre": string;
  name: string[];
}

// Record Labels database interface
export interface PredefRecordLabels {
  RecordLabel: RecordLabelData[];
}

export interface RecordLabelData {
  Name: string;
  FoundedYear: string;
  LabelManagers?: {
    Person: string | string[];
  };
  Releasecodes?: {
    Vinyl?: string;
    CD?: string;
    Digital?: string;
  };
  Contact?: string;
  ParentLabel?: string;
  ReleaseSettings?: {
    "@cd"?: string;
    "@vinyl"?: string;
    "@digital"?: string;
  };
  LabelStaff?: {
    StaffMember: Array<{
      "@job": string;
      "@email": string;
    }>;
  };
  WebsiteData?: object;
  LabelActive: string;
  LabelDefunctDate?: string;
  LabelDefunctAnnouncement?: string;
  LabelDescription?: string;
  SubLabels?: string;
  Staffsize?: string;
  LogoImage?: string;
  ReleasesMainGenre: string;
  ReleasesFixSubGenre: string;
  ReleasesSubGenre?: string;
  SignedArtists?: {
    Contract: Array<{
      "@sign_status_artist": string;
      "@sign_status_label": string;
      "@releaseroyalty_artist": string;
      "@releaseroyalty_label": string;
      "@advanceminimum": string;
      "@advancemaximum": string;
      "@livecut_artist": string;
      "@livecut_label": string;
      "@signed_since": string;
      "@contract_expire": string;
      "@release_singles": string;
      "@release_albums": string;
      "#text": string;
    }>;
  };
}

export interface RecordLabelsDatabase {
  PredefRecordLabels: PredefRecordLabels;
}

// Artist Pool database interface
export interface PreDefinedArtists {
  Band: BandData[];
}

export interface BandData {
  Name: string;
  BandStartYear: string;
  BandBiographyText?: string;
  BandMainGenre: string;
  BandFixedSubGenre: string;
  BandSubGenre?: string;
  Alt_Aliases?: {
    Alias: string | string[];
  };
  SoloProject: string;
  PredefDiscoGraphy?: object | object[];
  Members?: {
    Artist: ArtistMemberData | ArtistMemberData[];
  };
  IsPlayerBand?: string;
  UseCustomNames?: string;
  SongNameGeneratorID?: string;
  VocalistOnlyFlag?: string;
  PreferAliases?: string;
  AIScript?: string;
  RemixTitleGeneratorID?: string;
  BandWebsite?: string;
  BandFame?: string;
  Cash?: string;
  GearList?: {
    Hardware?: object;
    SoundLibs?: object;
    Software?: object;
  };
}

export interface ArtistMemberData {
  Name?: string;
  Gender?: string;
  BirthYear?: string;
  RealName?: string;
  DJName?: string;
  PrimaryVocalStyle?: string;
}

export interface ArtistPoolDatabase {
  PreDefinedArtists: PreDefinedArtists;
}
