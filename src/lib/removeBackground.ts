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

  return outCanvas.toDataURL("image/png");
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

  // 3 sample regions: front-left, center, back-right
  const regions: Array<{ sx: number; sy: number; s: number }> = [];
  const baseSide = Math.min(w, h) * 0.45;

  regions.push({ sx: w * 0.05, sy: h * 0.45, s: baseSide });
  regions.push({ sx: (w - baseSide) / 2, sy: (h - baseSide) / 2, s: baseSide });
  regions.push({ sx: w * 0.55, sy: h * 0.2, s: baseSide });

  return regions.slice(0, count).map((r) => {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, r.sx, r.sy, r.s, r.s, 0, 0, size, size);
    return c.toDataURL("image/png");
  });
};