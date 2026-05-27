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
  
  // Track length settings
  lengthCategory: 'radio_edit' | 'club_edit' | 'extended' | 'long_play' | 'megamix';
  durationSeconds: number; // Actual duration in seconds
  
  // Version info for releases
  versionName?: string; // e.g., "Radio Edit", "Extended Mix", "Club Mix"
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
  category: 
    | "laptop" | "computer" | "daw" | "monitoring" | "synth" 
    | "drum_machine" | "acoustic" | "utility" | "midi" 
    | "microphone" | "mixing" | "effects" | "dj" 
    | "collaboration" | "education" | "field_recording" 
    | "studio_furniture" | "brand" | "service";
  cost: number;
  statBonus: {
    // Core production stats
    soundDesign?: number;
    mixing?: number;
    catchiness?: number;
    inspiration?: number;
    energy?: number;
    groove?: number;
    originality?: number;
    
    // Performance & DJ
    djUsability?: number;
    hypeGeneration?: number;
    gigQuality?: number;
    gigPayBonus?: number;
    
    // Career & business
    labelSigningBonus?: number;
    streamPerformance?: number;
    viralPotential?: number;
    fanSatisfaction?: number;
    
    // Quality of life
    burnoutReduction?: number;
    mixPrecision?: number;
    recordingQuality?: number;
    loadingSpeed?: number;
    fieldRecording?: number;
  };
  description: string;
  owned: boolean;
  unlockedAtPrestige: number;
  tier?: "starter" | "basic" | "utility" | "advanced" | "custom" | "legendary";
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

export interface PurchasedTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  subgenre?: string;
  bpm: number;
  key: string;
  energy: number;
  mood: string;
  popularity: number;
  credBonus: number;
  price: number;
  purchaseDate: string;
  isVinyl?: boolean;
  condition?: string;
  releaseYear?: number;
  coverUrl?: string;
}

export interface GameState {
  artistName: string;
  pseudonym: string;
  avatarSeed: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare'; // Difficulty level setting
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
  purchasedMusic: PurchasedTrack[]; // Tracks bought for DJ mixing
  signedLabelId: string | null;
  playerLabelId: string | null;    // If player owns their own label
  playerLabelName: string | null;  // Name of player's label
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
  
  // === NEW EXPANDED SYSTEMS ===
  
  // Artist Identity
  artistIdentity: ArtistIdentity;
  
  // DJ System
  djCrates: DJCrate[];
  djSets: DJSet[];
  stageProduction: StageProduction[];
  
  // Social System
  socialNetwork: SocialNetwork;
  gossipEvents: GossipEvent[];
  
  // Mental Health
  mentalState: MentalState;
  activeProductionEvents: ProductionEvent[];
  
  // Fan Communities
  fanCommunities: FanCommunity[];
  forumThreads: ForumThread[];
  musicReviews: MusicJournalReview[];
  
  // Label Contracts
  labelContracts: LabelContract[];
  labelPolitics: LabelPolitics[];
  
  // Economy
  financialObligations: FinancialObligation[];
  careerProgression: CareerProgression;
  
  // Scene Simulation
  regionalScenes: RegionalScene[];
  viralMoments: ViralMoment[];
  
  // NPC Simulation
  npcs: NPC[];
  nextNpcInteractionTick: number;
  
  // Event System
  worldEvents: WorldEvent[];
  sceneTick: number;
  
