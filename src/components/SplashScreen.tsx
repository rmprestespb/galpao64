import { useEffect, useRef, useState } from "react";
import showroomSplash from "@/assets/galpao-showroom-splash.jpg";

interface SplashScreenProps {
  onEnter: () => void;
}

/**
 * Synthesize a Ford Maverick V8 muscle engine startup via Web Audio API.
 * Sequence: starter crank (~0.6s) → ignition catch → deep V8 idle/rev (~2.4s).
 * No external asset — instant and reliable.
 */
const playEngineSound = () => {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const crankDur = 0.6;
    const totalDur = 3.2;

    // ---------- Master chain ----------
    const master = ctx.createGain();
    master.gain.value = 0.7;

    // Subtle drive/saturation via waveshaper for muscle-car grit
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const x = (i / 1023) * 2 - 1;
      curve[i] = Math.tanh(x * 2.2);
    }
    shaper.curve = curve;
    shaper.oversample = "4x";

    master.connect(shaper);
    shaper.connect(ctx.destination);

    // ===================================================
    // 1) STARTER CRANK — choppy, cyclical noise-bursts
    // ===================================================
    const crankBus = ctx.createGain();
    crankBus.gain.setValueAtTime(0.55, now);
    crankBus.gain.setValueAtTime(0.55, now + crankDur - 0.05);
    crankBus.gain.exponentialRampToValueAtTime(0.001, now + crankDur);
    crankBus.connect(master);

    const crankFilter = ctx.createBiquadFilter();
    crankFilter.type = "lowpass";
    crankFilter.frequency.value = 450;
    crankFilter.Q.value = 8;
    crankFilter.connect(crankBus);

    // Repeating crank "whirr" pulses (~7 Hz)
    const crankPulses = 5;
    for (let p = 0; p < crankPulses; p++) {
      const t = now + p * 0.12;
      const bufSize = Math.floor(ctx.sampleRate * 0.1);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.6, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      src.connect(g);
      g.connect(crankFilter);
      src.start(t);
      src.stop(t + 0.1);
    }

    // Low starter motor whine
    const starterOsc = ctx.createOscillator();
    starterOsc.type = "sawtooth";
    starterOsc.frequency.value = 90;
    const starterGain = ctx.createGain();
    starterGain.gain.setValueAtTime(0.0001, now);
    starterGain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
    starterGain.gain.exponentialRampToValueAtTime(0.001, now + crankDur);
    starterOsc.connect(starterGain);
    starterGain.connect(crankFilter);
    starterOsc.start(now);
    starterOsc.stop(now + crankDur);

    // ===================================================
    // 2) IGNITION CATCH — fat low-end thump
    // ===================================================
    const igniteTime = now + crankDur - 0.05;
    const thump = ctx.createOscillator();
    thump.type = "sine";
    thump.frequency.setValueAtTime(120, igniteTime);
    thump.frequency.exponentialRampToValueAtTime(40, igniteTime + 0.25);
    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0.0001, igniteTime);
    thumpGain.gain.exponentialRampToValueAtTime(0.9, igniteTime + 0.02);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, igniteTime + 0.35);
    thump.connect(thumpGain);
    thumpGain.connect(master);
    thump.start(igniteTime);
    thump.stop(igniteTime + 0.4);

    // ===================================================
    // 3) V8 ENGINE — deep idle settling into a soft rev
    // ===================================================
    const engStart = igniteTime;
    const engEnd = now + totalDur;

    const engineBus = ctx.createGain();
    engineBus.gain.setValueAtTime(0.0001, engStart);
    engineBus.gain.exponentialRampToValueAtTime(0.85, engStart + 0.15);
    engineBus.gain.setValueAtTime(0.85, engEnd - 0.6);
    engineBus.gain.exponentialRampToValueAtTime(0.0001, engEnd);
    engineBus.connect(master);

    // Lowpass — opens during the rev for that "throttle blip"
    const engineFilter = ctx.createBiquadFilter();
    engineFilter.type = "lowpass";
    engineFilter.Q.value = 4;
    engineFilter.frequency.setValueAtTime(700, engStart);
    engineFilter.frequency.exponentialRampToValueAtTime(900, engStart + 0.5);
    engineFilter.frequency.exponentialRampToValueAtTime(2400, engStart + 1.4);
    engineFilter.frequency.exponentialRampToValueAtTime(1300, engStart + 2.2);
    engineFilter.frequency.exponentialRampToValueAtTime(900, engEnd);
    engineFilter.connect(engineBus);

    // V8 firing fundamental ~ 35 Hz idle, rising to ~110 Hz on the blip
    // Build chord from low octaves for muscle-car richness
    const harmonics: Array<{ mult: number; type: OscillatorType; gain: number }> = [
      { mult: 1.0, type: "sawtooth", gain: 0.45 }, // fundamental
      { mult: 0.5, type: "sine", gain: 0.55 }, // sub-octave (chest thump)
      { mult: 2.0, type: "sawtooth", gain: 0.22 },
      { mult: 3.0, type: "square", gain: 0.12 },
      { mult: 4.0, type: "sawtooth", gain: 0.08 },
    ];

    const idleHz = 35;
    const revPeakHz = 110;
    const settleHz = 45;

    harmonics.forEach((h) => {
      const osc = ctx.createOscillator();
      osc.type = h.type;
      osc.frequency.setValueAtTime(idleHz * h.mult, engStart);
      // rough idle hold
      osc.frequency.linearRampToValueAtTime(idleHz * h.mult * 1.05, engStart + 0.5);
      // throttle blip
      osc.frequency.exponentialRampToValueAtTime(revPeakHz * h.mult, engStart + 1.4);
      // settle back
      osc.frequency.exponentialRampToValueAtTime(settleHz * h.mult, engStart + 2.4);
      osc.frequency.linearRampToValueAtTime(settleHz * h.mult, engEnd);

      const g = ctx.createGain();
      g.gain.value = h.gain;
      osc.connect(g);
      g.connect(engineFilter);
      osc.start(engStart);
      osc.stop(engEnd + 0.05);
    });

    // Slight detune layer for "lopey cam" muscle-car wobble
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 6.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain);
    lfoGain.connect(engineFilter.frequency);
    lfo.start(engStart);
    lfo.stop(engEnd);

    // Exhaust noise bed
    const noiseLen = Math.floor(ctx.sampleRate * (totalDur - crankDur));
    const nbuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const nd = nbuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = nbuf;
    const noiseBp = ctx.createBiquadFilter();
    noiseBp.type = "bandpass";
    noiseBp.frequency.value = 350;
    noiseBp.Q.value = 1.2;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, engStart);
    noiseGain.gain.exponentialRampToValueAtTime(0.18, engStart + 0.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.32, engStart + 1.4);
    noiseGain.gain.exponentialRampToValueAtTime(0.12, engStart + 2.4);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, engEnd);
    noise.connect(noiseBp);
    noiseBp.connect(noiseGain);
    noiseGain.connect(engineBus);
    noise.start(engStart);
    noise.stop(engEnd);

    setTimeout(() => ctx.close().catch(() => {}), (totalDur + 0.4) * 1000);
  } catch {
    // Audio failed — silent fallback
  }
};

