import { useState } from "react";
import { Loader2, Warehouse, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useGalpaoPhotos, type GalpaoPhotoRow } from "@/hooks/useGalpaoPhotos";

/**
 * Galeria "No Galpão" — fotos reais do espaço e do estoque do Galpão 64,
 * cadastradas manualmente pelo admin em /admin/no-galpao. Puramente visual,
 * sem preço nem reserva: é a vitrine física da loja pra quem quer ver o
 * ambiente antes de comprar.
 */
const NoGalpao = () => {
  const { photos, loading, error } = useGalpaoPhotos();
  const [selected, setSelected] = useState<GalpaoPhotoRow | null>(null);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Header />

      <section className="container py-10 md:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
            <Warehouse className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-white md:text-5xl">
            No Galpão
            <span className="bg-gradient-to-r from-primary via-[#ff8a3d] to-gold bg-clip-text text-transparent">.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60 md:text-base">
            Um pouco do nosso espaço, do estoque e das miniaturas guardadas por aqui —
            direto da garagem do Galpão 64.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="py-16 text-center text-sm text-white/50">
            Não foi possível carregar as fotos agora. Tenta recarregar a página.
          </p>
        ) : photos.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/50">
            Nenhuma foto publicada no momento — volte em breve.
          </p>
        ) : (
          <div className="mt-10 grid animate-premium-fade-in gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelected(photo)}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d0f] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption ?? "Foto do Galpão 64"}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3">
                    <p className="line-clamp-2 text-left text-[12px] font-medium text-white/90">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox simples — clique fora ou no X pra fechar. */}
      {selected && (
        <div
          role="dialog"
          aria-modal
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected.image_url}
              alt={selected.caption ?? "Foto do Galpão 64"}
              className="max-h-[85vh] w-full rounded-xl object-contain"
            />
            {selected.caption && (
              <p className="mt-3 text-center text-sm text-white/70">{selected.caption}</p>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default NoGalpao;
