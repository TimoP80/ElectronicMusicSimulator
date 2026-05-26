/**
 * Release Section Wrapper Component
 * Combines ReleaseBuilder with the existing releases display
 */
import ReleaseBuilder from "./ReleaseBuilder";
import { MusicGenre } from "../types";

interface Release {
  releaseId: string;
  title: string;
  trackId: string;
  primaryGenre: string;
  secondaryGenre?: string;
  stats: {
    bpm: number;
    mixingQuality: number;
    soundDesign: number;
    catchiness: number;
    groove: number;
  };
  releaseDate: string;
  playCount: number;
  totalRoyaltiesEarned: number;
  artworkUrl?: string;
  reviews?: string[];
  socialBuzz?: string[];
  catalogNumber?: string;
  labelName?: string;
  releaseType?: 'single' | 'ep' | 'album' | 'remix_ep';
}

interface Track {
  id: string;
  title: string;
  primaryGenre?: string;
  secondaryGenre?: string;
  stats?: {
    bpm: number;
    mixingQuality: number;
    soundDesign: number;
    catchiness: number;
    groove: number;
  };
}

interface GameState {
  tracks: Track[];
  releases: Release[];
  stats: { money: number };
  signedLabelId?: string;
  remixRequests?: any[];
  virtualArtists?: any[];
}

interface ReleaseSectionProps {
  gameState: GameState;
  onUpdateState: (state: GameState) => void;
}

// Helper to generate catalog number
function generateCatalogNumber(labelId: string | undefined, releaseType: string, index: number): string {
  const prefixes: Record<string, string> = {
    'single': 'SGL',
    'ep': 'EP',
    'album': 'ALB',
    'remix_ep': 'REMIX',
    'default': 'REL'
  };
  const prefix = prefixes[releaseType] || prefixes['default'];
  const labelCode = labelId ? labelId.substring(0, 3).toUpperCase() : 'DIY';
  return `${labelCode}-${prefix}-${String(index).padStart(3, '0')}`;
}

