/**
 * Fraud & Image Authenticity Detection Service
 * Computes SHA-256 hash using Web Crypto API and inspects image manipulation flags
 */

export async function computeSHA256Hash(file) {
  if (!file) return '';
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    console.error('SHA-256 computation error:', e);
    return `hash-${Date.now()}-${file.size}`;
  }
}

export async function inspectImageAuthenticity(file) {
  const flags = [];
  let isTampered = false;

  if (!file) return { isTampered: true, flags: ['No file provided'] };

  // 1. File Aspect Ratio & Dimension Check
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const width = img.width;
      const height = img.height;

      // Unusually small screenshot dimensions check
      if (width < 250 || height < 250) {
        flags.push('Image resolution too low or cropped');
        isTampered = true;
      }

      // Extreme horizontal/vertical ratio check (not a smartphone payment screen)
      const ratio = height / width;
      if (ratio < 0.6 || ratio > 3.2) {
        flags.push('Abnormal payment screen aspect ratio');
      }

      resolve({
        isTampered,
        flags,
        width,
        height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ isTampered: true, flags: ['Failed to load image canvas'] });
    };

    img.src = url;
  });
}