  // Web Ecosystem
  webEcosystem: WESState;
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

// ============================================
// ARTIST IDENTITY SYSTEM
// ============================================

export type StagePersona = "masked" | "visionary" | "hermit" | "chaotic" | "professional" | "underground" | "commercial" | "cult_leader";

export type VisualAesthetic = "dark_industrial" | "neon_cyberpunk" | "retro_outrun" | "minimalist" | "psychedelic" | "glitch_core" | "ethereal" | "street_urban" | "vaporwave" | "abstract";

export type FashionStyle = "streetwear" | "goth" | "cyberpunk" | "raver" | "minimal" | "vintage" | "athleisure" | "avant_garde";

export type SocialPersonality = "mysterious" | "outspoken" | "pretentious" | "humble" | "chaotic" | "professional" | "fan_friendly" | "reclusive" | "controversial";

export interface ArtistIdentity {
  pseudonym: string;
  stagePersona: StagePersona;
  visualAesthetic: VisualAesthetic;
  fashionStyle: FashionStyle;
  socialPersonality: SocialPersonality;
  aliases: string[];
  logoUrl?: string;
  bio: string;
  lore: string;
  visualTheme?: string;
  brandingConsistency: number; // 0-100
  fanNickname?: string;
  catchphrase?: string;
}

// ============================================
// DJ SYSTEM
// ============================================

export type DJSlot = "opener" | "support" | "headliner" | "closing" | "afterparty" | "b2b";
export type SetType = "club_set" | "festival_set" | "radio_set" | "boiler_room" | "livestream" | "pirate_radio" | "warehouse_rave";
export type TransitionType = "smooth_blend" | "sudden_cut" | "echo_out" | "loop_roll" | "filter_sweep" | "key_sync" | "beatmatch" | "harmonic_mix";

export interface DJCrate {
  id: string;
  name: string;
  genre: MusicGenre;
  tracks: string[]; // Track IDs
  lastModified: string;
  energyRange: { min: number; max: number };
  bpmRange: { min: number; max: number };
  moodTags: string[];
}

export interface DJSet {
  id: string;
  name: string;
  slot: DJSlot;
  setType: SetType;
  venueId: string;
  date: string;
  duration: number; // minutes
  plannedTracks: string[]; // Ordered track IDs
  actualTracks: string[];
  transitions: TransitionType[];
  crowdEnergy: number[]; // Per-track crowd energy readings
  mistakes: number;
  technicalIssues: string[];
  encore: boolean;
  exclusiveDubsUsed: number;
  isB2B: boolean;
  b2bPartner?: string;
  completed: boolean;
  performance: DJPerformanceResult;
}

export interface DJPerformanceStats {
  crowdControl: number; // 0-100
  technicalPrecision: number; // 0-100
  energyPacing: number; // 0-100
  transitionSmoothness: number; // 0-100
  stageCharisma: number; // 0-100
  improvisation: number; // 0-100
  riskTaking: number; // 0-100
  genreMatching: number; // 0-100
}

export interface DJPerformanceResult {
  overallScore: number; // 0-100
  stats: DJPerformanceStats;
  crowdPeakEnergy: number; // 0-100
  crowdSatisfaction: number; // 0-100
  fanChange: number;
  hypeChange: number;
  prestigeChange: number;
  moneyEarned: number;
  encoreAchieved: boolean;
  mistakes: number;
  equipmentFailures: string[];
}

export interface StageProduction {
  id: string;
  name: string;
  cost: number;
  category: "lighting" | "visuals" | "laser" | "fog" | "pyro" | "screen" | "sound";
  crowdEnergyBonus: number;
  prestigeBonus: number;
  maintenanceCost: number;
  description: string;
  owned: boolean;
}

// ============================================
// SOCIAL & RELATIONSHIP SYSTEM
// ============================================

export type RelationshipStatus = "friend" | "rival" | "mentor" | "collaborator" | "neutral" | "enemy" | "romantic" | "fan";
export type GossipType = "positive" | "negative" | "rumor" | "scandal" | "achievement";

export interface NPCRelationship {
  npcId: string;
  npcName: string;
  role: NPCRole;
  relationship: number; // -100 to 100
  status: RelationshipStatus;
  collaborations: number;
  favorCount: number;
  lastInteraction: string;
  trustLevel: number; // 0-100
  mutualConnections: string[]; // other NPC IDs
  gossipSpread: GossipEvent[];
}

export interface GossipEvent {
  id: string;
  date: string;
  type: GossipType;
  content: string;
  sourceId: string;
  targets: string[];
  impact: number; // -50 to 50
  spreadRadius: number; // 1-10
}

export interface SocialNetwork {
  id: string;
  name: string;
  network: NPCRelationship[];
  reputationScore: number; // -100 to 100
  controversialScore: number; // 0-100
  connectionsCount: number;
  collaboratorsCount: number;
  rivalsCount: number;
  mentorCount: number;
}

// ============================================
// MENTAL HEALTH & BURNOUT EXPANSION
// ============================================

export type CreativeState = "flow" | "blocked" | "breakthrough" | "stagnant" | "inspired" | "burnt_out";
export type AddictionRisk = "none" | "low" | "moderate" | "high" | "addicted";
export type RecoveryMethod = "vacation" | "therapy" | "studio_retreat" | "nature" | "collaboration" | "genre_switch" | "exercise" | "meditation";

export interface MentalState {
  creativeBlock: number; // 0-100
  exhaustion: number; // 0-100
  overexposure: number; // 0-100
  stress: number; // 0-100
  anxiety: number; // 0-100
  confidence: number; // 0-100
  ego: number; // 0-100
  addictionRisk: AddictionRisk;
  isolation: number; // 0-100
  creativeState: CreativeState;
  recoveryProgress: number; // 0-100
  activeRecoveryMethod: RecoveryMethod | null;
  blockDuration: number; // weeks
  breakthroughs: number;
}

export interface ProductionEvent {
  id: string;
  name: string;
  description: string;
  type: "corruption" | "breakthrough" | "crash" | "hardware_failure" | "accidental_masterpiece" | "stolen_presets" | "sample_clearance" | "inspiration_strike";
  statEffects: Partial<TrackStats>;
  duration: "instant" | "session" | "week" | "month";
  probability: number; // 0-1
  icon: string;
  message: string;
}

// ============================================
// FAN & COMMUNITY SIMULATION
// ============================================

export type FanTier = "casual" | "regular" | "dedicated" | "superfan" | "cult";
export type CommunityPlatform = "forum" | "subreddit" | "discord" | "facebook_group" | "bandcamp" | "patreon";

export interface FanCommunity {
  id: string;
  name: string;
  platform: CommunityPlatform;
  memberCount: number;
  averageSentiment: number; // -100 to 100
  activityLevel: number; // 0-100
  formedDate: string;
  dedicatedSuperfans: number;
  recentTopics: ForumThread[];
  controversies: number;
  cultStatus: boolean;
}

export interface ForumThread {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  replies: number;
  likes: number;
  sentiment: number; // -100 to 100
  category: "discussion" | "review" | "drama" | "praise" | "criticism" | "meme";
  pinned: boolean;
}

export interface FanReaction {
  id: string;
  date: string;
  fanTier: FanTier;
  content: string;
  sentiment: number;
  influence: number; // 0-100
  platform: CommunityPlatform;
}

export interface MusicJournalReview {
  id: string;
  publication: string;
  author: string;
  date: string;
  trackId: string;
  score: number; // 0-100
  content: string;
  influence: number; // 0-100
  publicationType: "blog" | "magazine" | "youtube" | "radio" | "podcast" | "newsletter";
}

// ============================================
// LABEL SYSTEM EXPANSION
// ============================================

export interface LabelContract {
  id: string;
  labelId: string;
  labelName: string;
  signedDate: string;
  expiryDate: string;
  tracksCommitted: number;
  tracksDelivered: number;
  exclusivity: "exclusive" | "non_exclusive" | "single_release";
  royaltySplit: number;
  advanceTotal: number;
  advancePaid: number;
  marketingBudget: number;
  remixObligations: number;
  remixObligationsMet: number;
  terminationClause: string;
  renewalOption: boolean;
  labelFavorability: number; // 0-100
}

export interface LabelPolitics {
  id: string;
  labelId: string;
  internalFactions: string[];
  rosterFavoritism: number[]; // Favoritism score for each signed artist
  shelvedProjects: number;
  currentDrama: string | null;
  staffTurnover: number;
  financialHealth: number; // 0-100
  marketPosition: "rising" | "stable" | "declining" | "reviving";
}

// ============================================
// ECONOMY & PROGRESSION
// ============================================

export type CareerPath = "underground_legend" | "commercial_superstar" | "ghost_producer" | "experimental_icon" | "touring_dj" | "producer_for_hire" | "label_mogul" | "versatile_artist";

export interface FinancialObligation {
  id: string;
  type: "rent" | "equipment_maintenance" | "studio_rental" | "assistant_salary" | "manager_cut" | "tour_bus" | "merchandise_production" | "marketing_campaign";
  amount: number;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly" | "one_time";
  nextDue: string;
  description: string;
}

export interface RevenueStream {
  id: string;
  type: "streaming" | "royalties" | "gig_payments" | "merchandise" | "sponsorship" | "patreon" | "sync_licensing" | "teaching" | "producer_for_hire" | "label_revenue";
  amount: number;
  stability: number; // 0-100
  description: string;
}

export interface CareerProgression {
  currentPath: CareerPath;
  pathProgress: number; // 0-100 toward path mastery
  pathMilestones: string[];
  secondaryPaths: CareerPath[];
  allTimeRevenue: number;
  biggestHit: string;
  careerHighlights: string[];
  careerRegrets: string[];
  influenceScore: number; // 0-100
  legacyScore: number; // 0-100
}

// ============================================
// SCENE & WORLD SIMULATION
// ============================================

export interface RegionalScene {
  cityId: string;
  cityName: string;
  dominantGenre: MusicGenre;
  sceneHealth: number; // 0-100
  undergroundActivity: number; // 0-100
  commercialPresence: number; // 0-100
  rivalriesWith: string[]; // Other city IDs
  notableVenues: string[];
  recentTrends: string[];
  communitySize: number;
}

export interface ViralMoment {
  id: string;
  date: string;
  trigger: string;
  genre: MusicGenre;
  reach: number; // 0-100
  duration: number; // weeks
  impact: {
    fameChange: number;
    hypeChange: number;
    fanChange: number;
    moneyChange: number;
  };
  source: string;
  description: string;
}

// ============================================
// PRODUCTION EVENTS SYSTEM
// ============================================

export const PRODUCTION_EVENTS: ProductionEvent[] = [
  {
    id: "corrupted_project",
    name: "Corrupted Project File",
    description: "Your DAW crashed and the project file is corrupted. You lose progress but the recovery process teaches you new techniques.",
    type: "corruption",
    statEffects: { soundDesign: 5, mixingQuality: -10 },
    duration: "session",
    probability: 0.05,
    icon: "💾",
    message: "Project file corrupted! Auto-recovery salvaged partial work..."
  },
  {
    id: "creative_breakthrough",
    name: "Creative Breakthrough",
    description: "Everything clicks. The mix falls into place and you discover a new sound signature.",
    type: "breakthrough",
    statEffects: { originality: 20, soundDesign: 15, catchiness: 10 },
    duration: "session",
    probability: 0.08,
    icon: "💡",
    message: "EUREKA! The perfect bass patch just appeared from a happy accident!"
  },
  {
    id: "plugin_crash",
    name: "Plugin Meltdown",
    description: "A resource-heavy synth plugin crashes your DAW, losing unsaved changes.",
    type: "crash",
    statEffects: { energy: -15, experimentalFactor: 10 },
    duration: "instant",
    probability: 0.1,
    icon: "💥",
    message: "Plugin crashed! Remember to save often..."
  },
  {
    id: "hardware_failure",
    name: "Hardware Glitch",
    description: "Your audio interface produces a strange distortion that actually sounds incredible.",
    type: "hardware_failure",
    statEffects: { soundDesign: 10, mixingQuality: -5 },
    duration: "session",
    probability: 0.04,
    icon: "🔧",
    message: "Your interface is crackling... wait, that sounds amazing through a filter!"
  },
  {
    id: "accidental_masterpiece",
    name: "Accidental Masterpiece",
    description: "You hit a wrong key combination and create something unexpectedly brilliant.",
    type: "accidental_masterpiece",
    statEffects: { originality: 25, catchiness: 20, experimentalFactor: 15 },
    duration: "session",
    probability: 0.03,
    icon: "🎯",
    message: "What was that? You have no idea how you made that sound but it's incredible!"
  },
  {
    id: "sample_clearance",
    name: "Sample Clearance Issue",
    description: "A sample you used triggers content ID. You need to recreate it from scratch, improving your skills.",
    type: "sample_clearance",
    statEffects: { soundDesign: 8, originality: 5, mixingQuality: -5 },
    duration: "week",
    probability: 0.06,
    icon: "⚠️",
    message: "Sample flagged by content ID! Time to hit the synthesizers..."
  },
  {
    id: "inspiration_strike",
    name: "Midnight Inspiration",
    description: "You wake up at 3AM with a complete track arrangement in your head.",
    type: "inspiration_strike",
    statEffects: { energy: 15, groove: 10, catchiness: 15 },
    duration: "instant",
    probability: 0.07,
    icon: "🌙",
    message: "3AM inspiration strike! That melody won't leave your head until you record it!"
  }
];

// ============================================
// DJ CRATE - Predefined song pool
// ============================================

export const DJ_CRATE_TEMPLATES = {
  techno: {
    name: "Techno Warehouse Tools",
    energyRange: { min: 60, max: 95 },
    bpmRange: { min: 130, max: 145 },
    moodTags: ["dark", "driving", "hypnotic", "industrial", "warehouse"]
  },
  house: {
    name: "House Groove Selection",
    energyRange: { min: 40, max: 80 },
    bpmRange: { min: 118, max: 128 },
    moodTags: ["groovy", "soulful", "sunny", "funky", "deep"]
  },
  drum_and_bass: {
    name: "DnB Liquid Rollers",
    energyRange: { min: 70, max: 100 },
    bpmRange: { min: 168, max: 180 },
    moodTags: ["energetic", "liquid", "dark", "rollers", "jungle"]
  }
};

// ============================================
// STAGE PRODUCTION UPGRADES
// ============================================

export const STAGE_PRODUCTIONS: StageProduction[] = [
  {
    id: "basic_lighting",
    name: "Basic Strobe Setup",
    cost: 500,
    category: "lighting",
    crowdEnergyBonus: 5,
    prestigeBonus: 2,
    maintenanceCost: 50,
    description: "Simple strobe and color wash lights for small club gigs.",
    owned: false
  },
  {
    id: "led_wall",
    name: "LED Visual Wall",
    cost: 3000,
    category: "screen",
    crowdEnergyBonus: 12,
    prestigeBonus: 8,
    maintenanceCost: 200,
    description: "Programmable LED wall for reactive visuals and VJ content.",
    owned: false
  },
  {
    id: "laser_system",
    name: "RGB Laser Array",
    cost: 5000,
    category: "laser",
    crowdEnergyBonus: 18,
    prestigeBonus: 15,
    maintenanceCost: 300,
    description: "Professional RGB laser system with DMX control.",
    owned: false
  }
];

// ============================================
// FAN FEEDBACK TEMPLATES
// ============================================

export const FAN_REACTION_TEMPLATES = {
  praise: [
    "This track is absolutely fire! 🔥 Been on repeat all week.",
    "The sound design on this is next level. Pure class.",
    "Finally someone pushing the genre forward. Respect.",
    "This mix is cleaner than my local club's system!",
    "You're the reason I got into producing. Thank you."
  ],
  criticism: [
    "The mix feels a bit muddy in the low end.",
    "Not your best work. Feels a bit rushed.",
    "The drop lacks energy. Needs more impact.",
    "Pretty generic for the genre. Try something new.",
    "Mastering is too loud. Where's the dynamics?"
  ],
  controversy: [
    "This is a total sellout move. Disappointed.",
    "You've changed man. Where's the old sound?",
    "Selling out to the mainstream I see...",
    "This isn't the artist I used to follow."
  ]
};

// ============================================
// MUSIC JOURNAL PUBLICATIONS
// ============================================

export const MUSIC_JOURNALS = [
  { name: "Resident Advisor", type: "magazine" as const, influence: 90, style: "critic" },
  { name: "Mixmag", type: "magazine" as const, influence: 85, style: "popular" },
  { name: "DJ Mag", type: "magazine" as const, influence: 80, style: "commercial" },
  { name: "Underground Frequencies", type: "blog" as const, influence: 50, style: "underground" },
  { name: "Synth Depot", type: "blog" as const, influence: 40, style: "technical" },
  { name: "Low End Theory", type: "newsletter" as const, influence: 45, style: "analytical" },
  { name: "The Ransom Note", type: "blog" as const, influence: 55, style: "underground" },
  { name: "Attack Magazine", type: "blog" as const, influence: 60, style: "technical" },
  { name: "Electronic Beats", type: "magazine" as const, influence: 70, style: "popular" },
  { name: "XLR8R", type: "blog" as const, influence: 65, style: "underground" },
  { name: "Tiny Mix Tapes", type: "blog" as const, influence: 35, style: "experimental" },
  { name: "Pitchfork", type: "magazine" as const, influence: 75, style: "critical" }
];

// ============================================
// NPC ENTITY SYSTEM — Expanded Simulation
// ============================================

export type NPCRole = "producer" | "dj" | "label_exec" | "promoter" | "journalist" | "vocalist" | "label_owner" | "influencer" | "manager" | "mastering_engineer" | "venue_owner" | "fan";
export type NPCArchetype = "techno_purist" | "experimental" | "commercial" | "underground_legend" | "rising_star" | "mentor" | "rival" | "scene_elder" | "industry_shark" | "bedroom_producer";

export interface NPCPersonality {
  openness: number;       // willingness to collaborate/experiment
  ego: number;            // arrogance / status sensitivity
  creativity: number;     // experimental tendency
  commercialism: number;  // mainstream bias
  emotionality: number;   // intensity of reactions
  sociability: number;    // interaction frequency
}

export interface NPCReputation {
  underground: number;
  mainstream: number;
  technicalSkill: number;
  influence: number;
}

export interface NPCMood {
  energy: number;
  burnout: number;
  inspiration: number;
  currentEmotion: "neutral" | "excited" | "angry" | "burnt_out" | "inspired";
}

export interface NPCGoal {
  id: string;
  type: "release" | "collaboration" | "feud" | "prestige" | "money" | "mentor" | "tour";
  target?: string;
  urgency: number;
  progress: number;
  active: boolean;
}

export interface MemoryEvent {
  id: string;
  type: "conversation" | "collaboration" | "conflict" | "release_reaction" | "gig_encounter" | "rumor";
  timestamp: number;
  participants: string[];
  context: {
    location?: string;
    genre?: string;
    mood?: string;
  };
  impact: {
    relationshipDelta: number;
    reputationDelta: number;
  };
  narrativeSummary?: string;
}

export interface MemorySummary {
  topic: string;
  importance: number;
  summary: string;
  relatedNpcs: string[];
  weightDecay: number;
}

export interface NPCMemory {
  events: MemoryEvent[];
  summaries: MemorySummary[];
}

export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  archetype: NPCArchetype;
  genreAffinities: Record<string, number>;
  personality: NPCPersonality;
  reputation: NPCReputation;
  mood: NPCMood;
  relationships: Record<string, NPCRelationshipData>;
  memory: NPCMemory;
  goals: NPCGoal[];
  flags: string[];
  location?: string;
  avatarSeed: string;
  bio: string;
}

