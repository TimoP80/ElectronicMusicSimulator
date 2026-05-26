/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Import data from JSON databases for the Electronic Music Simulator
 */

import { GenresDatabase } from "../types";
import { SceneGroupsDatabase } from "../types";
import { SongGeneratorDatabase } from "../types";
import { SongNamesDatabase } from "../types";
import { RecordLabelsDatabase, MusicGenre } from "../types";

import GenresData from "./Genres.json";
import SceneGroupsData from "./SceneGroups.json";
import SongGeneratorData from "./SongGeneratorDatabase.json";
import SongNamesData from "./songnames.json";
import RecordLabelsData from "./RecordLabels.json";
import ArtistPoolData from "./artistpool_predefined.json";

// Export the raw JSON data with proper typing
export const GENRES_DATA: GenresDatabase = GenresData as GenresDatabase;
export const SCENE_GROUPS_DATA: SceneGroupsDatabase = SceneGroupsData as SceneGroupsDatabase;
export const SONG_GENERATOR_DATA: SongGeneratorDatabase = SongGeneratorData as SongGeneratorDatabase;
export const SONG_NAMES_DATA: SongNamesDatabase = SongNamesData as SongNamesDatabase;
export const RECORD_LABELS_DATA: RecordLabelsDatabase = RecordLabelsData as RecordLabelsDatabase;
export const ARTIST_POOL_DATA = ArtistPoolData;

// Helper functions for accessing the data

/**
 * Get all genres from the database
 */
export function getAllGenres(): string[] {
  return GENRES_DATA.Genrelist.Genre.map(g => g["@name"]);
}

/**
 * Get subgenres for a specific genre
 */
export function getSubgenresForGenre(genreName: string): string[] {
  const genre = GENRES_DATA.Genrelist.Genre.find(g => g["@name"] === genreName);
  if (!genre) return [];
  
  const subgenres = genre.Subgenre;
  if (Array.isArray(subgenres)) {
    return subgenres.map(s => s["@name"]);
  }
  return [subgenres["@name"]];
}

/**
 * Get BPM range for a subgenre
 */
export function getSubgenreBPMRange(subgenreName: string, genreName: string): { min: number; max: number } | null {
  const genre = GENRES_DATA.Genrelist.Genre.find(g => g["@name"] === genreName);
  if (!genre) return null;
  
  const subgenres = genre.Subgenre;
  const subgenreArray = Array.isArray(subgenres) ? subgenres : [subgenres];
  const subgenre = subgenreArray.find(s => s["@name"] === subgenreName);
  
  if (!subgenre || !subgenre.BPM) return null;
  
  return {
    min: parseInt(subgenre.BPM.min, 10),
    max: parseInt(subgenre.BPM.max, 10)
  };
}

/**
 * Get genre attributes for a subgenre
 */
export function getSubgenreAttributes(subgenreName: string, genreName: string): string[] {
  const genre = GENRES_DATA.Genrelist.Genre.find(g => g["@name"] === genreName);
  if (!genre) return [];
  
  const subgenres = genre.Subgenre;
  const subgenreArray = Array.isArray(subgenres) ? subgenres : [subgenres];
  const subgenre = subgenreArray.find(s => s["@name"] === subgenreName);
  
  if (!subgenre || !subgenre.GenreAttributes) return [];
  
  const attrs = subgenre.GenreAttributes.Attrib;
  return Array.isArray(attrs) ? attrs : [attrs];
}

/**
 * Get length range for a subgenre
 */
export function getSubgenreLengthRange(subgenreName: string, genreName: string): { min: number; max: number } | null {
  const genre = GENRES_DATA.Genrelist.Genre.find(g => g["@name"] === genreName);
  if (!genre) return null;
  
  const subgenres = genre.Subgenre;
  const subgenreArray = Array.isArray(subgenres) ? subgenres : [subgenres];
  const subgenre = subgenreArray.find(s => s["@name"] === subgenreName);
  
  if (!subgenre || !subgenre.Length) return null;
  
  return {
    min: parseInt(subgenre.Length.min, 10),
    max: parseInt(subgenre.Length.max, 10)
  };
}

/**
 * Get popularity modifier for a subgenre
 */
export function getSubgenrePopularity(subgenreName: string, genreName: string): { modifier: number; popularity: number } | null {
  const genre = GENRES_DATA.Genrelist.Genre.find(g => g["@name"] === genreName);
  if (!genre) return null;
  
  const subgenres = genre.Subgenre;
  const subgenreArray = Array.isArray(subgenres) ? subgenres : [subgenres];
  const subgenre = subgenreArray.find(s => s["@name"] === subgenreName);
  
  if (!subgenre || !subgenre.Popularity) return null;
  
  return {
    modifier: parseInt(subgenre.Popularity["@modifier"], 10),
    popularity: parseInt(subgenre.Popularity["#text"], 10)
  };
}

/**
 * Get all scene groups
 */
export function getAllSceneGroups(): Array<{ name: string; prefix: string; country?: string }> {
  return SCENE_GROUPS_DATA.ReleaseGroupDB.SceneGroup.map(sg => ({
    name: sg["@name"] || "",
    prefix: sg["@prefix"] || "",
    country: sg["@country"]
  })).filter(sg => sg.name !== "");
}

/**
 * Get random release note for a proper type
 */
