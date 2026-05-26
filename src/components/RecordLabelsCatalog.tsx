/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Mail, CheckCircle2, ChevronRight, Ban, Award, FileSpreadsheet, Send, DollarSign, RefreshCw, Disc } from "lucide-react";
import { GameState, Track, RecordLabel } from "../types";
import { LABELS_DB } from "../utils/simulation";

interface RecordLabelsProps {
  gameState: GameState;
  onSignLabel: (labelId: string, advance: number, dealLength: number) => void;
  onReleaseWithLabel: (trackId: string, labelId: string) => void;
  onSelfRelease: (trackId: string) => void;
  preSelectedTrackId: string;
  setPreSelectedTrackId: (id: string) => void;
  onCreateOwnLabel: () => void;
  canCreateOwnLabel: boolean;
}

const getLabelArtwork = (labelId: string): string => {
  const seeds: { [key: string]: string } = {
    subterranean_clicks: "industrial_techno_concrete_logo",
    neonlyt_outrun: "neon_sunset_synthwave_logo",
    breakbeat_syndicate: "jungle_uk_drums_logo",
    aurora_heavenly: "melodic_trance_space_aurora_logo",
    vortex_records: "massive_edm_lasers_logo"
  };
  return `https://picsum.photos/seed/${seeds[labelId] || labelId}/240/120`;
};

