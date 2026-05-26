/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Predefined artists from JSON database
 */

import { VirtualArtist, MusicGenre } from "../types";
import ArtistPoolData from "./artistpool_predefined.json";

// Type assertion
const ARTIST_POOL_DATA = ArtistPoolData as { PreDefinedArtists: { Band: Array<{
  Name: string;
  BandStartYear: string;
  BandBiographyText?: string;
  BandMainGenre: string;
  BandFixedSubGenre: string;
  BandSubGenre?: string;
  Alt_Aliases?: { Alias: string | string[] };
  SoloProject: string;
  BandFame?: string;
  Cash?: string;
}> } };

// Map genre string to MusicGenre enum
function mapGenreToMusicGenre(genreStr: string): MusicGenre | null {
  const genreMap: { [key: string]: MusicGenre } = {
    'trance': MusicGenre.TRANCE,
    'hard dance': MusicGenre.HARDSTYLE,
    'hardcore': MusicGenre.HARDCORE,
    'psychedelic': MusicGenre.PSYTRANCE,
    'breakbeat': MusicGenre.DRUM_AND_BASS,
    'acid': MusicGenre.ACID_HOUSE,
    'finnish psytrance': MusicGenre.SUOMISAUNDI,
    'techno': MusicGenre.TECHNO,
    'house': MusicGenre.HOUSE,
    'ambient': MusicGenre.AMBIENT,
    'drum\'n\'bass': MusicGenre.DRUM_AND_BASS,
    'drum and bass': MusicGenre.DRUM_AND_BASS,
    'dance': MusicGenre.HARDSTYLE,
  };
  return genreMap[genreStr.toLowerCase()] || null;
}

// Calculate fame based on career years and genre
function calculateFame(startYear: string, fameStr?: string): number {
  if (fameStr) {
    const fame = parseInt(fameStr, 10);
    if (!isNaN(fame)) return fame;
  }
  
  const year = parseInt(startYear, 10) || 2000;
  const yearsActive = 2024 - year;
  
  // Longer career = more established = higher base fame
  return Math.min(95, 20 + yearsActive * 5 + Math.random() * 30);
}

// Determine relationship based on fame difference
function determineRelationship(artistFame: number, playerFame: number): VirtualArtist['status'] {
  const diff = artistFame - playerFame;
  
  if (diff > 30) return 'rival';
  if (diff > 10) return 'colleague';
  if (diff < -20) return 'mentor';
  return 'neutral';
}

// Determine ego based on fame and genre
function calculateEgo(name: string, fame: number, genre: string): number {
  // Big mainstream names have high ego
  const bigNames = ['tiesto', 'armin', 'skrillex', 'deadmau5', 'calvin harris', 'david guetta'];
  if (bigNames.some(n => name.toLowerCase().includes(n))) {
    return Math.min(95, fame + 10);
  }
  
  // Underground artists might have high ego too (dunning-kruger)
  if (['hardcore', 'gabber', 'speedcore', 'noise'].some(g => genre.toLowerCase().includes(g))) {
    return Math.min(90, 40 + Math.random() * 40);
  }
  
  // Default: ego roughly correlated with fame but with variance
  return Math.min(85, Math.max(20, fame * 0.7 + Math.random() * 30));
}

/**
 * Get all predefined artists from the JSON database
 */
export function getAllPredefinedArtists(): VirtualArtist[] {
  const bands = ARTIST_POOL_DATA.PreDefinedArtists.Band;
  
  return bands.map((band, index) => {
    const genre = mapGenreToMusicGenre(band.BandMainGenre) || MusicGenre.TECHNO;
    const fame = calculateFame(band.BandStartYear, band.BandFame);
    
    return {
      id: `predef_artist_${index}_${band.Name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: band.Name,
      primaryGenre: genre,
      ego: calculateEgo(band.Name, fame, band.BandMainGenre),
      fame,
      relationship: 0, // Neutral relationship, will be updated based on player interactions
      status: 'neutral' as VirtualArtist['status'],
      bio: band.BandBiographyText || `A ${band.BandMainGenre} artist since ${band.BandStartYear}.`,
      gender: 'non-binary' as VirtualArtist['gender'],
      pronouns: 'they/them',
    };
  });
}

/**
 * Get predefined artists filtered by genre
 */
export function getPredefinedArtistsByGenre(genre: MusicGenre): VirtualArtist[] {
  const allArtists = getAllPredefinedArtists();
  const genreStr = genre.toLowerCase();
  
  return allArtists.filter(artist => {
    const artistGenre = artist.primaryGenre.toLowerCase();
    return artistGenre === genreStr || 
           artistGenre.includes(genreStr) || 
           genreStr.includes(artistGenre);
  });
}

/**
 * Get a random predefined artist
 */
export function getRandomPredefinedArtist(): VirtualArtist | null {
  const artists = getAllPredefinedArtists();
  if (artists.length === 0) return null;
  return artists[Math.floor(Math.random() * artists.length)];
}

/**
 * Get a random predefined artist for a specific genre
 */
export function getRandomPredefinedArtistByGenre(genre: MusicGenre): VirtualArtist | null {
  const artists = getPredefinedArtistsByGenre(genre);
  if (artists.length === 0) return null;
  return artists[Math.floor(Math.random() * artists.length)];
}

/**
 * Get predefined artists by status
 */
export function getPredefinedArtistsByStatus(status: VirtualArtist['status']): VirtualArtist[] {
  const allArtists = getAllPredefinedArtists();
  return allArtists.filter(artist => artist.status === status);
}

/**
 * Get predefined artists that could be rivals
 */
export function getPotentialRivals(playerFame: number): VirtualArtist[] {
  const allArtists = getAllPredefinedArtists();
  return allArtists.filter(artist => artist.fame > playerFame * 0.7);
}

/**
 * Get predefined artists that could be mentors
 */
export function getPotentialMentors(playerFame: number): VirtualArtist[] {
  const allArtists = getAllPredefinedArtists();
  return allArtists.filter(artist => artist.fame > playerFame * 1.5);
}

/**
 * Get count of predefined artists
 */
export function getPredefinedArtistCount(): number {
  return ARTIST_POOL_DATA.PreDefinedArtists.Band.length;
}

/**
 * Get count of predefined artists by genre
 */
export function getPredefinedArtistCountByGenre(genre: MusicGenre): number {
  return getPredefinedArtistsByGenre(genre).length;
}

/**
 * Get top predefined artists by fame
 */
export function getTopPredefinedArtists(limit: number = 20): VirtualArtist[] {
  const allArtists = getAllPredefinedArtists();
  return [...allArtists]
    .sort((a, b) => b.fame - a.fame)
    .slice(0, limit);
}

/**
 * Get notable artists from specific subgenres
 */
export function getNotableArtists(limit: number = 10): VirtualArtist[] {
  const allArtists = getAllPredefinedArtists();
  
  // Return artists with high fame who are likely real-world artists
  return allArtists
    .filter(a => a.fame > 50)
    .sort((a, b) => b.fame - a.fame)
    .slice(0, limit);
}
