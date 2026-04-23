import { useEffect, useRef, useState } from "react";
import galpaoLogo from "@/assets/galpao64-logo.png";

interface SplashScreenProps {
  onEnter: () => void;
}

/**
 * Synthesize a supercar engine startup sound via Web Audio API.
 * No external asset needed — instant, reliable, no network dependency.
 */
const playEngineSound = () => {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const duration = 2.2;

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.55, now + 0.08);
    master.gain.exponentialRampToValueAtTime(0.35, now + 1.4);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    master.connect(ctx.destination);

    // Low-pass to soften
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 1.0);
    filter.frequency.exponentialRampToValueAtTime(1200, now + duration);
    filter.Q.value = 6;
    filter.connect(master);

    // Engine rumble — sawtooth oscillators with rising pitch (rev up)
    const freqs = [55, 82.5, 110, 165]; // root, fifth, octave, octave+fifth
    freqs.forEach((base, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sawtooth" : i === 1 ? "square" : "sawtooth";
      osc.frequency.setValueAtTime(base * 0.85, now);
      osc.frequency.exponentialRampToValueAtTime(base * 2.4, now + 0.9);
      osc.frequency.exponentialRampToValueAtTime(base * 1.6, now + duration);

      const g = ctx.createGain();
      g.gain.value = 0.25 / (i + 1);
      osc.connect(g);
      g.connect(filter);
      osc.start(now);
      osc.stop(now + duration);
    });

    // Noise burst for ignition
    const bufferSize = ctx.sampleRate * 0.4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 600;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);

    setTimeout(() => ctx.close().catch(() => {}), (duration + 0.3) * 1000);
  } catch {
    // Audio failed — silent fallback
  }
};

const SplashScreen = ({ onEnter }: SplashScreenProps) => {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);
  const triggered = useRef(false);

  const handleEnter = () => {
    if (triggered.current) return;
    triggered.current = true;
    playEngineSound();
    setOpening(true);
    // Match transition duration
    window.setTimeout(() => {
      onEnter();
      window.setTimeout(() => setHidden(true), 200);
    }, 1800);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") handleEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      aria-hidden={opening}
      role="dialog"
      aria-label="Tela de entrada Galpão 64"
    >
      {/* Left door */}
      <div
        className={`absolute top-0 left-0 h-full w-1/2 bg-black transition-transform duration-[1600ms] ease-[cubic-bezier(0.77,0,0.18,1)] pointer-events-auto ${
          opening ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 22px), radial-gradient(ellipse at 100% 50%, rgba(201,169,106,0.08), transparent 60%)",
          boxShadow: opening ? "20px 0 60px rgba(201,169,106,0.4)" : "none",
        }}
      />
      {/* Right door */}
      <div
        className={`absolute top-0 right-0 h-full w-1/2 bg-black transition-transform duration-[1600ms] ease-[cubic-bezier(0.77,0,0.18,1)] pointer-events-auto ${
          opening ? "translate-x-full" : "translate-x-0"
        }`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 22px), radial-gradient(ellipse at 0% 50%, rgba(201,169,106,0.08), transparent 60%)",
          boxShadow: opening ? "-20px 0 60px rgba(201,169,106,0.4)" : "none",
        }}
      />

      {/* Center seam glow on opening */}
      <div
        className={`absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 transition-opacity duration-700 ${
          opening ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(201,169,106,0.9), transparent)",
          boxShadow: "0 0 40px rgba(201,169,106,0.8)",
        }}
      />

      {/* Centered content (sits above doors but disappears as they slide) */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-auto transition-opacity duration-500 ${
          opening ? "opacity-0" : "opacity-100"
        }`}
      >
        <img
          src={galpaoLogo}
          alt="Galpão 64 — A Arte do Diecast"
          className="w-[260px] md:w-[360px] lg:w-[420px] h-auto drop-shadow-[0_0_60px_rgba(201,169,106,0.35)] splash-logo-enter"
        />

        <button
          type="button"
          onClick={handleEnter}
          className="mt-10 group relative inline-flex items-center justify-center border border-[#C9A96A]/70 bg-transparent px-10 py-3 text-xs tracking-[0.5em] text-[#C9A96A] transition-all duration-500 hover:bg-[#C9A96A] hover:text-black hover:shadow-[0_0_40px_rgba(201,169,106,0.55)] focus:outline-none focus:ring-2 focus:ring-[#C9A96A]/60"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <span className="absolute -left-6 top-1/2 h-px w-4 bg-[#C9A96A]/60 transition-all duration-500 group-hover:w-6" />
          GALPÃO 64
          <span className="absolute -right-6 top-1/2 h-px w-4 bg-[#C9A96A]/60 transition-all duration-500 group-hover:w-6" />
        </button>

        <p
          className="mt-6 text-[10px] uppercase tracking-[0.6em] text-white/40"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Clique para acelerar
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;