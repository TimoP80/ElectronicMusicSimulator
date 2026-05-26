/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { Sliders, Activity, Zap, Radio, Volume2 } from "lucide-react";

interface VisualizerProps {
  bpm: number;
  energy: number;
  isPlaying: boolean;
  onFilterSweep?: (hp: number, lp: number) => void;
}

export default function AudioVisualizer({ bpm, energy, isPlaying, onFilterSweep }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [highPass, setHighPass] = useState(0); // 0-100
  const [lowPass, setLowPass] = useState(100); // 0-100
  const [resonance, setResonance] = useState(50); // 0-100
  const [volume, setVolume] = useState(80);
  const [audioOscillation, setAudioOscillation] = useState(0);

  // Trigger filter changes
  useEffect(() => {
    if (onFilterSweep) {
      onFilterSweep(highPass, lowPass);
    }
  }, [highPass, lowPass, onFilterSweep]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 120;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Draw background cyber grid lines
      ctx.strokeStyle = "rgba(0, 255, 149, 0.04)";
      ctx.lineWidth = 1;
      const gridSpacing = 20;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Frequency waves calculation
      // High-pass cuts the low waves (long waves), Low-pass cuts the high waves (short waves)
      const speed = isPlaying ? (bpm / 60) * 0.05 : 0.005;
      phase += speed;

      // Draw neon spectrum gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#00FF95"); // Neon green
      gradient.addColorStop(0.5, "#00DFFF"); // Neon cyan
      gradient.addColorStop(1, "#FF00FF"); // Magenta pink

      ctx.lineWidth = 2.5;

      // Draw 3 layers of oscillators with different frequencies
      const waveCount = 3;
      const intensity = isPlaying ? (energy / 100) * 25 + 5 : 2;

      // Modulate intensity based on volume
      const finalIntensity = intensity * (volume / 100);

      for (let w = 0; w < waveCount; w++) {
        ctx.strokeStyle = w === 0 ? gradient : w === 1 ? "rgba(255, 0, 255, 0.35)" : "rgba(0, 255, 149, 0.2)";
        ctx.beginPath();

        // HighPass flattens the left side; LowPass flattens the right side (simulated)
        for (let i = 0; i < width; i++) {
          const ratio = i / width;
          
          // Filter influence
          let filterAttenuation = 1.0;
          if (ratio * 100 < highPass) {
            // Cut low frequencies (left side of ratio)
            filterAttenuation *= Math.max(0, (ratio * 100 - highPass) / 10 + 1);
          }
          if (ratio * 100 > lowPass) {
            // Cut high frequencies (right side of ratio)
            filterAttenuation *= Math.max(0, (lowPass - ratio * 100) / 10 + 1);
          }

          // Sine oscillation
          const frequency = (0.01 + w * 0.015) * (1 + resonance / 50);
          const offsetPhase = phase * (w + 1) * 0.7;
          const y = midY + Math.sin(i * frequency + offsetPhase) * finalIntensity * filterAttenuation;

          if (i === 0) {
            ctx.moveTo(i, y);
          } else {
            ctx.lineTo(i, y);
          }
        }
        ctx.stroke();
      }

      // Draw active EQ feedback bars on upper bounds
      if (isPlaying) {
        ctx.fillStyle = "rgba(0, 255, 149, 0.07)";
        const barWidth = 4;
        const barGap = 3;
        const totalBars = Math.floor(width / (barWidth + barGap));
        for (let b = 0; b < totalBars; b++) {
          const barRatio = b / totalBars;
          let filterVal = 1.0;
          if (barRatio * 100 < highPass || barRatio * 100 > lowPass) filterVal = 0.2;

          const baseHr = Math.sin(b * 0.15 + phase * 2) * 15 + 20;
          const noiseHr = Math.random() * 8;
          const barHeight = Math.max(2, (baseHr + noiseHr) * (energy / 100) * filterVal);
          
          ctx.fillRect(b * (barWidth + barGap), height - barHeight, barWidth, barHeight);
        }
      }

      // Measure small oscillation state feedback
      setAudioOscillation(Math.round(Math.abs(Math.sin(phase) * (energy / 100) * 100)));

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animId);
    };
  }, [bpm, energy, isPlaying, highPass, lowPass, resonance, volume]);

  return (
    <div id="audio_visualizer_block" className="bg-[#0A0A0C] p-4 border border-[#1A1A1E] rounded-xl shadow-2xl relative overflow-hidden neon-border">
      {/* Visualizer Frame Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-[#00FF95] animate-pulse" />
          <span className="font-mono text-xs font-semibold uppercase text-white tracking-wider">HARDWARE OSCILLOSCOPE FILTER</span>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center text-[#FF00FF] animate-ping" style={{ display: isPlaying ? "inline-flex" : "none" }}>
            ●
          </span>
          <span className="text-white font-bold">{isPlaying ? "ACTIVE SIGNAL" : "SIGNAL STANDBY"}</span>
          <span>BPM: <strong className="text-[#00FF95]">{bpm}</strong></span>
          <span>SQUELCH: <strong className="text-[#FF00FF]">{audioOscillation}%</strong></span>
        </div>
      </div>

      {/* Actual Oscillocope Plot */}
      <div className="bg-[#050507] border border-[#1A1A1E] rounded-lg relative overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="block w-full h-[120px]" />
        
        {!isPlaying && (
          <div className="absolute inset-0 bg-[#050507]/80 backdrop-blur-xs flex flex-col items-center justify-center text-center">
            <Radio className="h-6 w-6 text-slate-500 animate-bounce mb-1" />
            <span className="text-slate-400 font-mono text-[10px]">STUDIO SIGNAL SILENT — COMPOSE TRACKS TO INITIATE OSCILLATION</span>
          </div>
        )}
      </div>

      {/* Sub-Sliders Controls: HighPass/LowPass Sweeper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-[11px] font-mono">
        <div>
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span>High-Pass (Hz)</span>
            <span className="text-[#00FF95] font-bold">{highPass * 20} Hz</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={highPass}
            onChange={(e) => setHighPass(Number(e.target.value))}
            className="w-full h-1 bg-[#111114] accent-[#00FF95] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span>Low-Pass (kHz)</span>
            <span className="text-[#FF00FF] font-bold">{(lowPass * 0.2).toFixed(1)} kHz</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={lowPass}
            onChange={(e) => setLowPass(Number(e.target.value))}
            className="w-full h-1 bg-[#111114] accent-[#FF00FF] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span>Rez Peak</span>
            <span className="text-cyan-400 font-bold">+{resonance}dB</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={resonance}
            onChange={(e) => setResonance(Number(e.target.value))}
            className="w-full h-1 bg-[#111114] accent-cyan-400 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span>Gain Feed</span>
            <span className="text-amber-400 font-bold">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1 bg-[#111114] accent-amber-400 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
