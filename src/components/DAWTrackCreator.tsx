/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Disc, Music, Layers, Zap, AlertCircle, Shuffle, ChevronRight, Sliders, AudioLines, Wand2, Sparkles } from "lucide-react";
import { MusicGenre, Track, GameState } from "../types";
import { GENRES_DB } from "../data/genres";
import { STEM_LOOPS, composeTrack, generateRandomTrackName } from "../utils/simulation";

interface TrackCreatorProps {
  gameState: GameState;
  onComposeTrack: (newTrack: Track) => void;
  onDeductInspiration: (amount: number) => void;
}

export default function DAWTrackCreator({ gameState, onComposeTrack, onDeductInspiration }: TrackCreatorProps) {
  const [trackName, setTrackName] = useState("");
  const [primaryGenre, setPrimaryGenre] = useState<MusicGenre>(MusicGenre.TECHNO);
  const [secondaryGenre, setSecondaryGenre] = useState<MusicGenre | null>(null);
  
  // Stem loop selections
  const [selectedBeat, setSelectedBeat] = useState(STEM_LOOPS.beat[0]);
  const [selectedBass, setSelectedBass] = useState(STEM_LOOPS.bass[0]);
  const [selectedSynth, setSelectedSynth] = useState(STEM_LOOPS.synth[0]);
  const [selectedFx, setSelectedFx] = useState(STEM_LOOPS.fx[0]);
  const [selectedVocal, setSelectedVocal] = useState(STEM_LOOPS.vocal[0]);

  const [ideasToSpend, setIdeasToSpend] = useState(2);
  const [composingProgress, setComposingProgress] = useState(-1);
  const [bpmInput, setBpmInput] = useState(135);
  const [artworkStyle, setArtworkStyle] = useState<"neon" | "mono" | "retro" | "liquid">("neon");

  // Track length settings
  const [lengthCategory, setLengthCategory] = useState<'radio_edit' | 'club_edit' | 'extended' | 'long_play' | 'megamix'>('club_edit');

  // Length category configurations
  const lengthCategories = [
    { 
      id: 'radio_edit' as const, 
      name: 'Radio Edit', 
      icon: '📻',
      description: '2:30-3:30', 
      durationRange: [150, 210],
      hint: 'Concise, streaming-friendly format. Perfect for Spotify playlists and radio airplay.'
    },
    { 
      id: 'club_edit' as const, 
      name: 'Club Edit', 
      icon: '🎧',
      description: '4:00-5:30', 
      durationRange: [240, 330],
      hint: 'Standard club mix length. The sweet spot for DJ sets and most streaming platforms.'
    },
    { 
      id: 'extended' as const, 
      name: 'Extended Mix', 
      icon: '🌙',
      description: '6:00-8:00', 
      durationRange: [360, 480],
      hint: 'Longer journey version. Ideal for extended sets, underground events, and festival drops.'
    },
    { 
      id: 'long_play' as const, 
      name: 'Long Play', 
      icon: '🔮',
      description: '10:00-15:00', 
      durationRange: [600, 900],
      hint: 'Deep ambient or progressive journey. For meditation sessions or immersive experiences.'
    },
    { 
      id: 'megamix' as const, 
      name: 'Megamix', 
      icon: '🎹',
      description: '20:00+', 
      durationRange: [1200, 2400],
      hint: 'Maximum length for endurance mixes, continuous DJ sets, or avant-garde experiments.'
    },
  ];

  // AI Assistant states inside DAW Creator
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [aiProductionTip, setAiProductionTip] = useState<string>("");
  const [loadingAiDaw, setLoadingAiDaw] = useState(false);

  const generateAiIdeas = async () => {
    setLoadingAiDaw(true);
    try {
      const res = await fetch("/api/generate-ai-daw-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryGenre,
          secondaryGenre,
          currentBPM: bpmInput,
          stems: {
            beat: selectedBeat,
            bass: selectedBass,
            synth: selectedSynth,
            fx: selectedFx,
            vocal: selectedVocal
          }
        })
      });
      const data = await res.json();
      if (data.titles) {
        setSuggestedTitles(data.titles);
      }
      if (data.instruction) {
        setAiProductionTip(data.instruction);
      }
    } catch (error) {
      console.warn("DAW AI Ideas network failed, loading offline content.", error);
      setSuggestedTitles(["Oscillator Drift", "Filter Sweep", "Decaying Hertz"]);
      setAiProductionTip("Pro-Tip: Try low-passing your reverb layers to keep high-end claps incredibly sharp and punchy.");
    } finally {
      setLoadingAiDaw(false);
    }
  };

  // Sync default BPM when genres change
  useEffect(() => {
    const defaultBpm = GENRES_DB[primaryGenre].bpmRange.default;
    setBpmInput(defaultBpm);
  }, [primaryGenre]);

  const randomizeTrackName = () => {
    setTrackName(generateRandomTrackName(primaryGenre, secondaryGenre));
    // Clear suggested titles when manually randomizing to keep UI clean
    setSuggestedTitles([]);
  };

  const handleCompose = () => {
    if (gameState.stats.inspiration < ideasToSpend) {
      alert("Not enough Inspiration! Take a break, browse record stores, or rest to recharge your creative cells.");
      return;
    }

    // Calculate duration based on selected length category
    const selectedLengthConfig = lengthCategories.find(l => l.id === lengthCategory);
    const minDuration = selectedLengthConfig?.durationRange[0] || 240;
    const maxDuration = selectedLengthConfig?.durationRange[1] || 330;
    const durationSeconds = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;

    // Format duration as MM:SS for display
    const formatDuration = (secs: number) => {
      const mins = Math.floor(secs / 60);
      const seconds = secs % 60;
      return `${mins}:${seconds.toString().padStart(2, '0')}`;
    };

    setComposingProgress(0);
    onDeductInspiration(ideasToSpend);

    const interval = setInterval(() => {
      setComposingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const stems = {
              beat: selectedBeat,
              bass: selectedBass,
              synth: selectedSynth,
              fx: selectedFx,
              vocal: selectedVocal,
            };

            const track = composeTrack(
              trackName || generateRandomTrackName(primaryGenre, secondaryGenre),
              primaryGenre,
              secondaryGenre,
              stems,
              gameState.gear,
              gameState.skills,
              ideasToSpend
            );

            // Inject global customized parameters
            track.stats.bpm = bpmInput;
            track.artworkUrl = `https://picsum.photos/seed/${encodeURIComponent(track.title)}_${artworkStyle}/300/300`;
            
            // Add length category and duration
            track.lengthCategory = lengthCategory;
            track.durationSeconds = durationSeconds;
            
            // Set version name based on length
            const versionNames: Record<string, string> = {
              'radio_edit': 'Radio Edit',
              'club_edit': 'Club Mix',
              'extended': 'Extended Mix',
              'long_play': 'Long Play',
              'megamix': 'Megamix'
            };
            track.versionName = versionNames[lengthCategory] || 'Original Mix';

            onComposeTrack(track);
            setComposingProgress(-1);
            setTrackName(""); // Reset
          }, 300);
          return 100;
        }
        return prev + 12;
      });
    }, 150);
  };

  return (
    <div id="daw_composer_card" className="bg-[#0A0A0C] border border-[#1A1A1E] p-5 rounded-xl shadow-2xl relative overflow-hidden neon-border">
      
      {/* Background synth knobs aesthetics */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <AudioLines className="h-64 w-64 text-slate-450" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1A1A1E] pb-4 mb-4 gap-2 relative z-10">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[#00FF95]" />
            Bedroom DAW Station
          </h2>
          <p className="text-xs text-slate-400">Assemble sonic loops, synthesize waveforms, and mix original stems.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-[#050507] px-3 py-1.5 rounded-lg border border-[#1A1A1E]">
          <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span className="text-slate-400">Creative Core:</span>
          <strong className="text-white">{gameState.stats.inspiration} Ideas</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left main section: Loop module controls & metadata */}
        <div className="lg:col-span-8 space-y-5">
          {/* Track metadata section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-[#00FF95] uppercase tracking-widest mb-1.5 font-bold">Track Project Title</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Electric Dreams"
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  maxLength={36}
                  disabled={composingProgress >= 0}
                  className="flex-1 bg-[#050507] border border-[#1A1A1E] rounded-lg px-3 py-2 text-white text-sm focus:outline-hidden focus:border-[#00FF95]/60 focus:ring-1 focus:ring-[#00FF95]/60 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={randomizeTrackName}
                  title="Generate Random Rave Name"
                  disabled={composingProgress >= 0}
                  className="bg-[#111114] hover:bg-[#1A1A1E] text-slate-300 p-2.5 rounded-lg border border-[#1A1A1E] flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                >
                  <Shuffle className="h-4 w-4 text-[#FF00FF]" />
                </button>
              </div>

              {/* AI DAW Suggestions Trigger and Output */}
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={generateAiIdeas}
                  disabled={loadingAiDaw || composingProgress >= 0}
                  className="text-[9px] font-mono text-[#00FF95]/90 hover:text-[#00FF95] bg-[#111114] border border-[#00FF95]/30 hover:border-[#00FF95]/70 px-2 py-1 rounded transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Wand2 className="h-2.5 w-2.5 text-[#00FF95]" />
                  {loadingAiDaw ? "Generating ideas..." : "Brainstorm with AI Studio"}
                </button>
                <span className="text-[9px] text-slate-500 font-mono">DAW BPM: {bpmInput}</span>
              </div>

              {suggestedTitles.length > 0 && (
                <div className="mt-2.5 space-y-1.5 bg-slate-950 border border-slate-900 p-2.5 rounded-lg">
                  <span className="block text-[8px] font-mono uppercase tracking-widest text-[#FF00FF] font-bold">Recommended Titles (Click to set):</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {suggestedTitles.map((t, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setTrackName(t);
                          // Clear this choice list slightly
                        }}
                        className="text-[9.5px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md hover:border-[#00FF95] hover:text-[#00FF95] transition-all cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiProductionTip && (
                <div className="mt-2.5 p-2 bg-[#00FF95]/5 border border-[#00FF95]/15 rounded-md text-[9.5px] font-mono text-slate-400 leading-normal flex items-start gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#00FF95] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">EQ Master-Tip:</strong> {aiProductionTip}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#00FF95] uppercase tracking-widest mb-1.5 font-bold">Genre Hybridization</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    value={primaryGenre}
                    onChange={(e) => setPrimaryGenre(e.target.value as MusicGenre)}
                    disabled={composingProgress >= 0}
                    className="w-full bg-[#050507] border border-[#1A1A1E] rounded-lg px-2.5 py-2.5 text-white text-xs focus:outline-hidden focus:border-[#00FF95]/60 font-mono cursor-pointer"
                  >
                    {Object.values(MusicGenre).map((g) => (
                      <option key={g} value={g}>{g} (Primary)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={secondaryGenre || ""}
                    onChange={(e) => setSecondaryGenre(e.target.value ? (e.target.value as MusicGenre) : null)}
                    disabled={composingProgress >= 0}
                    className="w-full bg-[#050507] border border-[#1A1A1E] rounded-lg px-2.5 py-2.5 text-slate-300 text-xs focus:outline-hidden focus:border-[#00FF95]/60 font-mono cursor-pointer"
                  >
                    <option value="">Pure (No Hybrid)</option>
                    {Object.values(MusicGenre).filter(g => g !== primaryGenre).map((g) => (
                      <option key={g} value={g}>+ {g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Modular Stems selections Rack */}
          <div>
            <h3 className="text-[11px] font-mono text-[#00FF95] uppercase tracking-widest mb-2 flex items-center gap-1.5 font-bold">
              <Layers className="h-3.5 w-3.5 text-[#00FF95]" /> LAYERED LOOP MODULES (VIRTUAL EURORACK)
            </h3>
            <div className="space-y-2.5 bg-[#050507] p-3.5 rounded-lg border border-[#1A1A1E] text-slate-300">
              
              {/* Step: Drum Beat */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#111114] pb-2 last:border-0 last:pb-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-sm bg-[#FF00FF]/15 text-[#FF00FF] border border-[#FF00FF]/20 font-mono text-[9px] w-12 text-center font-bold">DRUM</div>
                  <span className="text-xs font-mono font-medium text-slate-400">Drum Pattern Stem:</span>
                </div>
                <select
                  value={selectedBeat}
                  onChange={(e) => setSelectedBeat(e.target.value)}
                  disabled={composingProgress >= 0}
                  className="bg-[#0A0A0C] border border-[#1A1A1E] text-white focus:border-[#00FF95] rounded px-2.5 py-1 text-xs cursor-pointer focus:outline-hidden font-mono"
                >
                  {STEM_LOOPS.beat.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Step: Basslines */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#111114] pb-2 last:border-0 last:pb-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-sm bg-blue-950/40 text-blue-400 border border-blue-900/35 font-mono text-[9px] w-12 text-center font-bold font-mono">BASS</div>
                  <span className="text-xs font-mono font-medium text-slate-400">Low-End Bass Synthesis:</span>
                </div>
                <select
                  value={selectedBass}
                  onChange={(e) => setSelectedBass(e.target.value)}
                  disabled={composingProgress >= 0}
                  className="bg-[#0A0A0C] border border-[#1A1A1E] text-white focus:border-[#00FF95] rounded px-2.5 py-1 text-xs cursor-pointer focus:outline-hidden font-mono"
                >
                  {STEM_LOOPS.bass.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Step: Synthesizer */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#111114] pb-2 last:border-0 last:pb-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-sm bg-[#FF00FF]/15 text-[#FF00FF] border border-[#FF00FF]/25 font-mono text-[9px] w-12 text-center font-bold font-mono">SYNTH</div>
                  <span className="text-xs font-mono font-medium text-slate-400">Chords & Lead Oscillator:</span>
                </div>
                <select
                  value={selectedSynth}
                  onChange={(e) => setSelectedSynth(e.target.value)}
                  disabled={composingProgress >= 0}
                  className="bg-[#0A0A0C] border border-[#1A1A1E] text-white focus:border-[#00FF95] rounded px-2.5 py-1 text-xs cursor-pointer focus:outline-hidden font-mono"
                >
                  {STEM_LOOPS.synth.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Step: Sound FX */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#111114] pb-2 last:border-0 last:pb-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-sm bg-amber-950/40 text-amber-450 border border-amber-900/35 font-mono text-[9px] w-12 text-center font-bold font-mono">AUX</div>
                  <span className="text-xs font-mono font-medium text-slate-400">White Noise & Sweeps:</span>
                </div>
                <select
                  value={selectedFx}
                  onChange={(e) => setSelectedFx(e.target.value)}
                  disabled={composingProgress >= 0}
                  className="bg-[#0A0A0C] border border-[#1A1A1E] text-white focus:border-[#00FF95] rounded px-2.5 py-1 text-xs cursor-pointer focus:outline-hidden font-mono"
                >
                  {STEM_LOOPS.fx.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Step: Vocals */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-sm bg-emerald-950/40 text-[#00FF95] border border-emerald-900/40 font-mono text-[9px] w-12 text-center font-bold font-mono">VOCAL</div>
                  <span className="text-xs font-mono font-medium text-slate-400">Acapella Hooks / Vocoder:</span>
                </div>
                <select
                  value={selectedVocal}
                  onChange={(e) => setSelectedVocal(e.target.value)}
                  disabled={composingProgress >= 0}
                  className="bg-[#0A0A0C] border border-[#1A1A1E] text-white focus:border-[#00FF95] rounded px-2.5 py-1 text-xs cursor-pointer focus:outline-hidden font-mono"
                >
                  {STEM_LOOPS.vocal.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Advanced sliders (BPM and Inspiration inputs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">
                <span>Grid Master BPM Clock</span>
                <span className="text-[#00FF95] font-bold">{bpmInput} BPM</span>
              </div>
              <div className="flex items-center space-x-3 bg-[#050507] p-2 rounded-lg border border-[#1A1A1E]">
                <span className="text-[10px] text-slate-500 font-mono">{GENRES_DB[primaryGenre].bpmRange.min}</span>
                <input
                  type="range"
                  min={GENRES_DB[primaryGenre].bpmRange.min}
                  max={GENRES_DB[primaryGenre].bpmRange.max}
                  value={bpmInput}
                  onChange={(e) => setBpmInput(Number(e.target.value))}
                  disabled={composingProgress >= 0}
                  className="flex-1 h-1 bg-[#111114] accent-[#00FF95] rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 font-mono">{GENRES_DB[primaryGenre].bpmRange.max}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">
                <span>Track Format Length</span>
                <span className="text-[#FF00FF] font-bold">{lengthCategories.find(l => l.id === lengthCategory)?.icon} {lengthCategories.find(l => l.id === lengthCategory)?.description}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 bg-[#050507] p-2 rounded-lg border border-[#1A1A1E]">
                {lengthCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setLengthCategory(cat.id)}
                    disabled={composingProgress >= 0}
                    title={cat.hint}
                    className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                      lengthCategory === cat.id
                        ? "bg-[#111114] border-[#FF00FF] text-[#FF00FF]"
                        : "bg-[#0A0A0C] border-[#1A1A1E] text-slate-500 hover:text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-base mb-0.5">{cat.icon}</div>
                    <div className="text-[8px] font-mono font-bold leading-tight">{cat.name.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
              <p className="text-[8px] text-slate-500 font-mono mt-1">
                {lengthCategories.find(l => l.id === lengthCategory)?.hint}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">
                <span>COMPOSITION DEPTH COMPLEXITY</span>
                <span className="text-[#FF00FF] font-bold">{ideasToSpend} Ideas</span>
              </div>
              <div className="flex items-center justify-between space-x-1 py-1 px-3 bg-[#050507] rounded-lg border border-[#1A1A1E]">
                <button
                  type="button"
                  onClick={() => setIdeasToSpend(Math.max(1, ideasToSpend - 1))}
                  disabled={composingProgress >= 0 || ideasToSpend <= 1}
                  className="text-slate-450 hover:text-white px-2.5 py-1 rounded-md bg-[#0A0A0C] border border-[#1A1A1E] font-bold text-center active:scale-95 cursor-pointer"
                >
                  -
                </button>
                <span className="text-[10px] font-mono text-slate-300">
                  {ideasToSpend === 1 ? "Simple Draft" : ideasToSpend === 2 ? "Balanced Mix" : ideasToSpend === 3 ? "Deep Frequency study" : ideasToSpend === 4 ? "Aesthetic Masterwork" : "Avant-Garde Waveform"}
                </span>
                <button
                  type="button"
                  onClick={() => setIdeasToSpend(Math.min(5, ideasToSpend + 1))}
                  disabled={composingProgress >= 0 || ideasToSpend >= 5}
                  className="text-slate-450 hover:text-white px-2.5 py-1 rounded-md bg-[#0A0A0C] border border-[#1A1A1E] font-bold text-center active:scale-95 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: EP Cover / Sleeves Designer preview box */}
        <div className="lg:col-span-4 bg-[#050507] p-4 rounded-xl border border-[#1A1A1E] flex flex-col justify-between h-full min-h-[340px]">
          <div className="space-y-4">
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#00FF95] flex items-center gap-1.5 font-bold">
              <Wand2 className="h-3.5 w-3.5 text-[#00FF95]" /> LP Cover Sleeve Designer
            </h3>
            
            {/* Realistic Square Sleeve Preview */}
            <div className={`relative aspect-square w-full rounded-xl overflow-hidden shadow-2xl border-2 transition-all duration-300 bg-black flex flex-col justify-between p-3.5 select-none ${
              artworkStyle === "neon" ? "border-[#FF00FF]/50 shadow-[#FF00FF]/15" :
              artworkStyle === "mono" ? "border-slate-700/50 shadow-slate-700/10" :
              artworkStyle === "retro" ? "border-amber-500/50 shadow-amber-500/10" :
              "border-cyan-400/50 shadow-cyan-400/10"
            }`}>
              {/* Blur-loaded abstract backing artwork */}
              <div className="absolute inset-0 pointer-events-none opacity-55 saturate-120 hover:scale-105 transition-transform duration-500">
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(trackName || "CoverArtSeed")}_${artworkStyle}/300/300`}
                  alt="Track Artwork Cover Preview"
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Sleeve headers */}
              <div className="relative z-10 flex justify-between items-start">
                <span className="bg-black/80 text-[7px] font-mono border border-slate-800 px-1.5 py-0.5 rounded text-[#00FF95] font-black uppercase tracking-wider">
                  STEREO MIX EP
                </span>
                <span className="bg-black/80 text-[7px] font-mono border border-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold">
                  {bpmInput} BPM
                </span>
              </div>

              {/* Dynamic Overlay Label Sticker */}
              <div className="relative z-10 bg-black/85 backdrop-blur-md p-2.5 rounded-lg border border-[#1A1A1E] shadow-xl w-full flex flex-col justify-between leading-none">
                <div className="space-y-0.5 mb-2">
                  <span className="text-[7px] font-mono tracking-wider text-[#FF00FF] uppercase block">
                    {primaryGenre} {secondaryGenre ? `/ ${secondaryGenre}` : ""}
                  </span>
                  <span className="text-[11px] font-bold text-white block truncate uppercase tracking-tight">
                    {trackName || "Unreleased Project"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-400 border-t border-[#111114] pt-2">
                  <span className="truncate max-w-[90px] text-slate-300 font-bold text-[8px]">{gameState.pseudonym || "Studio Artist"}</span>
                  <span className="text-slate-500 text-[6.5px]">REEL LABS v1.1</span>
                </div>
              </div>
            </div>

            {/* Sleeve Vibe select buttons */}
            <div className="space-y-1.5 pt-1">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Aesthetic Concept</span>
              <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                {[
                  { id: "neon", label: "PINK NEON", color: "border-[#FF00FF] text-[#FF00FF]" },
                  { id: "mono", label: "RAW MINIMAL", color: "border-slate-500 text-slate-300" },
                  { id: "retro", label: "VAPOR GRID", color: "border-amber-400 text-amber-500" },
                  { id: "liquid", label: "CYAN LIQUID", color: "border-cyan-400 text-cyan-400" }
                ].map(vibe => (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => setArtworkStyle(vibe.id as any)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all uppercase text-[8px] font-black cursor-pointer ${
                      artworkStyle === vibe.id
                        ? `bg-slate-900 ${vibe.color}`
                        : "bg-[#0A0A0C] border-[#1A1A1E] text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    {vibe.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <span className="text-[8px] text-slate-500 font-mono block mt-2 leading-tight uppercase">
            Aesthetic styling enhances your label approval rate and initial weekly stream traffic.
          </span>
        </div>
      </div>

      {/* Render Master Core actions */}
      <div className="mt-6 relative z-10">
        {composingProgress >= 0 ? (
          <div className="bg-[#050507] p-4.5 border border-[#FF00FF]/55 rounded-lg text-center animate-pulse magenta-glow">
            <div className="flex items-center justify-center space-x-2 text-[#FF00FF] font-mono text-xs mb-2.5">
              <Disc className="h-5 w-5 animate-spin" />
              <span>Mixing stems, routing aux effects & bouncing master audio wav... {composingProgress}%</span>
            </div>
            <div className="w-full bg-[#111114] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#00FF95] h-1.5 transition-all duration-100" style={{ width: `${composingProgress}%` }} />
            </div>
          </div>
        ) : (
          <button
            onClick={handleCompose}
            className="w-full bg-[#111114] hover:bg-[#1A1A1E] border border-[#00FF95]/70 text-[#00FF95] font-display font-bold py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-98 cursor-pointer neon-glow text-xs uppercase tracking-wider"
          >
            <Music className="h-4 w-4 text-[#00FF95]" />
            Compile & Render Original Track Waveform
            <ChevronRight className="h-4 w-4 text-[#00FF95]" />
          </button>
        )}
      </div>

      {/* Info Notice about Gear limits */}
      {gameState.gear.length <= 3 && (
        <div className="flex items-start bg-amber-500/5 border border-amber-500/25 p-3 rounded-xl mt-4 text-slate-400 gap-2 text-[10px] leading-relaxed font-mono relative z-10">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>DAW MONITOR LIMIT:</strong> Your sound design frequency ceiling is heavily bottlenecked by cheap stock equipment. Unlock high-fidelity gear in the <strong>Hardware Upgrades</strong> shop tab.
          </span>
        </div>
      )}
    </div>
  );
}
