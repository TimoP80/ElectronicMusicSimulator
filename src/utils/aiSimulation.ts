/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AI Simulation System - Simulates the rest of the music scene
 * Features dynamic content generation with Gemini AI when available
 */

import { 
  AIRelease, 
  AINewsPost, 
  LabelActivity, 
  MusicGenre, 
  VirtualArtist,
  RecordLabel,
  ReleaseFormat,
  MusicTrend,
  GameState
} from "../types";
import { getAllPredefinedArtists, getTopPredefinedArtists } from "../data/artists";
import { getAllExtendedLabels } from "../data/recordLabels";
import { generateRandomTrackName } from "./simulation";

// ============================================
// AI-POWERED CONTENT GENERATION
// ============================================

// Cache for AI-generated content
const aiContentCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Generate unique cache key
function getCacheKey(type: string, ...params: string[]): string {
  return `${type}:${params.join(':')}:${Math.floor(Date.now() / CACHE_DURATION)}`;
}

// Dynamic review generation with context
export async function generateDynamicReview(
  title: string,
  genre: string,
  quality: number,
  stats: { groove: number; soundDesign: number; mixingQuality: number; catchiness: number }
): Promise<{ review: string; isFallback: boolean }> {
  const cacheKey = getCacheKey('review', title, genre, String(quality));
  const cached = aiContentCache.get(cacheKey);
  if (cached) return { review: cached.content, isFallback: false };

  try {
    const response = await fetch('/api/generate-ai-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, primaryGenre: genre, stats, rating: quality })
    });
    const data = await response.json();
    if (data.review) {
      aiContentCache.set(cacheKey, { content: data.review, timestamp: Date.now() });
      return { review: data.review, isFallback: data.isFallback || false };
    }
  } catch (e) {
    // Fallback to local generation
  }
  
  // Procedural fallback
  const review = generateProceduralReview(title, genre, quality, stats);
  return { review, isFallback: true };
}

// Generate procedural review when AI unavailable
function generateProceduralReview(
  title: string,
  genre: string,
  quality: number,
  stats: { groove: number; soundDesign: number; mixingQuality: number; catchiness: number }
): string {
  const qualityDescriptors = {
    low: ['raw', 'experimental', 'lo-fi', 'underground'],
    medium: ['solid', 'competent', 'polished', 'danceable'],
    high: ['exceptional', 'masterful', 'professional', 'standout']
  };
  
  const descriptors = quality < 40 ? qualityDescriptors.low 
    : quality < 70 ? qualityDescriptors.medium 
    : qualityDescriptors.high;
  
  const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
  
  const genreSpecific = {
    'Techno': 'pulsating rhythms',
    'House': 'groovy basslines',
    'Trance': 'euphoric melodies',
    'Drum & Bass': 'breakbeat energy',
    'Ambient': 'atmospheric textures',
    'Dubstep': 'heavy bass drops',
    'Experimental': 'boundary-pushing sounds'
  };
  
  const genreTrait = genreSpecific[genre as keyof typeof genreSpecific] || 'electronic textures';
  const avgStat = (stats.groove + stats.soundDesign + stats.mixingQuality) / 3;
  const strengthNote = avgStat > 70 
    ? `The sound design (${stats.soundDesign}/100) demonstrates impressive technical skill.`
    : avgStat > 40 
    ? `While there's room for improvement in the mix, the core ideas shine through.`
    : `The production feels rough around the edges but shows promise.`;
  
  return `[Scene Blog] "${descriptor.charAt(0).toUpperCase() + descriptor.slice(1)} ${genre} offering with ${genreTrait}. ${strengthNote} '${title}' is ${quality < 40 ? 'an acquired taste for die-hard underground purists' : quality < 70 ? 'worth a spin for genre enthusiasts' : 'essential listening that deserves wider recognition'}.]"`;
}