export function getRandomReleaseNote(properType: string): string {
  const groups = SCENE_GROUPS_DATA.ReleaseGroupDB.SceneGroup;
  if (groups.length === 0) return "Proper release notes";
  
  const group = groups[Math.floor(Math.random() * groups.length)];
  const messages = group.ReleaseNoteMessages?.MsgData;
  if (!messages) return "Proper release notes";
  
  const note = messages.find(m => m["@id"] === properType);
  if (!note || !note.RandomMsg) return "Proper release notes";
  
  const msgArray = Array.isArray(note.RandomMsg) ? note.RandomMsg : [note.RandomMsg];
  if (msgArray.length === 0) return "Proper release notes";
  
  return msgArray[Math.floor(Math.random() * msgArray.length)];
}

/**
 * Get song generator data for a genre
 */
export function getSongGeneratorGenreData(displayName: string) {
  return SONG_GENERATOR_DATA.SongDataBase.Genre.find(g => g["@displayname"] === displayName);
}

/**
 * Get compilation names for a genre
 */
export function getCompilationNames(displayName: string) {
  const genre = getSongGeneratorGenreData(displayName);
  if (!genre?.CompilationNames?.NameGroup) return [];
  
  const groups = genre.CompilationNames.NameGroup;
  return Array.isArray(groups) ? groups : [groups];
}

/**
 * Get release types available
 */
export function getReleaseTypes() {
  return SONG_GENERATOR_DATA.SongDataBase.ReleaseTypes?.ReleaseType || [];
}

/**
 * Get track versions for a release type
 */
export function getTrackVersions(releaseTypeName: string) {
  const releaseTypes = getReleaseTypes();
  const releaseType = releaseTypes.find(rt => rt["@name"] === releaseTypeName);
  return releaseType?.TrackVersion || [];
}

/**
 * Get record info text (VA entries template)
 */
export function getVAEntryTemplate(displayName: string): string {
  const genre = getSongGeneratorGenreData(displayName);
  return genre?.RecordInfoText?.VA_Entries?.Text || "";
}

// ============= Song Names Database Functions =============

/**
 * Get all song names for a specific genre category
 */
export function getSongNamesForCategory(genreCategory: string): string[] {
  const groups = SONG_NAMES_DATA.SongNames.SongNameGroup;
  const group = groups.find(g => g["@genre"] === genreCategory);
  if (!group || !group.name) return [];
  return Array.isArray(group.name) ? group.name : [group.name];
}

/**
 * Get all available song name categories
 */
export function getAllSongNameCategories(): string[] {
  return SONG_NAMES_DATA.SongNames.SongNameGroup.map(g => g["@genre"]);
}

/**
 * Get a random song name from the database, optionally filtered by genre
 * Falls back to procedural generation if no matching genre found
 */
export function getRandomSongName(genreCategory?: string): string | null {
  if (genreCategory) {
    const names = getSongNamesForCategory(genreCategory);
    if (names.length > 0) {
      return names[Math.floor(Math.random() * names.length)];
    }
  }
  return null;
}

/**
 * Get all song names from all categories combined
 */
export function getAllSongNames(): string[] {
  return SONG_NAMES_DATA.SongNames.SongNameGroup.flatMap(g => 
    Array.isArray(g.name) ? g.name : [g.name]
  );
}

// ============= Record Labels Database Functions =============

type RecordLabelItem = RecordLabelsDatabase['PredefRecordLabels']['RecordLabel'][number];

/**
 * Get all predefined record labels
 */
export function getAllRecordLabels(): RecordLabelItem[] {
  return RECORD_LABELS_DATA.PredefRecordLabels.RecordLabel;
}

/**
 * Get record labels filtered by main genre
 */
export function getRecordLabelsByGenre(genre: string): RecordLabelItem[] {
  const allLabels = getAllRecordLabels();
  return allLabels.filter(label => 
    label.ReleasesMainGenre.toLowerCase() === genre.toLowerCase()
  );
}

/**
 * Get active record labels (not defunct)
 */
export function getActiveRecordLabels(): RecordLabelItem[] {
  const allLabels = getAllRecordLabels();
  return allLabels.filter(label => 
    label.LabelActive.toLowerCase() === 'true'
  );
}

/**
 * Get a random record label
 */
export function getRandomRecordLabel(): RecordLabelItem | null {
  const allLabels = getAllRecordLabels();
  if (allLabels.length === 0) return null;
  return allLabels[Math.floor(Math.random() * allLabels.length)];
}

/**
 * Get record label details by name
 */
export function getRecordLabelByName(name: string): RecordLabelItem | undefined {
  const allLabels = getAllRecordLabels();
  return allLabels.find(label => label.Name === name);
}

/**
 * Get all unique main genres from record labels
 */
export function getAllLabelGenres(): string[] {
  const allLabels = getAllRecordLabels();
  const genres = new Set(allLabels.map(label => label.ReleasesMainGenre));
  return Array.from(genres).filter(g => g && g.trim() !== '');
}

/**
 * Map genre string to MusicGenre enum for matching
 */
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
  };
  return genreMap[genreStr.toLowerCase()] || null;
}

/**
 * Get record labels that match a specific MusicGenre
 */
export function getRecordLabelsForGenre(genre: MusicGenre): RecordLabelItem[] {
  const genreStr = genre.toLowerCase();
  const allLabels = getAllRecordLabels();
  
  return allLabels.filter(label => {
    const labelGenre = label.ReleasesMainGenre.toLowerCase();
    
    // Direct match
    if (labelGenre === genreStr) return true;
    
    // Partial matches
    if (labelGenre.includes(genreStr) || genreStr.includes(labelGenre)) return true;
    
    // Map specific genres
    const mapped = mapGenreToMusicGenre(labelGenre);
    if (mapped === genre) return true;
    
    return false;
  });
}

// Re-export for use in other modules
export { mapGenreToMusicGenre };
