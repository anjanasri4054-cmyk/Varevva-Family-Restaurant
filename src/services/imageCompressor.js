/**
 * Client-side image compressor using HTML5 Canvas
 * Compresses images > 3MB to < 1.5MB while retaining legibility for OCR
 */
export async function compressImage(file, maxSizeMB = 3, targetQuality = 0.82) {
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Max dimensions for OCR legibility
      const MAX_DIM = 1920;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(file);
          return;
        }
        const compressedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, 'image/jpeg', targetQuality);
    };

    img.onerror = (err) => resolve(file);
    reader.onerror = (err) => resolve(file);

    reader.readAsDataURL(file);
  });
}