export interface NPCRelationshipData {
  affinity: number;
  trust: number;
  historyWeight: number;
  lastInteraction: number;
}

// ============================================
// DIALOGUE SYSTEM TYPES
// ============================================

export interface DialogueContext {
  npc: NPC;
  playerFame: number;
  playerGenre: string;
  playerPseudonym?: string;
  relationship: {
    affinity: number;
    trust: number;
    historyLevel: "none" | "acquaintance" | "friend" | "rival";
  };
  sceneState: {
    genreTrends: Record<string, number>;
    currentEvents: string[];
  };
  trigger: "greeting" | "collaboration_request" | "conflict" | "random_chat" | "farewell" | "custom_message";
}

export interface DialogueResponse {
  message: string;
  tone: string;
  intent: string;
  relationshipDelta: number;
  memoryEvent?: Omit<MemoryEvent, "id" | "timestamp">;
}

// ============================================
// EVENT GENERATION SYSTEM
// ============================================

export type WorldEventType =
  | "scene_event"
  | "npc_interaction"
  | "industry_event"
  | "trend_shift"
  | "viral_moment"
  | "controversy"
  | "collaboration"
  | "feud"
  | "label_offer"
  | "gig_invite"
  | "interview"
  | "review";

export type EventSeverity = "minor" | "notable" | "major" | "legendary";

