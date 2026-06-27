// 📁 PATH: src/lib/banner-helpers.js
// Helpers for resolving banner image URL + click href from backend Banner schema.

/**
 * Convert a banner.image (stored on the backend) into a usable <img src>.
 * Supports absolute URLs and relative paths served from the API "/storage" mount.
 */
export function getBannerImage(image, fallback = "") {
  if (!image) return fallback;
  if (/^https?:\/\//i.test(image)) return image;

  const base = process.env.NEXT_PUBLIC_API_URL || "";
  if (image.startsWith("/")) {
    // backend might already include /uploads/... — keep as-is, just prefix host
    const host = base.replace(/\/api\/?$/, "");
    return `${host}${image}`;
  }
  return `${base}/storage/${image}`;
}

/**
 * Resolve a banner's click destination based on linkType + linkValue.
 */
export function getBannerHref(banner) {
  if (!banner) return "#";
  const { linkType, linkValue } = banner;
  if (!linkValue) return "#";

  switch (linkType) {
    case "url":      return linkValue;
    case "product":  return `/shop/${linkValue}`;
    case "category": return `/category/${linkValue}`;
    case "brand":    return `/brand/${linkValue}`;
    case "page":     return `/${linkValue.replace(/^\/+/, "")}`;
    case "none":
    default:         return "#";
  }
}