// Generate dynamic social reactions
export async function generateDynamicSocial(
  title: string,
  artist: string,
  genre: string,
  quality: number
): Promise<{ tweets: string[]; isFallback: boolean }> {
  try {
    const response = await fetch('/api/generate-ai-social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, primaryGenre: genre, artist, rating: quality })
    });
    const data = await response.json();
    if (data.tweets) {
      return { tweets: data.tweets, isFallback: data.isFallback || false };
    }
  } catch (e) {
    // Fallthrough to fallback
  }
  
  return { 
    tweets: generateProceduralSocial(title, artist, genre, quality), 
    isFallback: true 
  };
}

// Procedural social reactions
function generateProceduralSocial(title: string, artist: string, genre: string, quality: number): string[] {
  const basePosts = [
    `@${artist.replace(/\s+/g, '')}Fan: just discovered '${title}' 🔥 the ${genre} vibes are unreal!`,
    `Been bumping '${title}' on repeat all morning. That bass is so dirty 💀`,
    `@UndergroundRave: heard '${title}' at a warehouse party last night. Absolute fire!`
  ];
  
  const qualityPosts = quality > 70 ? [
    `This is elite level production. '${title}' is going to be huge`,
    `Finally someone pushing the ${genre} scene forward`,
    `That drop at 2:30 is insane 🔊`
  ] : quality > 40 ? [
    `Solid track. '${title}' has some nice moments`,
    `The ${genre} community is thriving right now`,
    `Added to my late night playlist`
  ] : [
    `Interesting but needs more polish`,
    `That bass sounds a bit muddy on small speakers`,
    `Underground vibes for sure 🎧`
  ];
  
  return [...basePosts.slice(0, 2), ...qualityPosts.slice(0, 2)];
}

// Generate scene news dynamically
export async function generateDynamicNews(
  genre: string,
  playerPrestige: number,
  sceneCity: string
): Promise<{ headline: string; body: string; isFallback: boolean }> {
  try {
    const response = await fetch('/api/generate-ai-scene-news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentGenre: genre, playerPrestige, hotTopic: 'new releases', sceneCity })
    });
    const data = await response.json();
    if (data.headline) {
      return { headline: data.headline, body: data.body, isFallback: data.isFallback || false };
    }
  } catch (e) {
    // Fallthrough
  }
  
  return generateProceduralNews(genre, playerPrestige, sceneCity);
}

// Procedural news generation
function generateProceduralNews(genre: string, prestige: number, city: string): { headline: string; body: string; isFallback: boolean } {
  const headlines = {
    underground: [
      `Underground ${genre} Scene Exploding in ${city}`,
      `${city} Warehouse Parties Making Waves`,
      `New ${genre} Collective Emerges from Underground`,
      `Purist Movement Gains Traction in ${genre}`
    ],
    mainstream: [
      `${genre} Makes Charts in ${city}`,
      `Major Festival Adds ${genre} Stage`,
      `${genre} Artists Signing Major Deals`,
      `${city} Becomes ${genre} Hotspot`
    ],
    neutral: [
      `${genre} Community Gathers for Secret Event`,
      `Industry Insiders Watching ${genre} Trend`,
      `Underground to Mainstream: ${genre} Evolution`,
      `${genre} Scene Adapts to Changing Times`
    ]
  };
  
  const key = prestige < 40 ? 'underground' : prestige > 70 ? 'mainstream' : 'neutral';
  const headline = headlines[key][Math.floor(Math.random() * headlines[key].length)];
  
  const bodies = [
    `The ${genre} movement continues to gain momentum as new artists emerge and established names push creative boundaries.`,
    `Sources close to the scene report increased interest from major labels seeking to sign rising talent in the ${genre} space.`,
    `Community members are buzzing about upcoming releases and secret events planned throughout the season.`
  ];
  
  return { headline, body: bodies[Math.floor(Math.random() * bodies.length)], isFallback: true };
}

// Generate forum post dynamically
export async function generateDynamicForumPost(
  category: string,
  genre: string,
  playerName: string
): Promise<{ title: string; content: string; isFallback: boolean }> {
  try {
    const response = await fetch('/api/generate-ai-forum-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, currentGenre: genre, playerName })
    });
    const data = await response.json();
    if (data.title) {
      return { title: data.title, content: data.content, isFallback: data.isFallback || false };
    }
  } catch (e) {
    // Fallthrough
  }
  
  return generateProceduralForumPost(category, genre, playerName);
}