export interface EventImpact {
  fansDelta: number;
  hypeDelta: number;
  prestigeDelta: number;
  moneyDelta: number;
  npcRelationshipChanges: Record<string, number>;
  genreShift: Record<string, number>;
}

export interface WorldEvent {
  id: string;
  type: WorldEventType;
  severity: EventSeverity;
  title: string;
  description: string;
  timestamp: number;
  weekDisplay: string;
  participants: string[];
  npcInvolved?: string[];
  impact: EventImpact;
  expiresAfterTicks?: number;
}

export interface NPCAction {
  npcId: string;
  type: "release" | "collaboration" | "promote" | "rest" | "produce" | "socialize" | "feud" | "network";
  targetNpcId?: string;
  description: string;
  priority: number;
}

// ============================================
// NPC TICK & WORLD SIMULATION
// ============================================

export interface WorldTickResult {
  npcActions: NPCAction[];
  events: WorldEvent[];
  npcMoodChanges: Array<{ npcId: string; mood: NPCMood }>;
  relationshipChanges: Array<{ npcId: string; targetId: string; delta: number }>;
}

// ============================================
// WEB ECOSYSTEM SIMULATOR (WES)
// ============================================

export type WebNodeType =
  | "artist_page"
  | "label_site"
  | "release_page"
  | "track_page"
  | "forum_thread"
  | "forum_post"
  | "news_article"
  | "review_page"
  | "comment"
  | "blog_post";