export default function RecordLabelsCatalog({ 
  gameState, 
  onSignLabel, 
  onReleaseWithLabel, 
  onSelfRelease,
  preSelectedTrackId,
  setPreSelectedTrackId,
  onCreateOwnLabel,
  canCreateOwnLabel
}: RecordLabelsProps) {
  const [selectedLabel, setSelectedLabel] = useState<RecordLabel | null>(LABELS_DB[0]);
  const [pitchTrackId, setPitchTrackId] = useState("");
  const [arEmailReceived, setArEmailReceived] = useState<string | null>(null);
  const [loadingAr, setLoadingAr] = useState(false);

  // Synchronize pitchTrackId with preSelectedTrackId or fallback to the first track
  useEffect(() => {
    if (preSelectedTrackId) {
      setPitchTrackId(preSelectedTrackId);
    } else if (!pitchTrackId && gameState.tracks.length > 0) {
      setPitchTrackId(gameState.tracks[0].id);
    }
  }, [preSelectedTrackId, gameState.tracks]);

  const handleTrackChange = (newId: string) => {
    setPitchTrackId(newId);
    setPreSelectedTrackId(newId);
    setArEmailReceived(null);
  };

  const activeLabel = LABELS_DB.find(l => l.id === gameState.signedLabelId);

  // Submit unreleased demo to selected label
  const handlePitchDemo = async () => {
    if (!pitchTrackId || !selectedLabel) return;

    const track = gameState.tracks.find(t => t.id === pitchTrackId);
    if (!track) return;

    // Check minimum fans requirements
    const fanCap = gameState.stats.fans >= selectedLabel.requirements.minFans;
    const hypeCap = gameState.stats.hype >= selectedLabel.requirements.minHype;

    // Genre similarity check
    const matchesGenre = selectedLabel.preferredGenres.includes(track.primaryGenre) || 
                         (track.secondaryGenre && selectedLabel.preferredGenres.includes(track.secondaryGenre));

    const finalApproved = fanCap && hypeCap && (!selectedLabel.requirements.genreMatch || matchesGenre);

    setLoadingAr(true);
    setArEmailReceived(null);

    // Call server API for mock/real Gemini generated A&R message
    try {
      const response = await fetch("/api/generate-ai-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist: gameState.pseudonym || "Unknown Bedroom Producer",
          prestige: gameState.stats.prestige,
          genre: track.primaryGenre,
          labelName: selectedLabel.name,
        }),
      });
      const data = await response.json();
      
      setLoadingAr(false);
      
      if (finalApproved) {
        setArEmailReceived(data.email || `We received your email. We are fully excited about '${track.title}'! Let's sign it right now.`);
      } else {
        // Declined
        let reason = "Your following isn't quite large enough for our catalog needs yet.";
        if (selectedLabel.requirements.genreMatch && !matchesGenre) {
          reason = `This project style doesn't fit our usual releases pool—we are mostly looking for: ${selectedLabel.preferredGenres.join(", ")}.`;
        } else if (!hypeCap) {
          reason = "Our network requires active hype waves. Release some solid independent tracks to accumulate online buzz.";
        }
        setArEmailReceived(`[A&R Response] "Hey, thanks for submitting '${track.title}'. However, we'll have to pass on this particular demo. ${reason} Keep designing!"`);
      }
    } catch (err) {
      setLoadingAr(false);
      setArEmailReceived(`Hey ${gameState.pseudonym}, thanks for submitting the demo. Our catalog is full right now but keep grinding!`);
    }
  };

  const handleSignContract = () => {
    if (!selectedLabel) return;
    onSignLabel(selectedLabel.id, selectedLabel.signingAdvance, selectedLabel.dealLength);
    setArEmailReceived(null);
  };

  // Find the currently selected unreleased track object to display its live artwork inside the Pitch form
  const selectedPitchTrack = gameState.tracks.find(t => t.id === pitchTrackId);

  return (
    <div id="labels_view" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Signed Label HUD Panel */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-4.5 rounded-xl shadow-md">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            Current Contract
          </h3>
          
          {gameState.signedLabelId && activeLabel ? (
            <div className="space-y-3 mt-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-[#1A1A1E]">
                <div className="span text-[8px] text-slate-550 font-mono tracking-widest uppercase">PUBLISHER PARTNER</div>
                <div className="font-extrabold text-sm text-white">{activeLabel.name}</div>
                <div className="text-[10px] text-[#00FF95] font-mono mt-0.5">Prestige: {activeLabel.prestige}/100 Outlets</div>
              </div>

              {/* Publisher brand visual logo */}
              <div className="relative h-20 w-full rounded-lg overflow-hidden border border-[#1A1A1E] bg-black">
                <img
                  src={getLabelArtwork(activeLabel.id)}
                  alt={activeLabel.name}
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-xs space-y-1.5 font-mono text-slate-400 bg-slate-950/40 p-2.5 rounded border border-[#1A1A1E]">
                <div className="flex justify-between">
                  <span>Advance Seed:</span>
                  <strong className="text-emerald-400">${activeLabel.signingAdvance}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Royalty Split:</span>
                  <strong className="text-slate-200">{(activeLabel.royaltySplit * 100).toFixed(0)}% / Player</strong>
                </div>
                <div className="flex justify-between">
                  <span>Quota Remaining:</span>
                  <strong className="text-purple-400">{gameState.tracksDueToLabel} tracks</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 font-mono text-xs italic py-6 text-center">
              Signed to no label contract. Working as an independent DIY artist.
            </div>
          )}
          {!gameState.signedLabelId && (
            <div className="pt-2 border-t border-[#1A1A1E]">
              {canCreateOwnLabel ? (
                <button
                  onClick={onCreateOwnLabel}
                  className="w-full bg-gradient-to-r from-[#00FF95]/20 to-[#FF00FF]/20 hover:from-[#00FF95]/30 hover:to-[#FF00FF]/30 border border-[#00FF95]/30 text-[#00FF95] font-bold px-4 py-3 rounded-lg text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Disc className="h-4 w-4" />
                  Start Your Own Record Label
                </button>
              ) : (
                <div className="bg-[#050507]/50 p-3 rounded-lg text-center">
                  <p className="text-[10px] text-slate-500">Reach 500 fans and prestige 60+ to start your own imprint</p>
                  <div className="mt-2 flex gap-2 text-[9px] font-mono">
                    <div className="flex-1 bg-slate-800/50 rounded p-1.5">
                      <span className="text-slate-600">Fans: </span>
                      <span className={gameState.stats.fans >= 500 ? "text-green-400" : "text-slate-400"}>{gameState.stats.fans}/500</span>
                    </div>
                    <div className="flex-1 bg-slate-800/50 rounded p-1.5">
                      <span className="text-slate-600">Prestige: </span>
                      <span className={gameState.stats.prestige >= 60 ? "text-green-400" : "text-slate-400"}>{gameState.stats.prestige}/60</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Demo Pitch Panel */}
        <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-4.5 rounded-xl space-y-4 shadow-md">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-[#1A1A1E] pb-2 flex items-center gap-1.5">
            <Send className="h-4 w-4 text-purple-400" />
            Submit Demo & Publish
          </h3>

          {gameState.tracks.length > 0 ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-[#00FF95] uppercase tracking-widest mb-1.5 font-bold">Select Demo Project</label>
                <select
                  value={pitchTrackId}
                  onChange={(e) => handleTrackChange(e.target.value)}
                  className="w-full bg-slate-950 border border-[#1A1A1E] rounded-lg px-2.5 py-2 text-white text-xs focus:outline-hidden font-mono cursor-pointer"
                >
                  <option value="">-- Choose Finished Draft --</option>
                  {gameState.tracks.map((t) => (
                    <option key={t.id} value={t.id}>{t.title} ({t.primaryGenre})</option>
                  ))}
                </select>
              </div>

              {/* Live Preview of the track's custom album cover to pitch */}
              {selectedPitchTrack && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-[#1A1A1E] flex items-center gap-3">
                  <div className="h-14 w-14 rounded-lg overflow-hidden border border-[#212126] bg-black flex-shrink-0">
                    <img
                      src={selectedPitchTrack.artworkUrl || `https://picsum.photos/seed/${encodeURIComponent(selectedPitchTrack.title)}/100/100`}
                      alt={selectedPitchTrack.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-white block truncate uppercase tracking-tight">{selectedPitchTrack.title}</span>
                    <span className="text-[9px] font-mono text-[#00FF95] block">{selectedPitchTrack.primaryGenre} &bull; {selectedPitchTrack.stats.bpm} BPM</span>
                  </div>
                </div>
              )}

              {selectedLabel && pitchTrackId && (
                <div className="space-y-2 pt-1">
                  {gameState.signedLabelId ? (
                    /* Locked down to signed publisher catalog */
                    gameState.signedLabelId === selectedLabel.id ? (
                      <button
                        onClick={() => {
                          onReleaseWithLabel(pitchTrackId, selectedLabel.id);
                          setPitchTrackId("");
                        }}
                        className="w-full bg-purple-650 hover:bg-purple-600 font-sans text-xs py-2 rounded-lg font-bold text-slate-50 transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Deliver to {selectedLabel.name}
                      </button>
                    ) : (
                      <div className="text-[10.5px] font-mono text-rose-400 bg-rose-950/20 p-2.5 border border-rose-900/30 rounded leading-snug">
                        <Ban className="h-3.5 w-3.5 inline mr-1" />
                        Contract breach block! You must deliver tracks to your signed partner label: {activeLabel?.name}.
                      </div>
                    )
                  ) : (
                    /* Pitch Office A&R or Self-Release options */
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        onClick={handlePitchDemo}
                        disabled={loadingAr}
                        className="w-full bg-slate-800 hover:bg-slate-750 text-slate-100 font-sans text-xs py-2 rounded-lg font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Award className="h-4 w-4" />
                        Pitch to A&R Board
                      </button>
                      
                      {arEmailReceived?.includes("excited") && (
                        <button
                          onClick={() => {
                            onReleaseWithLabel(pitchTrackId, selectedLabel.id);
                            setPitchTrackId("");
                            setArEmailReceived(null);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-505 text-white font-sans text-xs py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Accept Signing Offer & Release
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onSelfRelease(pitchTrackId);
                          setPitchTrackId("");
                          setArEmailReceived(null);
                        }}
                        className="w-full bg-slate-950 hover:bg-[#111114] text-[#00FF95] border border-[#00FF95]/30 font-sans text-xs py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Self-Release Independently
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed mt-1 text-center py-2">
              No completed unreleased tracks in your studio drawers. Compile a demo in the DAW bedroom station first.
            </p>
          )}
        </div>

        {/* Release Advice Guide Box */}
        <div id="ar_intel_guidelines_card" className="bg-[#FF00FF]/5 border border-[#FF00FF]/25 p-4 rounded-xl space-y-2.5 text-xs font-mono shadow-md">
          <h4 className="text-[11px] uppercase tracking-wider text-[#FF00FF] font-bold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#FF00FF]" /> REVENUE & FAN GROWTH INTEL
          </h4>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Getting turned down by A&R? That is normal for green electronic producers!
          </p>
          <ul className="space-y-1.5 text-[10.5px] text-slate-300 font-sans list-disc list-inside">
            <li>
              <strong className="text-white font-semibold">DIY Self-Release</strong> has zero entry barriers. Get immediate plays and accumulate followers without label approvals!
            </li>
            <li>
              Once you hit <strong className="text-[#00FF95] font-semibold">300 fans</strong>, you can pitch the raw Berlin techno imprint <strong className="text-[#00FF95] font-semibold">Subterranean Clicks</strong> to kickstart proper legal catalog distributions.
            </li>
            <li>
              Match your track genres to the publisher's preferred styles to exponentially multiply your digital signing chance.
            </li>
          </ul>
        </div>
      </div>

      {/* Record Label Catalogs List */}
      <div className="lg:col-span-8 bg-[#0A0A0C] border border-[#1A1A1E] p-5 rounded-xl space-y-4 shadow-lg">
        <div>
          <h2 className="text-base font-sans font-semibold text-slate-100">Electronic Publishers Directory</h2>
          <p className="text-xs text-slate-400">Pitch finished demos to legal label executives or lock-in seed-funding split contracts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {LABELS_DB.map((label) => {
            const minFans = gameState.stats.fans >= label.requirements.minFans;
            const minHype = gameState.stats.hype >= label.requirements.minHype;

            return (
              <div
                key={label.id}
                onClick={() => {
                  setSelectedLabel(label);
                  setArEmailReceived(null);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group h-64 ${
                  selectedLabel?.id === label.id
                    ? "bg-slate-950 border-purple-500 text-slate-100"
                    : "bg-slate-950/40 border-slate-805 hover:border-slate-750 text-slate-400"
                }`}
              >
                <div>
                  {/* Label landscape brand graphic header */}
                  <div className="relative h-20 w-full rounded-lg overflow-hidden border border-[#1A1A1E] mb-2.5 bg-black">
                    <img
                      src={getLabelArtwork(label.id)}
                      alt={label.name}
                      className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-xs text-[7px] font-mono border border-slate-800 px-1.5 py-0.5 rounded text-white font-bold uppercase tracking-wider">
                      {label.id === "vortex_records" ? "MAINSTAGE OUTLET" : "UNDERGROUND CUT"}
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-1 leading-none">
                    <span className="font-bold text-xs text-slate-200 block truncate">{label.name}</span>
                    <span className="text-[8px] font-mono text-purple-400 font-bold bg-purple-950/50 border border-purple-800/30 px-1.5 py-0.5 rounded uppercase flex-shrink-0 select-none">
                      Level: {label.prestige}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 h-7">{label.description}</p>
                  
                  {/* Genre preference badges */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {label.preferredGenres.map((g) => (
                      <span key={g} className="text-[8.5px] font-mono bg-[#050507] border border-[#1A1A1E] px-1.5 py-0.5 rounded text-slate-300">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-[9.5px] font-mono text-slate-550 mb-0.5 leading-none">
                  <span>Adv: <strong className="text-emerald-400">${label.signingAdvance}</strong></span>
                  <span>Split: <strong className="text-slate-350">{(label.royaltySplit * 100).toFixed(0)}/{(100 - label.royaltySplit * 100).toFixed(0)}</strong></span>
                  <span>Len: <strong className="text-purple-400">{label.dealLength}t</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Label contract details */}
        {selectedLabel && (
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-purple-400 animate-pulse" />
                Pitch Office for {selectedLabel.name}
              </span>
              <div className="text-[9px] font-mono text-slate-500">
                {gameState.stats.fans < selectedLabel.requirements.minFans && "UNMET FANS REQUIREMENT"}
              </div>
            </div>

            {/* Simulated email reader / feedback logger */}
            {(arEmailReceived || loadingAr) && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs leading-relaxed font-mono relative overflow-hidden text-slate-300">
                {loadingAr ? (
                  <div className="flex items-center space-x-2 text-purple-400">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing pitch layers and calculating social sentiment indices...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{arEmailReceived}</div>
                )}
              </div>
            )}

            {/* Submission triggers */}
            {!gameState.signedLabelId && (
              <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-900">
                <button
                  type="button"
                  onClick={handleSignContract}
                  disabled={gameState.stats.fans < selectedLabel.requirements.minFans || gameState.stats.hype < selectedLabel.requirements.minHype}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white font-sans text-xs py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
                >
                  <DollarSign className="h-4 w-4 text-emerald-250" />
                  Sign Contract & Collect ${selectedLabel.signingAdvance} Seed Advance
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
