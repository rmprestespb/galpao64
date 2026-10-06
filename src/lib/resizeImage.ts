/**
 * Padroniza qualquer foto enviada no admin: corta (centralizado, sem distorcer)
 * na proporção alvo e redimensiona pro tamanho padrão, com suavização de alta
 * qualidade, exportando em WebP (ou JPEG se o navegador não suportar) com
 * qualidade ~92% — visualmente igual ao original, só que leve e uniforme.
 *
 * O corte é o mesmo `object-cover` que o site já faz nos cards, então o que o
 * admin vê na prévia é o que vai pro ar. GIF/SVG passam direto (não dá pra
 * rasterizar sem perder animação/vetor).
 */
export interface ResizeOptions {
  width: number;
  height: number;
  quality?: number;
}

const loadBitmap = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* cai pro <img> abaixo */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Não consegui abrir "${file.name}" como imagem.`));
      img.src = url;
    });
  } finally {
    // revoga depois do load; o bitmap/img já está em memória
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
};

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

export async function resizeImage(file: File, { width, height, quality = 0.92 }: ResizeOptions): Promise<File> {
  if (/^image\/(gif|svg)/.test(file.type)) return file;

  const src = await loadBitmap(file);
  const sw = "naturalWidth" in src ? src.naturalWidth : src.width;
  const sh = "naturalHeight" in src ? src.naturalHeight : src.height;
  if (!sw || !sh) throw new Error(`"${file.name}" parece estar corrompida.`);

  // Região de origem com a mesma proporção do alvo, centralizada (cover).
  const targetRatio = width / height;
  let cw = sw;
  let ch = sh;
  if (sw / sh > targetRatio) cw = sh * targetRatio;
  else ch = sw / targetRatio;
  const cx = (sw - cw) / 2;
  const cy = (sh - ch) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu processar a imagem.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, cx, cy, cw, ch, 0, 0, width, height);
  if ("close" in src) src.close();

  let blob = await toBlob(canvas, "image/webp", quality);
  if (!blob || blob.type !== "image/webp") {
    // Navegador sem encoder WebP: JPEG (sem transparência → fundo preto).
    const flat = document.createElement("canvas");
    flat.width = width;
    flat.height = height;
    const fctx = flat.getContext("2d")!;
    fctx.fillStyle = "#000";
    fctx.fillRect(0, 0, width, height);
    fctx.drawImage(canvas, 0, 0);
    blob = await toBlob(flat, "image/jpeg", quality);
  }
  if (!blob) throw new Error("Falha ao processar a imagem.");

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${base}.${ext}`, { type: blob.type });
}
