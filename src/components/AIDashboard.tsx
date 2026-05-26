/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AI Scene Dashboard - Displays simulated scene data
 * Shows releases from AI artists, news posts, and label activities
 */

import React, { useState } from 'react';
import { GameState, AIRelease, AINewsPost, LabelActivity } from '../types';
import { MusicGenre } from '../types';

interface AIDashboardProps {
  gameState: GameState;
}

// Genre colors for badges
const genreColors: Record<string, string> = {
  "Techno": "bg-purple-600",
  "Trance": "bg-blue-600",
  "House": "bg-green-600",
  "Drum & Bass": "bg-yellow-600",
  "Hardcore": "bg-red-600",
  "Psytrance": "bg-pink-600",
  "Hardstyle": "bg-orange-600",
  "default": "bg-gray-600"
};

const getGenreColor = (genre: string): string => {
  return genreColors[genre] || genreColors.default;
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  // Format: "Year X, Month Y, Week Z" -> "Y.X.M.Z"
  return dateStr.replace(/Year /, 'Y').replace(/, Month /, '.').replace(/, Week /, '.');
};

// Mock website URLs for labels
const getLabelWebsite = (labelName: string): string => {
  const slug = labelName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://${slug}-records.scene`;
};

const getArtistWebsite = (artistName: string): string => {
  const slug = artistName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://${slug}.scene-artists.com`;
};

const getReleasePage = (release: AIRelease): string => {
  const slug = release.trackTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  const artistSlug = release.artistName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://${artistSlug}-${slug}.scene-releases.com`;
};

export const AIDashboard: React.FC<AIDashboardProps> = ({ gameState }) => {
  const [activeTab, setActiveTab] = useState<'releases' | 'news' | 'labels'>('releases');

  const aiReleases = gameState.aiReleases || [];
  const aiNews = gameState.aiNews || [];
  const labelActivities = gameState.labelActivities || [];

  return (
    <div className="bg-[#0A0A0F] border border-[#1A1A1E] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1A2E] to-[#0A0A1F] px-4 py-3 border-b border-[#2A2A3E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF00FF]/20 to-[#00FF95]/20 flex items-center justify-center">
              <span className="text-lg">🌐</span>
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-white">Scene Monitor</h3>
              <p className="text-[10px] text-gray-400">Live AI Scene Activity</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-green-600/20 text-green-400 border border-green-600/30">
              {aiReleases.length} Releases
            </span>
            <span className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-600/30">
              {aiNews.length} News
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#1A1A1E]">
        <button
          onClick={() => setActiveTab('releases')}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'releases'
              ? 'bg-[#1A1A2E] text-[#00FF95] border-b-2 border-[#00FF95]'
              : 'text-gray-400 hover:text-white hover:bg-[#0A0A0F]'
          }`}
        >
          🎵 Releases ({aiReleases.length})
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'news'
              ? 'bg-[#1A1A2E] text-[#FF00FF] border-b-2 border-[#FF00FF]'
              : 'text-gray-400 hover:text-white hover:bg-[#0A0A0F]'
          }`}
        >
          📰 News ({aiNews.length})
        </button>
        <button
          onClick={() => setActiveTab('labels')}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'labels'
              ? 'bg-[#1A1A2E] text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white hover:bg-[#0A0A0F]'
          }`}
        >
          🏷️ Labels ({labelActivities.length})
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {activeTab === 'releases' && (
          <div className="p-3 space-y-2">
            {aiReleases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No AI releases yet</p>
                <p className="text-xs">Rest to advance the simulation</p>
              </div>
            ) : (
              aiReleases.slice().reverse().map((release) => (
                <div
                  key={release.id}
                  className="bg-[#0F0F15] border border-[#1A1A1E] rounded-lg p-3 hover:border-[#2A2A3E] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={getArtistWebsite(release.artistName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#00FF95] hover:underline truncate"
                        >
                          {release.artistName}
                        </a>
                        {release.isViral && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-600/20 text-red-400 border border-red-600/30">
                            🔥 VIRAL
                          </span>
                        )}
                      </div>
                      <a
                        href={getReleasePage(release)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-300 hover:text-white block truncate"
                      >
                        "{release.trackTitle}"
                      </a>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                        <span className={`px-1.5 py-0.5 rounded ${getGenreColor(release.genre)}`}>
                          {release.genre}
                        </span>
                        {release.labelName && (
                          <a
                            href={getLabelWebsite(release.labelName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline"
                          >
                            {release.labelName}
                          </a>
                        )}
                        <span className="text-gray-600">•</span>
                        <span>{release.format}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-mono text-[#00FF95]">
                        {(release.playCount / 1000).toFixed(1)}K
                      </div>
                      <div className="text-[10px] text-gray-500">plays</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="p-3 space-y-2">
            {aiNews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No news yet</p>
                <p className="text-xs">Rest to advance the simulation</p>
              </div>
            ) : (
              aiNews.slice().reverse().map((news) => (
                <div
                  key={news.id}
                  className="bg-[#0F0F15] border border-[#1A1A1E] rounded-lg p-3 hover:border-[#2A2A3E] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      news.category === 'scandal' ? 'bg-red-600/20 text-red-400' :
                      news.category === 'trend' ? 'bg-blue-600/20 text-blue-400' :
                      news.category === 'festival' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {news.category === 'scandal' ? '🚨' :
                       news.category === 'trend' ? '📈' :
                       news.category === 'festival' ? '🎪' :
                       news.category === 'collab' ? '🤝' :
                       '📰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500">
                          {news.category}
                        </span>
                        {news.date && (
                          <span className="text-[10px] text-gray-600">
                            {formatDate(news.date)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white leading-relaxed">{news.headline}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                        {news.relatedArtists.slice(0, 2).map((artist, i) => (
                          <span key={i} className="text-[#00FF95]">{artist}</span>
                        ))}
                        {news.hypeImpact !== 0 && (
                          <span className={news.hypeImpact > 0 ? 'text-green-400' : 'text-red-400'}>
                            {news.hypeImpact > 0 ? '+' : ''}{news.hypeImpact} hype
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'labels' && (
          <div className="p-3 space-y-2">
            {labelActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No label activity</p>
                <p className="text-xs">Rest to advance the simulation</p>
              </div>
            ) : (
              labelActivities.slice().reverse().map((activity) => (
                <div
                  key={activity.id}
                  className="bg-[#0F0F15] border border-[#1A1A1E] rounded-lg p-3 hover:border-[#2A2A3E] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'signing' ? 'bg-green-600/20 text-green-400' :
                      activity.type === 'release' ? 'bg-blue-600/20 text-blue-400' :
                      activity.type === 'tour' ? 'bg-yellow-600/20 text-yellow-400' :
                      activity.type === 'closure' ? 'bg-red-600/20 text-red-400' :
                      'bg-purple-600/20 text-purple-400'
                    }`}>
                      {activity.type === 'signing' ? '✍️' :
                       activity.type === 'release' ? '💿' :
                       activity.type === 'tour' ? '🎤' :
                       activity.type === 'closure' ? '💔' :
                       '🏆'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={getLabelWebsite(activity.labelName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-purple-400 hover:underline"
                        >
                          {activity.labelName}
                        </a>
                        <span className="text-[10px] uppercase tracking-wider text-gray-500">
                          {activity.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{activity.description}</p>
                      {activity.date && (
                        <span className="text-[10px] text-gray-600 mt-1 block">
                          {formatDate(activity.date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-2 border-t border-[#1A1A1E] bg-[#0A0A0F]">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>Active competitors: {(gameState.virtualArtists || []).length}</span>
          <span>Scene simulation active</span>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;