export default function ReleaseSection({ gameState, onUpdateState }: ReleaseSectionProps) {
  const handleCreateRelease = (release: any) => {
    const track = gameState.tracks?.find((t: any) => t.id === release.selectedTracks[0]);
    const labelId = gameState.signedLabelId;
    const releaseIndex = gameState.releases.length + 1;
    
    const newRelease: Release = {
      releaseId: `release_${Date.now()}`,
      title: release.title,
      trackId: release.selectedTracks[0],
      primaryGenre: track?.primaryGenre || 'Electronic',
      secondaryGenre: track?.secondaryGenre || '',
      stats: track?.stats || { bpm: 130, mixingQuality: 50, soundDesign: 50, catchiness: 50, groove: 50 },
      releaseDate: release.scheduledDate || new Date().toISOString().split('T')[0],
      playCount: 0,
      totalRoyaltiesEarned: 0,
      artworkUrl: release.coverUrl,
      reviews: [],
      socialBuzz: [],
      catalogNumber: generateCatalogNumber(labelId, release.type, releaseIndex),
      labelName: labelId ? `Label: ${labelId}` : 'Self-Released',
      releaseType: release.type,
    };
    onUpdateState({ ...gameState, releases: [...gameState.releases, newRelease] });
  };

  const handleRequestRemix = (trackId: string, requestedArtist: string) => {
    const track = gameState.tracks?.find((t: any) => t.id === trackId);
    const cost = 500;
    if (gameState.stats.money >= cost) {
      const remixRequest = {
        id: `remix_${Date.now()}`,
        trackId,
        trackName: track?.title || 'Unknown Track',
        requestedArtist: requestedArtist || 'Available Artist',
        cost,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      };
      onUpdateState({
        ...gameState,
        remixRequests: [...(gameState.remixRequests || []), remixRequest],
        stats: { ...gameState.stats, money: gameState.stats.money - cost }
      });
    }
  };

  return (
    <div className="space-y-4">
      <ReleaseBuilder
        availableTracks={gameState.tracks || []}
        existingReleases={gameState.releases.map((r: any) => ({ 
          id: r.releaseId, 
          title: r.title, 
          tracks: [r.trackId] 
        }))}
        gameState={gameState}
        onCreateRelease={handleCreateRelease}
        onRequestRemix={handleRequestRemix}
      />
      
      {/* Existing releases section */}
      <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-5 rounded-xl space-y-4 shadow-lg">
        <div>
          <h2 className="text-base font-display font-bold text-white tracking-tight">Rave Streaming Portal (Soundclash Analytics)</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage released catalogs, listen to critics reviews and digital streams feedback reels.</p>
        </div>

        {gameState.releases.length > 0 ? (
          <div className="space-y-4 mt-2">
            {gameState.releases.map((rel) => {
              const totalScore = Math.round((rel.stats.mixingQuality + rel.stats.soundDesign + rel.stats.catchiness + rel.stats.groove) / 4);
              const releaseTypeLabel = rel.releaseType === 'single' ? 'SINGLE' : rel.releaseType === 'ep' ? 'EP' : rel.releaseType === 'album' ? 'ALBUM' : 'RELEASE';
              const isSelfReleased = !rel.labelName || rel.labelName === 'Self-Released';
              
              return (
                <div key={rel.releaseId} className="bg-[#050507] p-4 rounded-xl border border-[#1A1A1E] space-y-3 shadow-md select-text relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-[#1A1A1E] pb-3">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="h-14 w-14 rounded-lg overflow-hidden border border-[#1A1A1E] bg-black flex-shrink-0 shadow-lg relative">
                        <img
                          src={rel.artworkUrl || `https://picsum.photos/seed/${encodeURIComponent(rel.title)}/100/100`}
                          alt={rel.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -top-0.5 -left-0.5 bg-[#FF00FF] text-black text-[6px] font-bold px-1 py-0.5 rounded">
                          {releaseTypeLabel}
                        </div>
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1 leading-none">
                          <span className="font-extrabold text-sm text-white uppercase tracking-tight truncate">{rel.title}</span>
                          <span className="text-[8px] font-mono tracking-wider bg-[#00FF95]/15 border border-[#00FF95]/30 px-2 py-0.5 rounded text-[#00FF95] font-black uppercase">
                            SCORE: {totalScore}/100
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex gap-2 flex-wrap">
                          <span>Released: {rel.releaseDate}</span>
                          <span className="text-slate-600">|</span>
                          <span>Genre: <strong className="text-[#00FF95]/90 font-bold">{rel.primaryGenre}</strong></span>
                          <span className="text-slate-600">|</span>
                          <span>{rel.stats.bpm} bpm</span>
                        </div>
                        {rel.catalogNumber && (
                          <div className="text-[9px] font-mono text-slate-500">
                            Catalog: <span className="text-[#FF00FF]/70">{rel.catalogNumber}</span>
                            {rel.labelName && (
                              <span className="ml-2 text-slate-600">|</span>
                            )}
                            {rel.labelName && (
                              <span className="ml-2 text-slate-400"> 
                                {isSelfReleased ? '🏠 Self-Released' : rel.labelName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] sm:text-right text-left flex-shrink-0">
                      <span className="text-slate-500 block text-[9px] tracking-wide uppercase">TOTAL PLAYS</span>
                      <strong className="text-[#00FF95] font-extrabold text-lg">{rel.playCount.toLocaleString()}</strong>
                      <span className="block text-[9px] text-slate-400 mt-0.5">Royalties: ${Math.round(rel.totalRoyaltiesEarned).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Reviews section */}
                  {rel.reviews && rel.reviews.length > 0 && (
                    <div className="pt-2 border-t border-[#1A1A1E]/50">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Reviews</div>
                      <div className="space-y-1">
                        {rel.reviews.slice(0, 2).map((review, i) => (
                          <div key={i} className="text-[9px] text-slate-400 font-mono italic line-clamp-1">{review}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-mono italic text-center py-8 bg-[#050507] rounded-lg border border-dashed border-[#1A1A1E]">
            No released tracks in catalog. Use the Release Builder above to compose an EP, or submit a finished bedroom demo to music labels.
          </p>
        )}
      </div>
    </div>
  );
}
