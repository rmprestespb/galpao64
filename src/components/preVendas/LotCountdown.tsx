import { useEffect, useMemo, useState } from "react";
import { Timer } from "lucide-react";

const PADDED = (n: number, len = 2) => String(n).padStart(len, "0");

export const useCountdownTo = (iso: string) => {
  const target = useMemo(() => new Date(iso).getTime(), [iso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Atualiza a cada segundo pros segundos do contador andarem em tempo real.
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds, ended: diff <= 0 };
};

const LotCountdown = ({ closesAt }: { closesAt: string }) => {
  const { days, hours, minutes, seconds, ended } = useCountdownTo(closesAt);
  if (ended) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-red-200">
        <Timer className="h-3 w-3" />
        Lote encerrado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/40 bg-lime-400/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-lime-400">
      <Timer className="h-3 w-3" />
      Encerra em {days}d {PADDED(hours)}h {PADDED(minutes)}m {PADDED(seconds)}s
    </span>
  );
};

export default LotCountdown;