// Procedural forum post
function generateProceduralForumPost(category: string, genre: string, playerName: string): { title: string; content: string; isFallback: boolean } {
  const posts: Record<string, { title: string; content: string }[]> = {
    tech: [
      { title: 'Best compression settings for punchy kicks?', content: 'Been struggling to get that punchy 909 sound. Anyone got tips for attack/release times?' },
      { title: 'Hardware vs Software debate - thoughts?', content: 'I use both but lately the software plugins are catching up fast. What\'s your take?' },
      { title: `${genre} mixing techniques thread`, content: 'Let\'s share our favorite EQ curves and compression tricks for ${genre} production.' }
    ],
    scene: [
      { title: `Best underground venues in ${new Date().getFullYear()}?`, content: 'With venues closing left and right, where are the real parties happening?' },
      { title: `${genre} festivals worth traveling for?`, content: 'Planning my festival season. Which events have the best crowds and sound systems?' },
      { title: 'DJ vs Live PA - opinions?', content: 'I love both but lately been preferring the energy of a good DJ set over live performances.' }
    ],
    gossip: [
      { title: 'Major label signing rumors', content: 'Anyone else hearing whispers about big underground artists moving to major labels?' },
      { title: 'Controversial producer drama', content: 'Let\'s not name names but some artists really need to learn how to treat their collaborators.' },
      { title: 'Ghost production in 2026', content: 'It\'s an open secret that half the big tracks are ghost produced. Thoughts?' }
    ],
    drama: [
      { title: 'Is the scene getting too commercial?', content: 'Remember when ${genre} was underground? Now it\'s everywhere. Good or bad?' },
      { title: 'Authenticity in modern production', content: 'With AI tools getting better, how do we define authentic artistry?' },
      { title: 'Gatekeeping in the community', content: 'Some veterans really think they own the scene. Time to share the spotlight.' }
    ],
    tips: [
      { title: 'Sidechain secrets revealed', content: 'Finally figured out the perfect sidechain settings. Happy to share!' },
      { title: 'Mixing tip: reference tracks are essential', content: 'I always compare my mix against 3 reference tracks before finalizing. Game changer.' },
      { title: 'Breaking through creative blocks', content: 'When I\'m stuck, I sample from random genres. Works every time!' }
    ]
  };
  
  const categoryPosts = posts[category] || posts.tips;
  const post = categoryPosts[Math.floor(Math.random() * categoryPosts.length)];
  return { 
    title: post.title.replace('${genre}', genre), 
    content: post.content.replace('${genre}', genre),
    isFallback: true 
  };
}

// ============================================
// LEGACY COMPATIBILITY (keeping existing API)
// ============================================

// Format options
const RELEASE_FORMATS: ReleaseFormat[] = [
  "Vinyl EP", "CD Single", "CD Maxi", "Digital EP", 
  "Web Album", "Vinyl LP", "Cassette"
];

// News templates by category (expanded)
const NEWS_TEMPLATES: Record<string, string[]> = {
  release: [
    "{artist} drops new {genre} heater '{title}' on {label}",
    "{artist} returns with '{title}' - out now via {label}",
    "{genre} pioneer {artist} releases new EP '{title}'",
    "Hot off the presses: {artist}'s new '{title}' is fire",
    "{artist} delivers crushing new '{title}' - {genre} at its finest",
    "Essential listening: {artist}'s '{title}' pushes {genre} boundaries",
  ],
  gossip: [
    "Rumor mill: {artist1} and {artist2} cooking up a collab?",
    "Sources say {artist} is leaving {label} - where will they land?",
    "{artist} spotted in studio with unknown producer",
    "Drama alert: {artist} calls out {label} on social media",
    "{artist1} and {artist2} seen together at {city} studio session",
    "Exclusive: {artist} working on surprise collaborative project",
  ],
  trend: [
    "{genre} making a comeback? New releases flooding the scene",
    "Underground {genre} scene heating up in {city}",
    "{genre} festivals selling out faster than ever",
    "The return of {genre}: Why this sound is dominating charts",
    "{genre} renaissance sweeping through {city} clubs",
    "Industry experts predict {genre} will dominate next season",
  ],
  festival: [
    "{festival} announces massive {genre} lineup",
    "{festival} 2026: {genre} takes center stage",
    "Big news from {festival} - early bird tickets going fast",
    "{festival} reveals star-studded {genre} bill",
    "{festival} adds {genre} stage for upcoming edition",
    "{festival} welcomes back {genre} artists for special sets",
  ],
  scandal: [
    "{artist} caught in studio scandal - leaked tracks surface online",
    "Label drama: {label} vs {artist} dispute goes public",
    "{artist} under fire for controversial sample",
    "Industry insiders reveal {artist}'s label troubles",
    "{label} announces restructuring amid controversy",
    "Anonymous sources expose {artist}'s creative disagreements",
  ],
  collab: [
    "{artist1} and {artist2} link up for massive collab",
    "Unexpected team-up: {artist1} x {artist2} confirmed",
    "{artist} recruits {artist2} for upcoming EP",
    "Supergroup alert: {artist1} and {artist2} form new project",
    "{artist1} joins {artist2} on upcoming {genre} project",
    "Cross-genre collaboration: {artist1} and {artist2} surprise fans",
  ]
};

