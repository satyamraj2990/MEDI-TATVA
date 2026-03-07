// Tesseract.js OCR fallback for client-side image text extraction
import Tesseract from 'tesseract.js';

/**
 * Preprocess image for better OCR accuracy
 */
function preprocessImage(base64Image: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Optimize size - max 1920x1080 for faster processing
      let width = img.width;
      let height = img.height;
      const maxWidth = 1920;
      const maxHeight = 1080;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and enhance image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Increase contrast and brightness for better OCR
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const contrast = 1.3; // 30% more contrast
      const brightness = 10; // Slight brightness boost
      
      for (let i = 0; i < data.length; i += 4) {
        // Apply contrast and brightness
        data[i] = Math.min(255, Math.max(0, contrast * (data[i] - 128) + 128 + brightness));
        data[i + 1] = Math.min(255, Math.max(0, contrast * (data[i + 1] - 128) + 128 + brightness));
        data[i + 2] = Math.min(255, Math.max(0, contrast * (data[i + 2] - 128) + 128 + brightness));
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Return optimized base64
      resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
    };
    img.src = `data:image/jpeg;base64,${base64Image}`;
  });
}

export async function analyzeImageWithTesseract(base64Image: string): Promise<string> {
  console.time('⚡ Tesseract OCR');
  
  // Preprocess image for better accuracy and speed
  const optimizedImage = await preprocessImage(base64Image);
  
  // Convert base64 to blob
  const byteString = atob(optimizedImage);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: 'image/jpeg' });

  // Run Tesseract OCR with optimized settings
  const result = await Tesseract.recognize(blob, 'eng', {
    logger: m => {
      if (m.status === 'recognizing text') {
        console.log(`[Tesseract] Progress: ${Math.round(m.progress * 100)}%`);
      }
    },
    // Performance optimizations
    tessedit_pageseg_mode: Tesseract.PSM.AUTO, // Auto page segmentation
    preserve_interword_spaces: '1', // Better for prescriptions
  });
  
  console.timeEnd('⚡ Tesseract OCR');
  console.log(`📊 OCR Confidence: ${Math.round(result.data.confidence)}%`);
  
  return result.data.text;
}
