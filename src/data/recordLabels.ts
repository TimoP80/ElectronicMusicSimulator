/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Extended record labels from JSON database
 */

import { RecordLabel, MusicGenre } from "../types";
import { RECORD_LABELS_DATA } from "./database";

// Map genre string to MusicGenre enum
function mapGenreStringToMusicGenre(genreStr: string): MusicGenre | null {
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
  };
  return genreMap[genreStr.toLowerCase()] || null;
}

// Parse royalty and advance values
function parseContractValues(contract: { 
  "@releaseroyalty_artist"?: string; 
  "@advanceminimum"?: string; 
  "@advancemaximum"?: string;
}): { royaltySplit: number; signingAdvance: number } {
  let royaltySplit = 0.40;
  let signingAdvance = 1000;
  
  if (contract["@releaseroyalty_artist"]) {
    royaltySplit = parseFloat(contract["@releaseroyalty_artist"]) || 0.40;
  }
  
  if (contract["@advanceminimum"] && contract["@advancemaximum"]) {
    const minAdvance = parseInt(contract["@advanceminimum"], 10);
    const maxAdvance = parseInt(contract["@advancemaximum"], 10);
    if (!isNaN(minAdvance) && !isNaN(maxAdvance)) {
      signingAdvance = Math.round((minAdvance + maxAdvance) / 2);
    }
  }
  
  return { royaltySplit, signingAdvance };
}

// Calculate prestige based on founding year
function calculatePrestige(foundedYearStr: string): number {
  const foundedYear = parseInt(foundedYearStr || '2000', 10);
  const yearsActive = 2024 - foundedYear;
  // Base prestige on years active (older labels = more prestige)
  return Math.min(90, Math.max(15, yearsActive * 4 + Math.random() * 15));
}

// Calculate minimum fans requirement based on prestige
function calculateMinFans(prestige: number): number {
  return Math.round(prestige * 50);
}

// Calculate minimum hype based on prestige
function calculateMinHype(prestige: number): number {
  return Math.round(prestige * 0.6);
}

// Clean HTML tags from description
function cleanDescription(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate extended record labels from JSON database
 * Returns all active labels from RecordLabels.json mapped to the game's RecordLabel format
 */
export function getExtendedLabelsDB(): RecordLabel[] {
  const jsonLabels = RECORD_LABELS_DATA.PredefRecordLabels.RecordLabel;
  
  return jsonLabels
    .filter(label => label.LabelActive.toLowerCase() === 'true')
    .map((jsonLabel, index) => {
      const prestige = calculatePrestige(jsonLabel.FoundedYear);
      
      // Get contract values from first signed artist if available
      let royaltySplit = 0.40;
      let signingAdvance = 1000;
      
      if (jsonLabel.SignedArtists?.Contract?.length) {
        const firstContract = jsonLabel.SignedArtists.Contract[0];
        const parsed = parseContractValues(firstContract);
        royaltySplit = parsed.royaltySplit;
        signingAdvance = parsed.signingAdvance;
      }
      
      // Map main genre
      const mainGenre = mapGenreStringToMusicGenre(jsonLabel.ReleasesMainGenre);
      const genres: MusicGenre[] = mainGenre ? [mainGenre] : [];
      
      // Add subgenre if specified and fixed
      if (jsonLabel.ReleasesSubGenre && jsonLabel.ReleasesFixSubGenre.toLowerCase() === 'true') {
        const subGenre = mapGenreStringToMusicGenre(jsonLabel.ReleasesSubGenre);
        if (subGenre && !genres.includes(subGenre)) {
          genres.push(subGenre);
        }
      }
      
      return {
        id: `ext_label_${index}_${jsonLabel.Name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: jsonLabel.Name,
        description: cleanDescription(jsonLabel.LabelDescription) || `A well-known ${jsonLabel.ReleasesMainGenre} label.`,
        prestige,
        preferredGenres: genres.length > 0 ? genres : [MusicGenre.TECHNO],
        royaltySplit,
        signingAdvance,
        requirements: {
          minFans: calculateMinFans(prestige),
          minHype: calculateMinHype(prestige),
          genreMatch: true,
        },
        dealLength: 3 + Math.floor(Math.random() * 3),
      };
    });
}

// Get extended labels with genre filter
export function getExtendedLabelsByGenre(genre: MusicGenre): RecordLabel[] {
  const allLabels = getExtendedLabelsDB();
  const genreStr = genre.toLowerCase();
  
  return allLabels.filter(label => {
    return label.preferredGenres.some(g => 
      g.toLowerCase() === genreStr || 
      genreStr.includes(g.toLowerCase())
    );
  });
}

// Get a random extended label
export function getRandomExtendedLabel(): RecordLabel | null {
  const labels = getExtendedLabelsDB();
  if (labels.length === 0) return null;
  return labels[Math.floor(Math.random() * labels.length)];
}

// Get count of extended labels
export function getExtendedLabelsCount(): number {
  return RECORD_LABELS_DATA.PredefRecordLabels.RecordLabel
    .filter(label => label.LabelActive.toLowerCase() === 'true')
    .length;
}
