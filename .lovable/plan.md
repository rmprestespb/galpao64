Vou redesenhar a página de produto (Garage Pro Showcase) inspirada em sites de carros de luxo, conforme o mockup enviado.

## Estética geral
- Fundo preto puro (`#000`) com detalhes em **dourado champanhe** (`#D4AF7A` / `#E9C77B`) e cinza metálico.
- Tipografia: títulos em fonte Serif elegante (Playfair Display) para marca/seção; nome do produto em sans-serif Bold (Montserrat / Inter Black).
- Bordas arredondadas suaves, sombras profundas, leve brilho dourado nos hovers.

## Layout (desktop)
```
┌─────────────────────────────────────────────────────┐
│            CATÁLOGO DE ELITE  (serif dourado)       │
├──────────┬──────────────────────────────────────────┤
│ Thumb 1  │                                          │
│ Thumb 2  │       PALCO PRINCIPAL (foto/vídeo)       │
│ Thumb 3  │       16:9, bordas suaves                │
│ Thumb ▶  │       legenda inferior overlay           │
├──────────┴──────────────────────────────────────────┤
│  GLASS CARD: Nome bold + Série + Descrição          │
│              + Tags Raridade / Acabamento           │
├─────────────────────────────────────────────────────┤
│  GLASS CARD: Preço destaque dourado  [CTA dourado]  │
└─────────────────────────────────────────────────────┘
```
- Coluna esquerda: 4 thumbs verticais (3 fotos + 1 vídeo com ícone Play).
- Coluna direita: palco principal grande (até ~720px wide), alterna foto ↔ vídeo MP4 fullscreen com autoplay loop muted.
- Overlay sutil "VIDEO EM LOOP (CINEMATOGRÁFICO)" quando for vídeo.

## Glassmorphism
Os cards de descrição e preço terão:
- `bg-white/5`, `backdrop-blur-xl`, `border border-white/10`
- gradient highlight dourado no topo (`shadow-[inset_0_1px_0_rgba(212,175,122,0.25)]`)
- leve transparência para o palco aparecer atrás (vídeo continua tocando ao fundo).

## Especificações Técnicas
Nova seção em grid 4 colunas com ícones Lucide modernos:
- **Marca** (`Award`)
- **Série** (`Layers`)
- **Ano** (`Calendar`)
- **Raridade** (`Sparkles`)

Cada item: ícone dourado + label cinza maiúsculo espaçado + valor branco bold. Cards glass com hover dourado.

## CTA
- Botão "VER DETALHES NA LOJA" / "SOLICITAR DISPONIBILIDADE" em dourado sólido com texto preto bold, sombra dourada difusa, hover com brilho.
- Preço grande em dourado (`text-3xl font-black tracking-tight`).

## Mudanças no código
- **`src/components/GarageProShowcase.tsx`**: refazer todo o layout com a nova estrutura (palco + thumbs verticais + cards glass + grid de especificações). Manter API atual (looseImage, blisterImage, videoUrl, status, price_cents, series, description) e adicionar suporte opcional a `brand`, `year`, `rarity`.
- **`src/index.css`**: adicionar tokens semânticos `--gold`, `--gold-soft`, `--gold-glow` no design system (HSL) e fonte Playfair Display via Google Fonts.
- **`tailwind.config.ts`**: registrar `gold`, `gold-soft` e família `font-serif-display`.
- **`src/pages/Index.tsx`**: passar `rarity` (já existe no banco) para o componente; título da seção "CATÁLOGO DE ELITE" em serif dourado.

## Não muda
- Banco de dados, RLS, upload, webhook do Make.
- Lógica de WhatsApp e fluxo de reserva.
- Página /admin.