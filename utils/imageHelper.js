/**
 * Universal Image Helper for normalizing product & gallery media from databases
 * Handles strings, arrays, JSON strings, comma-separated URLs, and object formats.
 */

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80';

export const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='none'%3E%3Crect width='400' height='300' fill='%23f4f4f5'/%3E%3Cpath d='M170 130a20 20 0 1040 0 20 20 0 00-40 0zm-30 60l25-33a5 5 0 018 0l17 23 25-33a5 5 0 018 0l37 49H140z' fill='%23a1a1aa'/%3E%3Ctext x='50%25' y='82%25' text-anchor='middle' font-family='sans-serif' font-size='13' font-weight='600' fill='%2371717a'%3ENo Image Available%3C/text%3E%3C/svg%3E";

/**
 * Extracts and normalizes an array of valid image URL strings from any input format
 * @param {any} input Product object, gallery object, or raw image field
 * @returns {string[]} Array of clean, trimmed image URLs
 */
export function normalizeImages(input) {
  if (!input) return [];

  let raw = null;

  if (typeof input === 'object' && !Array.isArray(input)) {
    raw =
      input.images ??
      input.image ??
      input.imageUrl ??
      input.mediaUrl ??
      input.photo ??
      input.thumbnail ??
      input.banner ??
      input.url ??
      null;
  } else {
    raw = input;
  }

  if (!raw) return [];

  // Parse JSON string array if applicable: e.g. '["https://..."]'
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) raw = parsed;
      } catch {
        // Not valid JSON, keep as string
      }
    }
  }

  // Handle comma-separated strings (excluding base64 data URLs)
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.includes(',') && !trimmed.startsWith('data:')) {
      raw = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (trimmed.length > 0) {
      raw = [trimmed];
    } else {
      raw = [];
    }
  }

  if (!Array.isArray(raw)) {
    return [];
  }

  const cleaned = [];

  for (const item of raw) {
    if (!item) continue;
    if (typeof item === 'string') {
      const s = item.trim();
      if (s.length > 0) cleaned.push(s);
    } else if (typeof item === 'object') {
      const url =
        item.url ||
        item.src ||
        item.secure_url ||
        item.link ||
        item.path ||
        item.mediaUrl ||
        item.imageUrl;
      if (typeof url === 'string' && url.trim().length > 0) {
        cleaned.push(url.trim());
      }
    }
  }

  return cleaned;
}

/**
 * Normalizes a single product object so it is guaranteed to have:
 * - images: string[]
 * - image: string
 * - imageUrl: string
 */
export function normalizeProduct(product) {
  if (!product) return null;

  const images = normalizeImages(product);
  const primaryImage = images.length > 0 ? images[0] : '';

  return {
    ...product,
    images,
    image: primaryImage,
    imageUrl: primaryImage,
  };
}

/**
 * Normalizes a list of product objects
 */
export function normalizeProductList(products) {
  if (!Array.isArray(products)) return [];
  return products.map(normalizeProduct).filter(Boolean);
}

/**
 * Normalizes a gallery item so it is guaranteed to have:
 * - mediaUrl: string
 * - image: string
 * - imageUrl: string
 */
export function normalizeGalleryItem(item) {
  if (!item) return null;

  const images = normalizeImages(item);
  const mediaUrl =
    (typeof item.mediaUrl === 'string' && item.mediaUrl.trim().length > 0
      ? item.mediaUrl.trim()
      : null) ||
    (images.length > 0 ? images[0] : '') ||
    '';

  return {
    ...item,
    mediaUrl,
    image: mediaUrl,
    imageUrl: mediaUrl,
  };
}
