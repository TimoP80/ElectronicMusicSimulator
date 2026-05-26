/**
 * Release Section Wrapper Component
 * Combines ReleaseBuilder with the existing releases display
 */
import ReleaseBuilder from "./ReleaseBuilder";

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
  remixRequests?: any[];
  virtualArtists?: any[];
}

interface ReleaseSectionProps {
  gameState: GameState;
  onUpdateState: (state: GameState) => void;
}

export default function ReleaseSection({ gameState, onUpdateState }: ReleaseSectionProps) {
  const handleCreateRelease = (release: any) => {
    const track = gameState.tracks?.find((t: any) => t.id === release.selectedTracks[0]);
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
              return (
                <div key={rel.releaseId} className="bg-[#050507] p-4 rounded-xl border border-[#1A1A1E] space-y-3 shadow-md select-text relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-[#1A1A1E] pb-3">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="h-11 w-11 rounded-lg overflow-hidden border border-[#1A1A1E] bg-black flex-shrink-0 shadow-lg relative">
                        <img
                          src={rel.artworkUrl || `https://picsum.photos/seed/${encodeURIComponent(rel.title)}/100/100`}
                          alt={rel.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1 leading-none">
                          <span className="font-extrabold text-xs text-white uppercase tracking-tight truncate">{rel.title}</span>
                          <span className="text-[8px] font-mono tracking-wider bg-[#FF00FF]/15 border border-[#FF00FF]/30 px-2 py-0.5 rounded text-[#FF00FF] font-black uppercase">
                            SCORE: {totalScore}/100
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex gap-1.5 flex-wrap">
                          <span>Released: {rel.releaseDate}</span>
                          <span>| Genre: <strong className="text-[#00FF95]/90 font-bold">{rel.primaryGenre}</strong></span>
                          <span>| {rel.stats.bpm} bpm</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] sm:text-right text-left flex-shrink-0">
                      <span className="text-slate-500 block text-[9px] tracking-wide uppercase">TOTAL PLAYS</span>
                      <strong className="text-[#00FF95] font-extrabold">{rel.playCount.toLocaleString()} plays</strong>
                      <span className="block text-[8px] text-slate-400">Royalties: ${Math.round(rel.totalRoyaltiesEarned)}</span>
                    </div>
                  </div>
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