// Label activity templates (expanded)
const LABEL_ACTIVITIES = {
  signing: [
    "{label} signs promising new talent {artist}",
    "{artist} inks deal with {label}",
    "{label} announces signing of {artist}",
    "{artist} becomes latest addition to {label} roster",
    "{label} secures exclusive contract with {artist}",
  ],
  release: [
    "{label} drops new compilation: {title}",
    "{artist}'s '{title}' out now on {label}",
    "{label} strengthens roster with {artist} release",
    "{title} marks {label}'s biggest release of the year",
    "{label} celebrates success of {artist}'s '{title}'",
  ],
  tour: [
    "{label} announces showcase tour featuring {artists}",
    "{label} artists hitting the road for European tour",
    "{label} presents: Live shows from {artists}",
    "{label} fall tour showcases rising {genre} talent",
    "{label} residency nights confirmed at top venues",
  ],
  closure: [
    "{label} announces indefinite hiatus",
    "Sad news: {label} shutting down operations",
    "{label} releases final statement before closure",
    "{label} confirms end of an era after 10 years",
  ],
  award: [
    "{label} wins prestigious industry award",
    "{artist} and {label} celebrate award nomination",
    "{label} recognized for contributions to {genre}",
    "{label} shortlisted for best underground label",
  ]
};

// Cities for news
const CITIES = ["Berlin", "Amsterdam", "London", "Detroit", "Ibiza", "Tokyo", "Los Angeles", "Rotterdam", "Manchester", "Paris", "Prague", "Barcelona", "Vienna", "Berlin"];

// Festival names
const FESTIVALS = ["Tomorrowland", "ADE", "Creamfields", "Electric Daisy Carnival", "Ultra", "Defqon.1", "Transmission", "Amsterdam Dance Event", "Sonus Festival", "Together Festival", "Rave Nation", "Electric Sky", "Neon Dreams", "Underground Rising"];

/**
 * Get a random element from an array
 */
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a simulated AI release
 */
