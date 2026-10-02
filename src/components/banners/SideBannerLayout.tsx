import type { ReactNode } from "react";
import SideBanner from "./SideBanner";
import type { BannerPage } from "@/hooks/useBanners";

/**
 * Moldura reutilizável "banner esquerdo | conteúdo | banner direito" — não
 * mexe em nada do conteúdo da página (ele entra como `children` sem
 * alterações), só reserva duas colunas fixas ao lado dele pra exibir banners
 * verticais. As colunas só aparecem a partir de telas bem largas (1800px+,
 * ver classe `3xl` no tailwind.config) — o container da página já trava em
 * 1400px de largura, então reservar espaço garantido evita que o banner
 * fique espremido ou sobreponha o conteúdo em notas/monitores comuns.
 *
 * Sem nenhum banner cadastrado pra essa página, o SideBanner não renderiza
 * nada — a página fica idêntica a hoje, só com uma faixa preta a mais nas
 * pontas (igual já é hoje), até o admin cadastrar o primeiro banner.
 */
const SideBannerLayout = ({ page, children }: { page: BannerPage; children: ReactNode }) => (
  <div className="mx-auto flex w-full max-w-[1920px] justify-center 3xl:gap-5 3xl:px-5">
    <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-[220px] shrink-0 3xl:block">
      <SideBanner page={page} position="LEFT" />
    </aside>

    <div className="min-w-0 flex-1">{children}</div>

    <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-[220px] shrink-0 3xl:block">
      <SideBanner page={page} position="RIGHT" />
    </aside>
  </div>
);

export default SideBannerLayout;