const SplashScreen = ({ onEnter }: SplashScreenProps) => {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pressed, setPressed] = useState(false);
  const triggered = useRef(false);

  const handleEnter = () => {
    if (triggered.current) return;
    triggered.current = true;
    setPressed(true);
    // Wait for ignition catch (~0.6s) before opening the doors,
    // so the V8 thump syncs with the reveal.
    window.setTimeout(() => setOpening(true), 600);
    window.setTimeout(() => {
      onEnter();
      window.setTimeout(() => setHidden(true), 300);
    }, 2400);
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

      {/* Centered content (sits above doors but disappears as they slide) */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 py-6 pointer-events-auto transition-opacity duration-500 ${
          opening ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Full-bleed showroom artwork: rustic wooden garage at night with
            the doors open revealing legendary 1:64 diecast classics inside.
            The 'GALPÃO 64 — A ARTE DO DIECAST' metal sign is part of the
            artwork itself, integrated above the garage doors. */}
        <img
          src={showroomSplash}
          alt="Galpão 64 — galpão de madeira com portas abertas exibindo coleção de miniaturas diecast 1:64 lendárias: Ford Mustang verde, Chevrolet Opala vermelho e Porsche 911 preto"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out"
          style={{
            objectPosition: "center 40%",
            transform: pressed ? "scale(1.08)" : "scale(1)",
            filter: pressed ? "brightness(1.15) saturate(1.1)" : "brightness(1)",
          }}
        />

        {/* Golden flash overlay — pulses once on click for instant feedback */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out ${
            pressed ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at center 72%, rgba(245,216,150,0.55) 0%, rgba(245,216,150,0.15) 35%, transparent 65%)",
          }}
        />

        {/* Expanding ring anchored over the CTA button */}
        {pressed && (
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[86%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <span className="splash-cta-ring block rounded-full border-2 border-[#F5D896]" />
          </div>
        )}

        {/* The garage artwork doesn't have the CTA text painted on it, so
            it's rendered as a real HTML label sitting over the artwork.
            The entire splash stays clickable to enter the showroom. */}
        <button
          type="button"
          onClick={handleEnter}
          disabled={pressed}
          aria-label="Clique para entrar no showroom Galpão 64"
          className="absolute inset-0 h-full w-full cursor-pointer bg-transparent focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#F5D896] disabled:cursor-default"
        >
          <span
            className="absolute left-1/2 top-[86%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_30px_rgba(245,216,150,0.7)] transition-transform duration-300 sm:px-9 sm:py-4 sm:text-base"
            style={{ transform: `translate(-50%, -50%) scale(${pressed ? 0.94 : 1})` }}
          >
            Clique para entrar no showroom
          </span>
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;