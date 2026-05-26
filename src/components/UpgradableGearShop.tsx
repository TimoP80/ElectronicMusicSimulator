/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Laptop, Music, Headphones, VolumeX, ShoppingBag, Plus, Sparkles, CheckCircle2, Star } from "lucide-react";
import { GameState, GearItem } from "../types";
import { GEAR_DB } from "../data/gear";

interface GearShopProps {
  gameState: GameState;
  onBuyGear: (gearId: string, cost: number) => void;
}

const getGearArtwork = (itemId: string, category: string): string => {
  const seeds: { [key: string]: string } = {
    old_laptop: "retro_old_computer",
    studio_pc: "modern_watercooled_desktop",
    supercomputing_rig: "mainframe_server_cyberpunk",
    freeware_daw: "music_recording_software_interface",
    pro_daw: "ableton_studio_software_view",
    ai_integrated_daw: "neural_generative_music_tool",
    budget_headphones: "black_wired_earbuds",
    studio_headphones: "high_end_openback_monitoring_headphones",
    monitors_5inch: "pair_of_wood_studio_sound_monitors",
    professional_wall_monitors: "huge_acoustic_recording_speaker",
    cheap_midi: "25_keys_small_midi_controller",
    fm_synth: "vintage_synth_keyboards",
    analog_synth_mono: "analog_moog_synthesizer_instrument",
    drum_machine: "retro_analog_drum_composer_sequencer",
    modular_rack: "synthesizer_eurorack_with_patch_cables",
    blanket_acoustic: "folded_wool_heavy_blankets",
    foam_panels: "grey_acoustic_foam_pyramids",
    bass_traps: "wooden_acoustic_diffuser_panels",
    commercial_acoustic_design: "commercial_soundproof_recording_room",
    mixing_course: "sound_engineering_equalizer_mixing_knobs",
    hired_vocalist_contract: "girl_singing_to_vintage_microphone"
  };
  const seed = seeds[itemId] || `${category}_audio_gear`;
  return `https://picsum.photos/seed/${seed}/240/150`;
};

