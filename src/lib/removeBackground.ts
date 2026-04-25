import { pipeline, env } from "@huggingface/transformers";

// Allow downloading models from the Hub
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_DIM = 1024;

let segmenterPromise: Promise<any> | null = null;
const getSegmenter = () => {
  if (!segmenterPromise) {
    segmenterPromise = pipeline("background-removal", "briaai/RMBG-1.4", {
      device: "webgpu",
    }).catch(() =>
      // fallback to wasm if webgpu unavailable
      pipeline("background-removal", "briaai/RMBG-1.4"),
    );
  }
  return segmenterPromise;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export type ManualCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const resizeIfNeeded = (img: HTMLImageElement) => {
  let { width, height } = img;
  if (width > MAX_DIM || height > MAX_DIM) {
    if (width > height) {
      height = Math.round((height * MAX_DIM) / width);
      width = MAX_DIM;
    } else {
      width = Math.round((width * MAX_DIM) / height);
      height = MAX_DIM;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
};

/**
 * Remove background from an image URL and return a PNG data URL with transparency.
 */
export const removeBackgroundFromUrl = async (src: string): Promise<string> => {
  const segmenter = await getSegmenter();
  const img = await loadImage(src);
  const canvas = resizeIfNeeded(img);
  const sourceCtx = canvas.getContext("2d")!;
  const sourceImageData = sourceCtx.getImageData(0, 0, canvas.width, canvas.height);

  // The pipeline can take a canvas / dataURL
  const result: any = await segmenter(canvas.toDataURL("image/png"));
  // result is an array of RawImage-like objects { data, width, height, channels }
  const out = Array.isArray(result) ? result[0] : result;

  // RMBG output: same WxH as input, single-channel mask OR rgba with bg removed.
  // The transformers.js background-removal pipeline already returns rgba with alpha.
  const outCanvas = document.createElement("canvas");
  outCanvas.width = out.width ?? canvas.width;
  outCanvas.height = out.height ?? canvas.height;
  const ctx = outCanvas.getContext("2d")!;

  if (out.data && (out.channels === 4 || out.data.length === outCanvas.width * outCanvas.height * 4)) {
    const imgData = new ImageData(
      new Uint8ClampedArray(out.data),
      outCanvas.width,
      outCanvas.height,
    );
    ctx.putImageData(imgData, 0, 0);
  } else if (out.data) {
    // Treat as alpha mask
    ctx.drawImage(canvas, 0, 0, outCanvas.width, outCanvas.height);
    const imageData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);
    const pixels = imageData.data;
    for (let i = 0; i < out.data.length; i++) {
      pixels[i * 4 + 3] = Math.round(out.data[i] * 255);
    }
    ctx.putImageData(imageData, 0, 0);
  } else {
    return canvas.toDataURL("image/png");
  }

  // Diecast-focused cleanup: keep the solid metallic chassis silhouette and suppress
  // faint cardboard/plastic blister residue that commonly survives generic masks.
  const cleaned = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);
  const pixels = cleaned.data;
  const srcPixels = sourceImageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = srcPixels[i] ?? pixels[i];
    const g = srcPixels[i + 1] ?? pixels[i + 1];
    const b = srcPixels[i + 2] ?? pixels[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const brightness = max / 255;
    const alpha = pixels[i + 3];

    // Transparent blister/card backing is usually bright, low-saturation and low-alpha.
    if (alpha < 82 || (alpha < 145 && brightness > 0.62 && saturation < 0.18)) {
      pixels[i + 3] = 0;
    } else if (alpha > 145) {
      pixels[i + 3] = Math.min(255, Math.round(alpha * 1.18));
    }
  }
  ctx.putImageData(cleaned, 0, 0);

  return outCanvas.toDataURL("image/png");
};

export const createManualCropDataUrl = async (
  src: string,
  crop: ManualCrop,
  outputSize = 1024,
): Promise<string> => {
  const img = await loadImage(src);
  const sx = Math.max(0, Math.min(img.naturalWidth - 1, crop.x * img.naturalWidth));
  const sy = Math.max(0, Math.min(img.naturalHeight - 1, crop.y * img.naturalHeight));
  const sw = Math.max(1, Math.min(img.naturalWidth - sx, crop.width * img.naturalWidth));
  const sh = Math.max(1, Math.min(img.naturalHeight - sy, crop.height * img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;
  const scale = Math.min(outputSize * 0.9 / sw, outputSize * 0.62 / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, sx, sy, sw, sh, (outputSize - dw) / 2, outputSize * 0.55 - dh / 2, dw, dh);
  return canvas.toDataURL("image/png");
};

/**
 * Generate N square zoom crops of an image (for thumbnails).
 * Returns data URLs.
 */
export const generateZoomCrops = async (
  src: string,
  count = 3,
  size = 256,
): Promise<string[]> => {
  const img = await loadImage(src);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // Smart zoom regions tuned for a die-cast car shot (typical 3/4 front view):
  // 1. Front wheel / headlight (lower-left area)
  // 2. Side chassis (horizontal mid-band, centered)
  // 3. Roof / interior (upper portion)
  const small = Math.min(w, h) * 0.28;
  const wide = Math.min(w, h) * 0.34;

  const regions: Array<{ sx: number; sy: number; sw: number; sh: number }> = [
    // Front wheel + headlight — bottom-left quadrant
    { sx: w * 0.06, sy: h * 0.55, sw: small, sh: small },
    // Side chassis — wide horizontal slice across the middle
    { sx: w * 0.18, sy: h * 0.42, sw: wide * 1.4, sh: wide * 0.7 },
    // Roof / interior — upper-center
    { sx: w * 0.28, sy: h * 0.12, sw: small * 1.2, sh: small },
  ];

  return regions.slice(0, count).map((r) => {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d")!;
    // clamp to image bounds
    const sx = Math.max(0, Math.min(w - 1, r.sx));
    const sy = Math.max(0, Math.min(h - 1, r.sy));
    const sw = Math.max(1, Math.min(w - sx, r.sw));
    const sh = Math.max(1, Math.min(h - sy, r.sh));
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
    return c.toDataURL("image/png");
  });
};