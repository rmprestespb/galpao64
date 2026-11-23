import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildReserveMessage,
  descriptionLines,
  formatDeadline,
  formatEta,
  getAvailabilityStatus,
  INTEGRAL_DISCOUNT_PCT,
  mapPresaleRow,
  slugifyBrand,
  type PresaleProductRow,
} from "./preVendas";

// toLocaleString("pt-BR") usa espaço "inquebrável" entre o R$ e o número;
// normaliza pra comparar com texto normal.
const norm = (s: string) => s.replace(/ /g, " ");

const row = (over: Partial<PresaleProductRow> = {}): PresaleProductRow =>
  ({
    id: "1",
    brand: "Mini GT",
    ref: "MGT00001",
    name: "Nissan Skyline",
    specs: null,
    description: null,
    image_url: "foto.jpg",
    hover_image_url: null,
    extra_image_url: null,
    full_price_cents: 20000,
    deposit_price_cents: 5000,
    eta_date: null,
    lot_code: null,
    lot_closes_at: null,
    lot_size: 12,
    units_reserved: 0,
    ...over,
  }) as PresaleProductRow;

describe("slugifyBrand", () => {
  it("transforma o nome da marca em slug de URL", () => {
    expect(slugifyBrand("Mini GT")).toBe("mini-gt");
    expect(slugifyBrand("Tarmac Works")).toBe("tarmac-works");
  });
  it("remove acentos e símbolos", () => {
    expect(slugifyBrand("Pôp  Race!!")).toBe("pop-race");
    expect(slugifyBrand("  Kaido---House  ")).toBe("kaido-house");
  });
});

describe("descriptionLines", () => {
  it("separa por linha e ignora linhas vazias", () => {
    expect(descriptionLines("a\n\n  b  \n")).toEqual(["a", "b"]);
  });
  it("aceita nulo", () => {
    expect(descriptionLines(null)).toEqual([]);
  });
});

describe("mapPresaleRow (preços)", () => {
  it("calcula o desconto integral de verdade (5%) a partir do preço de cada produto", () => {
    expect(INTEGRAL_DISCOUNT_PCT).toBe(5);
    const a = mapPresaleRow(row({ full_price_cents: 20000 }));
    const b = mapPresaleRow(row({ full_price_cents: 12000 }));
    expect(norm(a.full)).toBe("R$ 200,00");
    expect(norm(a.fullDiscounted)).toBe("R$ 190,00");
    expect(norm(b.fullDiscounted)).toBe("R$ 114,00"); // não é um valor fixo
  });
  it("saldo = total - sinal, e nunca fica negativo", () => {
    expect(norm(mapPresaleRow(row()).balance)).toBe("R$ 150,00");
    expect(norm(mapPresaleRow(row({ deposit_price_cents: 30000 })).balance)).toBe("R$ 0,00");
  });
  it("usa a foto principal quando não há foto de hover", () => {
    expect(mapPresaleRow(row()).hoverImage).toBe("foto.jpg");
    expect(mapPresaleRow(row({ hover_image_url: "hover.jpg" })).hoverImage).toBe("hover.jpg");
  });
});

describe("getAvailabilityStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("encerrada quando o lote esgotou, mesmo com prazo longe", () => {
    expect(getAvailabilityStatus("2027-01-01T00:00:00Z", 12, 12)).toBe("encerrada");
  });
  it("encerrada quando o prazo já passou", () => {
    expect(getAvailabilityStatus("2026-09-30T00:00:00Z", 0, 12)).toBe("encerrada");
  });
  it("fechando quando faltam 7 dias ou menos", () => {
    expect(getAvailabilityStatus("2026-10-05T00:00:00Z", 3, 12)).toBe("fechando");
  });
  it("aberta quando falta mais de 7 dias ou não há prazo", () => {
    expect(getAvailabilityStatus("2026-10-20T00:00:00Z", 3, 12)).toBe("aberta");
    expect(getAvailabilityStatus(null, 3, 12)).toBe("aberta");
  });
  it("lote de tamanho 0 não é tratado como esgotado", () => {
    expect(getAvailabilityStatus(null, 0, 0)).toBe("aberta");
  });
});

describe("datas", () => {
  it("formatEta mostra mês/ano com inicial maiúscula, ou 'Em breve'", () => {
    expect(formatEta("2027-06-15")).toBe("Junho/2027");
    expect(formatEta(null)).toBe("Em breve");
  });
  it("formatDeadline devolve null sem prazo", () => {
    expect(formatDeadline(null)).toBeNull();
  });
});

describe("buildReserveMessage", () => {
  const p = mapPresaleRow(row({ lot_code: "L1", eta_date: "2027-06-15" }));
  it("pagamento integral usa o valor COM desconto", () => {
    const msg = norm(buildReserveMessage(p, "full"));
    expect(msg).toContain("Pagamento integral (5% off)");
    expect(msg).toContain("*Valor:* R$ 190,00");
  });
  it("sinal usa o valor do sinal", () => {
    const msg = norm(buildReserveMessage(p, "deposit"));
    expect(msg).toContain("Sinal de reserva");
    expect(msg).toContain("*Valor:* R$ 50,00");
  });
  it("inclui modelo, referência, lote e previsão", () => {
    const msg = buildReserveMessage(p, "deposit");
    expect(msg).toContain("Nissan Skyline");
    expect(msg).toContain("MGT00001");
    expect(msg).toContain("L1");
    expect(msg).toContain("Junho/2027");
  });
});