export default function UpgradableGearShop({ gameState, onBuyGear }: GearShopProps) {
  const [activeGearPitchId, setActiveGearPitchId] = React.useState<string | null>(null);
  const [gearPitches, setGearPitches] = React.useState<{ [key: string]: string }>({});
  const [loadingPitchIds, setLoadingPitchIds] = React.useState<{ [key: string]: boolean }>({});

  const fetchGearPitch = async (item: GearItem) => {
    if (gearPitches[item.id]) {
      setActiveGearPitchId(activeGearPitchId === item.id ? null : item.id);
      return;
    }

    setActiveGearPitchId(item.id);
    setLoadingPitchIds(prev => ({ ...prev, [item.id]: true }));

    try {
      const bonusVal = Object.values(item.statBonus)[0] || 5;

      const res = await fetch("/api/generate-ai-gear-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gearName: item.name,
          gearType: item.category,
          cost: item.cost,
          studioBonus: bonusVal
        })
      });
      const data = await res.json();
      if (data.pitch) {
        setGearPitches(prev => ({ ...prev, [item.id]: data.pitch }));
      }
    } catch (e) {
      console.warn("Failed to fetch gear pitch from dynamic backend", e);
      setGearPitches(prev => ({
        ...prev,
        [item.id]: `The ${item.name} enhances studio mixing precision and adds genuine micro-frequency detailing. Absolute hardware essential.`
      }));
    } finally {
      setLoadingPitchIds(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // Partition assets into tabs or lists
  const handleBuy = (item: GearItem) => {
    if (gameState.stats.money < item.cost) {
      alert("Not enough money! Perform DJ gigs, sign label contracts, or wait for release streaming royalties to accumulate funds.");
      return;
    }
    onBuyGear(item.id, item.cost);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "laptop":
        return <Laptop className="h-4 w-4 text-sky-400" />;
      case "headphones":
        return <Headphones className="h-4 w-4 text-emerald-400" />;
      case "synth":
      case "drum_machine":
        return <Music className="h-4 w-4 text-purple-400" />;
      case "acoustic":
        return <VolumeX className="h-4 w-4 text-rose-400" />;
      default:
        return <Star className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Gear Shop Banner HUD */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-sans font-semibold text-slate-100 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-400 animate-pulse" />
            Schub-Musik Hardware Shop
          </h2>
          <p className="text-xs text-slate-400">Unlock analog monosynths, dual-monitors, and room diffusers to boost Sound Design scores.</p>
        </div>

        <div className="bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg text-xs font-mono">
          <span className="text-slate-500 block">AVAILABLE BANKROLL</span>
          <strong className="text-emerald-400 text-sm font-black">${gameState.stats.money}</strong>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GEAR_DB.map((item) => {
          const isOwned = gameState.gear.includes(item.id);
          const canUnlock = gameState.stats.prestige >= item.unlockedAtPrestige;
          const meetsCost = gameState.stats.money >= item.cost;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all bg-slate-905 relative overflow-hidden ${
                isOwned
                  ? "border-emerald-600/30 text-slate-100 bg-[#0B0C0E]"
                  : canUnlock
                  ? "border-slate-800 hover:border-slate-755 text-slate-355 bg-[#090A0D]"
                  : "border-slate-950 opacity-40 text-slate-500 bg-slate-950/25"
              }`}
            >
              <div>
                {/* Hardware Visual Thumbnail Image */}
                <div className="relative h-28 w-full rounded-lg overflow-hidden border border-[#1A1A1E] mb-3 bg-black">
                  <img
                    src={getGearArtwork(item.id, item.category)}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-xs text-[7px] font-mono border border-slate-800 px-1.5 py-0.5 rounded text-white font-bold uppercase tracking-wider">
                    {item.category}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-1.5">
                      {getCategoryIcon(item.category)}
                      <span className="font-sans font-bold text-xs text-slate-200">{item.name}</span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 leading-snug">{item.description}</p>
                  
                  {/* Ask synthesis rep button */}
                  {!isOwned && canUnlock && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => fetchGearPitch(item)}
                        className="text-[9px] font-mono text-[#00FF95]/85 hover:text-[#00FF95] flex items-center gap-1 cursor-pointer transition-colors active:scale-95 bg-slate-950/40 hover:bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-900"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-purple-400" />
                        {activeGearPitchId === item.id ? "Minimize Sales Review" : "Ask Gear Agent Pitch"}
                      </button>
                    </div>
                  )}

                  {activeGearPitchId === item.id && (
                    <div className="p-2 bg-slate-950/85 border border-slate-900 rounded-lg text-[9px] font-mono text-slate-300 leading-normal italic relative">
                      {loadingPitchIds[item.id] ? (
                        <span className="animate-pulse flex items-center gap-1.5 text-[8px] uppercase text-purple-400">
                          <span className="h-1 w-1 bg-purple-400 rounded-full animate-ping"></span>
                          Agent is consulting manuals...
                        </span>
                      ) : (
                        <span>"{gearPitches[item.id]}"</span>
                      )}
                    </div>
                  )}
                  
                  {/* Stats Boost label details */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(item.statBonus).map(([stat, val]) => (
                      <span key={stat} className="text-[8.5px] font-mono bg-slate-950 border border-slate-850 text-purple-400 px-2 py-0.5 rounded">
                        +{val} {stat === "mixing" ? "Engineering" : stat === "soundDesign" ? "Sound Design" : "Inspiration"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trade actions */}
              <div className="mt-4 pt-3 border-t border-slate-950 flex justify-between items-center text-xs font-mono">
                {isOwned ? (
                  <div className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 border border-emerald-900/30 rounded w-full justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>OWNED STUDIOTOOLS</span>
                  </div>
                ) : !canUnlock ? (
                  <div className="text-[9px] text-slate-500 font-sans tracking-wide py-0.5 px-2 bg-slate-950 border border-slate-900 rounded w-full text-center">
                    Requires Level {item.unlockedAtPrestige} Prestige
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-emerald-400 font-black font-mono text-sm">${item.cost}</span>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!meetsCost}
                      className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                        meetsCost
                          ? "bg-emerald-600 hover:bg-emerald-500 text-slate-50 shadow-md shadow-emerald-900/10 active:scale-95 cursor-pointer"
                          : "bg-slate-950 text-slate-600 border border-slate-850 cursor-not-allowed"
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5 inline mr-0.5" />
                      Buy Setup
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
