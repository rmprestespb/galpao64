import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import mysterySilhouette from "@/assets/mystery-box-silhouette.jpg";

const TOTAL_BOXES = 50;

const COLLECTORS = [
  "João M.", "Maria S.", "Pedro L.", "Ana R.", "Lucas F.",
  "Carla T.", "Bruno A.", "Júlia P.", "Rafael C.", "Fernanda B.",
  "Diego N.", "Larissa K.", "Thiago V.", "Isabela G.", "Marcos D.",
  "Patrícia E.", "Ricardo O.", "Camila H.", "Felipe Z.", "Beatriz Q.",
];

// Real product photos shown after the lot is sold out. Using picsum as placeholder
// real-looking diecast photos. Replace with real product URLs when available.
const realPhoto = (i: number) =>
  `https://picsum.photos/seed/g64-mystery-${i}/600/600`;

type Box = {
  number: number;
  collector: string;
  productName: string;
  productImage: string;
};

function buildBoxes(): Box[] {
  return Array.from({ length: TOTAL_BOXES }, (_, i) => {
    const n = i + 1;
    const isPremium = n === 49;
    const isUltra = n === 50;
    return {
      number: n,
      collector: COLLECTORS[i % COLLECTORS.length],
      productName: isUltra
        ? "Hot Wheels RLC Exclusivo"
        : isPremium
          ? "Mini GT Premium"
          : `Hot Wheels Mainline #${n}`,
      productImage: realPhoto(n),
    };
  });
}

export default function MysteryBox() {
  const boxes = useMemo(buildBoxes, []);
  const [sold, setSold] = useState(0);

  const revealed = sold >= TOTAL_BOXES;
  const progressPct = (sold / TOTAL_BOXES) * 100;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-gradient-to-b from-background to-background/60">
        <div className="container mx-auto px-4 py-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              MYSTERY BOX
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Escolha sua caixa. O conteúdo só é revelado quando o lote completo for vendido.
          </p>

          <div className="mt-8 rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">
                  Progresso do Lote
                </p>
                <p className="text-2xl font-semibold">
                  <span className="text-cyan-400">{sold}</span>
                  <span className="text-muted-foreground"> de {TOTAL_BOXES} caixas vendidas</span>
                </p>
              </div>
              {revealed ? (
                <Badge className="bg-fuchsia-500/90 text-white">LOTE REVELADO</Badge>
              ) : (
                <Badge variant="outline" className="border-cyan-400/40 text-cyan-300">
                  Em andamento
                </Badge>
              )}
            </div>
            <Progress value={progressPct} className="mt-4 h-2" />

            {/* Dev / admin simulation controls */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSold(TOTAL_BOXES)}
              >
                Simular Lote Esgotado
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSold((s) => Math.min(TOTAL_BOXES, s + 1))}
              >
                +1 venda
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSold(0)}
              >
                Resetar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10">
          {boxes.map((box) => (
            <BoxCard key={box.number} box={box} revealed={revealed} />
          ))}
        </div>
      </section>
    </main>
  );
}

function BoxCard({ box, revealed }: { box: Box; revealed: boolean }) {
  return (
    <div
      className="group relative aspect-[3/4] [perspective:1000px]"
      aria-label={`Caixa ${box.number}`}
    >
      <div
        className={`relative h-full w-full rounded-lg transition-transform duration-700 [transform-style:preserve-3d] ${
          revealed ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* FRONT: mystery */}
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-fuchsia-500/30 bg-black [backface-visibility:hidden]">
          <img
            src={mysterySilhouette}
            alt=""
            loading="lazy"
            width={400}
            height={533}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-display text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(236,72,153,0.9)]"
              style={{ textShadow: "0 0 12px rgba(34,211,238,0.7)" }}
            >
              {String(box.number).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* BACK: revealed */}
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-cyan-400/40 bg-card [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <img
            src={box.productImage}
            alt={box.productName}
            loading="lazy"
            width={400}
            height={400}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 flex justify-between p-1.5">
            <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
              #{String(box.number).padStart(2, "0")}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2">
            <p className="line-clamp-1 text-[11px] font-semibold text-white">
              {box.productName}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[10px] text-cyan-300">
              Ganha por: {box.collector}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}