export interface WebNode {
  id: string;
  type: WebNodeType;
  title: string;
  url: string;
  content: string;
  tags: string[];
  genre?: string;
  authorId?: string;
  parentId?: string;
  createdAt: number;
  metadata: Record<string, any>;
}

export type WebEdgeType =
  | "link"
  | "share"
  | "embed"
  | "reference"
  | "repost"
  | "comment_reply"
  | "mention";

export interface WebEdge {
  from: string;
  to: string;
  type: WebEdgeType;
  weight: number;
  createdAt: number;
}

export interface AttentionState {
  views: number;
  clicks: number;
  dwellTime: number;
  shares: number;
  likes: number;
  backlinks: number;
  decayRate: number;
  momentum: number;
}

export type SearchIntent =
  | "news"
  | "music"
  | "forum"
  | "artist"
  | "label"
  | "gossip"
  | "track_releases"
  | "general";

export interface SearchResult {
  node: WebNode;
  score: number;
  relevance: number;
  authority: number;
  engagement: number;
  freshness: number;
  trendBoost: number;
}

export interface SiteAuthority {
  nodeId: string;
  domainAuthority: number;
  sceneReputation: number;
  historicalSignificance: number;
}

export type ViralityState =
  | "dead"
  | "gaining"
  | "viral"
  | "peak"
  | "declining"
  | "forgotten";

