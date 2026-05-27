import React from "react";
import { ArtistIdentity, StagePersona, VisualAesthetic, FashionStyle, SocialPersonality } from "../types";

interface Props {
  identity: ArtistIdentity;
  prestige: number;
  onUpdateIdentity: (updates: Partial<ArtistIdentity>) => void;
}

const personas: { value: StagePersona; label: string; icon: string; desc: string }[] = [
  { value: "masked", label: "Masked Producer", icon: "🎭", desc: "Anonymous, mysterious, let the music speak" },
  { value: "visionary", label: "Visionary Artist", icon: "🔮", desc: "Pushing boundaries, artistic integrity" },
  { value: "hermit", label: "Studio Hermit", icon: "🧙", desc: "Reclusive, focused, let releases do the talking" },
  { value: "chaotic", label: "Chaotic Creator", icon: "🌀", desc: "Wild, unpredictable, genre-bending" },
  { value: "professional", label: "Professional", icon: "💼", desc: "Reliable, consistent, label-friendly" },
  { value: "underground", label: "Underground", icon: "🔊", desc: "Raw, authentic, scene-respected" },
  { value: "commercial", label: "Commercial Star", icon: "⭐", desc: "Mainstream appeal, brand partnerships" },
  { value: "cult_leader", label: "Cult Leader", icon: "🕯️", desc: "Dedicated following, unique vision" },
];

const aesthetics: { value: VisualAesthetic; label: string; icon: string }[] = [
  { value: "dark_industrial", label: "Dark Industrial", icon: "🏭" },
  { value: "neon_cyberpunk", label: "Neon Cyberpunk", icon: "🌃" },
  { value: "retro_outrun", label: "Retro Outrun", icon: "🌅" },
  { value: "minimalist", label: "Minimalist", icon: "◻️" },
  { value: "psychedelic", label: "Psychedelic", icon: "🌈" },
  { value: "glitch_core", label: "Glitch Core", icon: "📺" },
  { value: "ethereal", label: "Ethereal", icon: "✨" },
  { value: "vaporwave", label: "Vaporwave", icon: "💿" },
];

const fashionStyles: { value: FashionStyle; label: string; icon: string }[] = [
  { value: "streetwear", label: "Streetwear", icon: "🧢" },
  { value: "goth", label: "Goth", icon: "🖤" },
  { value: "cyberpunk", label: "Cyberpunk", icon: "🥽" },
  { value: "raver", label: "Raver", icon: "🌈" },
  { value: "minimal", label: "Minimal", icon: "⚫" },
  { value: "vintage", label: "Vintage", icon: "👔" },
  { value: "avant_garde", label: "Avant Garde", icon: "🎨" },
];

export default function ArtistIdentityPanel({ identity, prestige, onUpdateIdentity }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎨</span>
        <h3 className="text-lg font-bold text-white font-orbitron">Artist Identity</h3>
        <div className="ml-auto text-xs text-gray-400">
          Branding: <span className="text-green-400">{identity.brandingConsistency}%</span>
        </div>
      </div>

      {/* Stage Persona */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Stage Persona</h4>
        <div className="grid grid-cols-4 gap-2">
          {personas.map(p => (
            <button
              key={p.value}
              onClick={() => onUpdateIdentity({ stagePersona: p.value })}
              className={`p-2 rounded text-xs text-center transition ${
                identity.stagePersona === p.value
                  ? "bg-purple-900/50 border border-purple-600 text-purple-300"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-400 border border-transparent"
              }`}
            >
              <div className="text-lg mb-1">{p.icon}</div>
              <div className="font-medium">{p.label}</div>
              <div className="text-gray-500 mt-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Aesthetic */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Visual Aesthetic</h4>
        <div className="flex flex-wrap gap-2">
          {aesthetics.map(a => (
            <button
              key={a.value}
              onClick={() => onUpdateIdentity({ visualAesthetic: a.value })}
              className={`px-3 py-1 rounded text-xs transition ${
                identity.visualAesthetic === a.value
                  ? "bg-cyan-900/50 border border-cyan-600 text-cyan-300"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-400"
              }`}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fashion Style */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Fashion Style</h4>
        <div className="flex flex-wrap gap-2">
          {fashionStyles.map(f => (
            <button
              key={f.value}
              onClick={() => onUpdateIdentity({ fashionStyle: f.value })}
              className={`px-3 py-1 rounded text-xs transition ${
                identity.fashionStyle === f.value
                  ? "bg-pink-900/50 border border-pink-600 text-pink-300"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-400"
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Social Personality */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Social Personality</h4>
        <select
          value={identity.socialPersonality}
          onChange={(e) => onUpdateIdentity({ socialPersonality: e.target.value as SocialPersonality })}
          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
        >
          {["mysterious", "outspoken", "pretentious", "humble", "chaotic", "professional", "fan_friendly", "reclusive", "controversial"].map(p => (
            <option key={p} value={p}>{p.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {/* Aliases */}
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-gray-300 mb-1">Aliases</h4>
        <div className="flex flex-wrap gap-1">
          {identity.aliases.map((alias, i) => (
            <span key={i} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs">{alias}</span>
          ))}
        </div>
      </div>

      {/* Lore */}
      <div className="text-xs text-gray-500 italic border-t border-gray-700 pt-2 mt-2">
        {identity.lore}
      </div>
    </div>
  );
}
