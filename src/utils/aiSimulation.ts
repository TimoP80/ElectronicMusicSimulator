/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AI Simulation System - Simulates the rest of the music scene
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

// Format options
const RELEASE_FORMATS: ReleaseFormat[] = [
  "Vinyl EP", "CD Single", "CD Maxi", "Digital EP", 
  "Web Album", "Vinyl LP", "Cassette"
];

// News templates by category
const NEWS_TEMPLATES: Record<string, string[]> = {
  release: [
    "{artist} drops new {genre} heater '{title}' on {label}",
    "{artist} returns with '{title}' - out now via {label}",
    "{genre} pioneer {artist} releases new EP '{title}'",
    "Hot off the presses: {artist}'s new '{title}' is fire",
  ],
  gossip: [
    "Rumor mill: {artist1} and {artist2} cooking up a collab?",
    "Sources say {artist} is leaving {label} - where will they land?",
    "{artist} spotted in studio with unknown producer",
    "Drama alert: {artist} calls out {label} on social media",
  ],
  trend: [
    "{genre} making a comeback? New releases flooding the scene",
    "Underground {genre} scene heating up in {city}",
    "{genre} festivals selling out faster than ever",
    "The return of {genre}: Why this sound is dominating charts",
  ],
  festival: [
    "{festival} announces massive {genre} lineup",
    "{festival} 2026: {genre} takes center stage",
    "Big news from {festival} - early bird tickets going fast",
    "{festival} reveals star-studded {genre} bill",
  ],
  scandal: [
    "{artist} caught in studio scandal - leaked tracks surface online",
    "Label drama: {label} vs {artist} dispute goes public",
    "{artist} under fire for controversial sample",
    "Industry insiders reveal {artist}'s label troubles",
  ],
  collab: [
    "{artist1} and {artist2} link up for massive collab",
    "Unexpected team-up: {artist1} x {artist2} confirmed",
    "{artist} recruits {artist2} for upcoming EP",
    "Supergroup alert: {artist1} and {artist2} form new project",
  ]
};

// Label activity templates
const LABEL_ACTIVITIES = {
  signing: [
    "{label} signs promising new talent {artist}",
    "{artist} inks deal with {label}",
    "{label} announces signing of {artist}",
  ],
  release: [
    "{label} drops new compilation: {title}",
    "{artist}'s '{title}' out now on {label}",
    "{label} strengthens roster with {artist} release",
  ],
  tour: [
    "{label} announces showcase tour featuring {artists}",
    "{label} artists hitting the road for European tour",
    "{label} presents: Live shows from {artists}",
  ],
  closure: [
    "{label} announces indefinite hiatus",
    "Sad news: {label} shutting down operations",
    "{label} releases final statement before closure",
  ],
  award: [
    "{label} wins prestigious industry award",
    "{artist} and {label} celebrate award nomination",
    "{label} recognized for contributions to {genre}",
  ]
};

// Cities for news
const CITIES = ["Berlin", "Amsterdam", "London", "Detroit", "Ibiza", "Tokyo", "Los Angeles", "Rotterdam", "Manchester", "Paris"];

// Festival names
const FESTIVALS = ["Tomorrowland", "ADE", "Creamfields", "Electric Daisy Carnival", "Ultra", "Defqon.1", "Transmission", "Amsterdam Dance Event", "Sonus Festival", "Together Festival"];

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