export function generateAIRelease(
  trend: MusicTrend,
  topArtists: VirtualArtist[],
  labels: RecordLabel[]
): AIRelease {
  // Pick a random artist (prefer top artists for realism)
  const useTop = Math.random() < 0.6 && topArtists.length > 0;
  const artist = useTop 
    ? randomFrom(topArtists) 
    : randomFrom(getAllPredefinedArtists());
  
  // Pick a label (some releases are self-released)
  const isSigned = Math.random() < 0.7;
  const label = isSigned ? randomFrom(labels) : null;
  
  // Generate track title
  const trackTitle = generateRandomTrackName(MusicGenre.TECHNO, null) || `${artist.name} Track`;
  
  // Calculate quality (influenced by artist's fame)
  const baseQuality = 40 + Math.random() * 40;
  const fameBonus = artist.fame * 0.3;
  const trendBonus = trend.hotGenre === artist.primaryGenre ? 15 : 0;
  const quality = Math.min(100, Math.round(baseQuality + fameBonus + trendBonus));
  
  // Viral chance based on quality and trend
  const viralChance = quality > 70 && trend.hypeMultiplier > 1.2;
  const isViral = viralChance && Math.random() < 0.15;
  
  // Play count based on quality, fame, and trend
  const basePlays = quality * 50 + artist.fame * 20;
  const trendMult = trend.hotGenre === artist.primaryGenre ? trend.hypeMultiplier : 0.8;
  const viralMult = isViral ? 5 + Math.random() * 10 : 1;
  const playCount = Math.round(basePlays * trendMult * viralMult);
  
  return {
    id: `ai_rel_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    artistName: artist.name,
    artistId: artist.id,
    genre: artist.primaryGenre,
    trackTitle,
    releaseDate: "", // Will be set when added to game state
    labelName: label?.name || null,
    labelId: label?.id || null,
    format: randomFrom(RELEASE_FORMATS),
    playCount,
    quality,
    isViral,
    hypeGenerated: Math.round(playCount / 100),
    source: isViral ? "viral" : "ai_release"
  };
}

/**
 * Generate a simulated news post
 */
export function generateAINewsPost(
  artists: VirtualArtist[],
  labels: RecordLabel[],
  trend: MusicTrend
): AINewsPost {
  const categories: AINewsPost["category"][] = ["release", "gossip", "trend", "festival", "scandal", "collab"];
  const weights = [0.35, 0.15, 0.2, 0.15, 0.05, 0.1];
  
  // Weighted random category selection
  const r = Math.random();
  let cumWeight = 0;
  let category: AINewsPost["category"] = "release";
  for (let i = 0; i < weights.length; i++) {
    cumWeight += weights[i];
    if (r < cumWeight) {
      category = categories[i];
      break;
    }
  }
  
  const artist1 = randomFrom(artists.length > 0 ? artists : getAllPredefinedArtists());
  const artist2 = randomFrom(artists.length > 0 ? artists : getAllPredefinedArtists());
  const label = randomFrom(labels);
  
  // Fill template
  let headline = randomFrom(NEWS_TEMPLATES[category]);
  let body = headline;
  
  // Replace placeholders
  const replacements: Record<string, string> = {
    '{artist}': artist1.name,
    '{artist1}': artist1.name,
    '{artist2}': artist2.name,
    '{label}': label.name,
    '{genre}': trend.hotGenre,
    '{city}': randomFrom(CITIES),
    '{festival}': randomFrom(FESTIVALS),
    '{title}': generateRandomTrackName(MusicGenre.TECHNO, null) || "New Track",
    '{artists}': `${artist1.name}, ${artist2.name}`
  };
  
  for (const [key, value] of Object.entries(replacements)) {
    // Escape special regex characters in key and replace
    const escapedKey = key.replace(/[{}]/g, '\\$&');
    headline = headline.replace(new RegExp(escapedKey, 'g'), value);
    body = body.replace(new RegExp(escapedKey, 'g'), value);
  }
  
  // Calculate hype impact
  let hypeImpact = 0;
  if (category === "release") hypeImpact = randomInt(5, 20);
  if (category === "scandal") hypeImpact = -randomInt(5, 15);
  if (category === "trend") hypeImpact = randomInt(3, 10);
  
  // Check for viral news (generated separately)
  
  return {
    id: `ai_news_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    date: "", // Will be set when added to game state
    headline,
    body,
    category,
    relatedArtists: [artist1.name, artist2.name],
    relatedLabels: [label.name],
    relatedGenres: [artist1.primaryGenre, trend.hotGenre],
    hypeImpact
  };
}

/**
 * Generate a simulated label activity
 */