export interface ViralityData {
  state: ViralityState;
  score: number;
  amplificationFactor: number;
  networkDensity: number;
  influencerBoost: number;
  emotionalIntensity: number;
  noveltyFactor: number;
  peakedAt: number;
}

export interface ThreadDynamics {
  toxicity: number;
  engagement: number;
  polarization: number;
}

export type LifecycleStage =
  | "creation"
  | "discovery"
  | "growth"
  | "viral_spike"
  | "saturation"
  | "decay"
  | "archive";

export interface ContentLifecycleData {
  nodeId: string;
  stage: LifecycleStage;
  enteredAt: number;
  stageDuration: number;
}

export interface TrendState {
  genres: Record<string, number>;
  topics: Record<string, number>;
  sentiments: Record<string, number>;
}

export interface WESState {
  nodes: WebNode[];
  edges: WebEdge[];
  attention: Record<string, AttentionState>;
  authorities: SiteAuthority[];
  virality: Record<string, ViralityData>;
  trends: TrendState;
  threads: WESThread[];
  lifecycle: ContentLifecycleData[];
  tick: number;
}

export interface WESThread {
  id: string;
  title: string;
  topic: string;
  posts: WESPost[];
  dynamics: ThreadDynamics;
  createdAt: number;
  authorId: string;
}

export interface WESPost {
  id: string;
  authorId: string;
  content: string;
  timestamp: number;
  likes: number;
}

export interface NPCWebBehavior {
  postFrequency: number;
  controversyLevel: number;
  influenceScore: number;
}

// Re-export release system types
export * from "./types/releases";
