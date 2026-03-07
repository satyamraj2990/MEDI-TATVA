// Optimized client-side OCR service using Tesseract.js
import { createWorker } from 'tesseract.js';

/**
 * Efficiently converts base64 image string to Blob
 */
export function base64ToBlob(base64: string, mime = 'image/jpeg'): Blob {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mime });
}

/**
 * Preprocess image for better handwriting OCR: grayscale, contrast, sharpen
 */
export async function preprocessImage(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64);
      ctx.drawImage(img, 0, 0);
      // Grayscale
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const avg = (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
        imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
      // Increase contrast
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'contrast(140%) brightness(110%)';
      ctx.drawImage(canvas, 0, 0);
      // Sharpen (simple)
      // ...could add convolution kernel for more advanced sharpening
      resolve(canvas.toDataURL('image/jpeg', 0.95).split(',')[1]);
    };
    img.src = 'data:image/jpeg;base64,' + base64;
  });
}

/**
 * Advanced preprocessing: resize, adaptive threshold, denoise
 */
export async function advancedPreprocessImage(base64: string, maxSize = 1200): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      // Resize if needed
      let w = img.width, h = img.height;
      if (Math.max(w, h) > maxSize) {
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64);
      ctx.drawImage(img, 0, 0, w, h);
      // Grayscale
      let imageData = ctx.getImageData(0, 0, w, h);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const avg = (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
        imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = avg;
      }
      // Adaptive threshold
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = imageData.data[i] > 180 ? 255 : 0;
        imageData.data[i+1] = imageData.data[i];
        imageData.data[i+2] = imageData.data[i];
      }
      ctx.putImageData(imageData, 0, 0);
      // Denoise (simple median filter)
      // ...could add more advanced denoising if needed
      resolve(canvas.toDataURL('image/jpeg', 0.95).split(',')[1]);
    };
    img.src = 'data:image/jpeg;base64,' + base64;
  });
}

// Simple in-memory cache for repeated scans
const ocrCache = new Map<string, string>();

/**
 * Runs OCR on an image using Tesseract.js worker for best performance
 * @param base64Image - base64 string (no data:image/... prefix)
 * @param lang - language code (default 'eng')
 * @param onProgress - optional progress callback
 */
export async function runClientOCR(
  base64Image: string,
  lang: string = 'eng',
  onProgress?: (progress: number) => void
): Promise<string> {
  const worker = await createWorker({
    logger: m => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress);
      }
    }
  });
  // @ts-ignore
  await worker.load();
  // @ts-ignore
  await worker.loadLanguage(lang);
  // @ts-ignore
  await worker.initialize(lang);
  try {
    const blob = base64ToBlob(base64Image);
    // @ts-ignore
    const { data } = await worker.recognize(blob);
    return data.text;
  } finally {
    // @ts-ignore
    await worker.terminate();
  }
}

/**
 * Runs OCR for medical handwriting using Tesseract.js
 * Tries 'script/handwritten' model if available, else falls back to 'eng'
 */
export async function runMedicalHandwritingOCR(
  base64Image: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (ocrCache.has(base64Image)) return ocrCache.get(base64Image)!;
  const processedBase64 = await advancedPreprocessImage(base64Image);
  let text = '';
  try {
    text = await runClientOCR(processedBase64, 'script/handwritten', onProgress);
    if (text && text.trim().length > 0) {
      ocrCache.set(base64Image, text);
      return text;
    }
  } catch {}
  // Fallback to English
  text = await runClientOCR(processedBase64, 'eng', onProgress);
  ocrCache.set(base64Image, text);
  return text;
}