export function generateLabelActivity(
  labels: RecordLabel[],
  artists: VirtualArtist[]
): LabelActivity {
  const types: LabelActivity["type"][] = ["signing", "release", "tour", "closure", "award"];
  const weights = [0.25, 0.45, 0.15, 0.05, 0.1];
  
  // Weighted random type selection
  const r = Math.random();
  let cumWeight = 0;
  let type: LabelActivity["type"] = "release";
  for (let i = 0; i < weights.length; i++) {
    cumWeight += weights[i];
    if (r < cumWeight) {
      type = types[i];
      break;
    }
  }
  
  const label = randomFrom(labels);
  const artist = randomFrom(artists.length > 0 ? artists : getAllPredefinedArtists());
  
  // Fill template
  let description = randomFrom(LABEL_ACTIVITIES[type]);
  
  // Replace placeholders
  const replacements: Record<string, string> = {
    '{label}': label.name,
    '{artist}': artist.name,
    '{artists}': `${artist.name} and others`,
    '{title}': generateRandomTrackName(MusicGenre.TECHNO, null) || "New Release",
    '{genre}': artist.primaryGenre
  };
  
  for (const [key, value] of Object.entries(replacements)) {
    const escapedKey = key.replace(/[{}]/g, '\\$&');
    description = description.replace(new RegExp(escapedKey, 'g'), value);
  }
  
  return {
    id: `ai_label_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    labelId: label.id,
    labelName: label.name,
    date: "", // Will be set when added to game state
    type,
    description,
    artistName: artist.name,
    trackTitle: generateRandomTrackName(MusicGenre.TECHNO, null) || undefined
  };
}

/**
 * Simulate the AI scene for one game week
 */
export function simulateAIScene(
  currentState: Partial<GameState>,
  weekCount: number
): {
  newReleases: AIRelease[];
  newNews: AINewsPost[];
  newActivities: LabelActivity[];
  fameChanges: { artistId: string; change: number }[];
} {
  const labels = getAllExtendedLabels();
  const allArtists = getAllPredefinedArtists();
  const topArtists = getTopPredefinedArtists(50);
  const trend = currentState.currentTrend || {
    id: "default",
    name: "Steady State",
    hypeMultiplier: 1.0,
    hotGenre: MusicGenre.HOUSE,
    decayingGenre: MusicGenre.EXPERIMENTAL,
    description: "",
    durationMonths: 12,
    source: ""
  };
  
  const results = {
    newReleases: [] as AIRelease[],
    newNews: [] as AINewsPost[],
    newActivities: [] as LabelActivity[],
    fameChanges: [] as { artistId: string; change: number }[]
  };
  
  // Generate 3-8 AI releases per week
  const releaseCount = randomInt(3, 8);
  for (let i = 0; i < releaseCount; i++) {
    const release = generateAIRelease(trend, topArtists, labels);
    release.releaseDate = `Year ${currentState.gameDate?.year || 1}, Month ${currentState.gameDate?.month || 1}, Week ${currentState.gameDate?.week || 1}`;
    results.newReleases.push(release);
    
    // Fame changes for release
    if (release.quality > 60) {
      results.fameChanges.push({
        artistId: release.artistId,
        change: Math.round(release.quality / 10)
      });
    }
  }
  
  // Generate 2-5 news posts per week
  const newsCount = randomInt(2, 5);
  for (let i = 0; i < newsCount; i++) {
    const news = generateAINewsPost(topArtists, labels, trend);
    news.date = `Year ${currentState.gameDate?.year || 1}, Month ${currentState.gameDate?.month || 1}, Week ${currentState.gameDate?.week || 1}`;
    results.newNews.push(news);
  }
  
  // Generate 1-3 label activities per week
  const activityCount = randomInt(1, 3);
  for (let i = 0; i < activityCount; i++) {
    const activity = generateLabelActivity(labels, topArtists);
    activity.date = `Year ${currentState.gameDate?.year || 1}, Month ${currentState.gameDate?.month || 1}, Week ${currentState.gameDate?.week || 1}`;
    results.newActivities.push(activity);
  }
  
  return results;
}

/**
 * Update virtual artists' fame based on releases and news
 */
export function updateArtistFame(
  artists: VirtualArtist[],
  fameChanges: { artistId: string; change: number }[]
): VirtualArtist[] {
  const artistMap = new Map(artists.map(a => [a.id, a]));
  
  for (const { artistId, change } of fameChanges) {
    const artist = artistMap.get(artistId);
    if (artist) {
      artist.fame = Math.max(1, Math.min(100, artist.fame + change));
    }
  }
  
  return Array.from(artistMap.values());
}
