
const CLOUD_NAME   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const BASE_URL     = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

// ── File type detection ──────────────────────────────────────
const FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
  raw:   [], // everything else → raw (pdf, doc, xlsx, zip...)
};

function getResourceType(file) {
  if (FILE_TYPES.image.includes(file.type)) return 'image';
  if (FILE_TYPES.video.includes(file.type)) return 'video';
  return 'raw';
}

// ── Size limits ──────────────────────────────────────────────
const SIZE_LIMITS = {
  image: 10 * 1024 * 1024,  // 10MB
  video: 100 * 1024 * 1024, // 100MB
  raw:   20 * 1024 * 1024,  // 20MB
};

function validateFile(file) {
  const resourceType = getResourceType(file);
  const limit = SIZE_LIMITS[resourceType];
  if (file.size > limit) {
    const limitMB = limit / (1024 * 1024);
    throw new Error(`File size limit ${limitMB}MB এর বেশি (${resourceType})`);
  }
  return resourceType;
}

// ── Core single upload ───────────────────────────────────────
/**
 * একটা file Cloudinary-তে upload করে
 * @param {File} file
 * @param {Object} options
 * @param {string}   options.folder      - Cloudinary folder (default: 'moom24')
 * @param {Function} options.onProgress  - progress callback (0–100)
 * @param {string}   options.transformation - Cloudinary eager transformation string
 * @returns {Promise<UploadResult>}
 */
async function uploadOne(file, options = {}) {
  const {
    folder = 'moom24',
    onProgress = null,
    transformation = null,
  } = options;

  const resourceType = validateFile(file);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);
  if (transformation) formData.append('eager', transformation);

  const url = `${BASE_URL}/${resourceType}/upload`;

  // XHR দিয়ে progress track করা যায়, fetch দিয়ে হয় না
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url:          data.secure_url,        // https CDN url
          publicId:     data.public_id,          // delete করতে লাগবে
          resourceType: data.resource_type,      // image / video / raw
          format:       data.format,             // jpg, png, mp4...
          width:        data.width  || null,
          height:       data.height || null,
          size:         data.bytes,              // file size in bytes
          duration:     data.duration || null,   // video duration
          thumbnailUrl: data.eager?.[0]?.secure_url || null, // transformation result
        });
      } else {
        const err = JSON.parse(xhr.responseText);
        reject(new Error(err.error?.message || 'Upload failed'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.open('POST', url);
    xhr.send(formData);
  });
}

// ─────────────────────────────────────────────────────────────
//  PUBLIC API
// ─────────────────────────────────────────────────────────────

export const uploadService = {

  // ── 1. Single image ─────────────────────────────────────────

  uploadImage(file, options = {}) {
    return uploadOne(file, { folder: 'moom24/images', ...options });
  },

  // ── 2. Single video ─────────────────────────────────────────

  uploadVideo(file, options = {}) {
    return uploadOne(file, {
      folder: 'moom24/videos',
      transformation: 'w_400,h_300,c_fill/eo_3', // thumbnail first 3s
      ...options,
    });
  },

  // ── 3. Single raw file (PDF, DOC, ZIP...) ───────────────────

  uploadFile(file, options = {}) {
    return uploadOne(file, { folder: 'moom24/files', ...options });
  },

    // ── 4. Smart single upload (type auto-detect) ───────────────

  upload(file, options = {}) {
    const resourceType = getResourceType(file);
    if (resourceType === 'image') return this.uploadImage(file, options);
    if (resourceType === 'video') return this.uploadVideo(file, options);
    return this.uploadFile(file, options);
  },

  // ── 5. Multiple files with progress ───────────────────────────
  async uploadMany(files, options = {}) {
    const {
      onFileProgress    = null,
      onOverallProgress = null,
      stopOnError       = false,
      ...uploadOptions
    } = options;

    const fileArray = Array.from(files);
    const total     = fileArray.length;
    const progresses = new Array(total).fill(0);

    const updateOverall = () => {
      if (!onOverallProgress) return;
      const avg = progresses.reduce((s, p) => s + p, 0) / total;
      onOverallProgress(Math.round(avg));
    };

    const results = [];

    for (let i = 0; i < total; i++) {
      const file = fileArray[i];
      try {
        const result = await this.upload(file, {
          ...uploadOptions,
          onProgress: (pct) => {
            progresses[i] = pct;
            if (onFileProgress) onFileProgress(i, pct);
            updateOverall();
          },
        });
        progresses[i] = 100;
        updateOverall();
        results.push({ file, result, error: null });
      } catch (error) {
        progresses[i] = 0;
        results.push({ file, result: null, error });
        if (stopOnError) break;
      }
    }

    return results;
  },

  // ── 6. Delete ────────────────────────────────────────────────
  async deleteFile(publicId) {
    // Server-side API route দিয়ে delete করতে হবে
    // কারণ Cloudinary destroy API-তে api_secret লাগে (client-এ রাখা যাবে না)
    const res = await fetch('/api/upload/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
  },

  // ── 7. Optimistic upload helper ──────────────────────────────

  uploadWithPreview(file, onUrlChange, onProgress = null, onError = null) {
    let cancelled  = false;
    const localUrl = URL.createObjectURL(file);
    onUrlChange(localUrl);

    this.upload(file, { onProgress })
      .then((result) => {
        if (cancelled) return;
        URL.revokeObjectURL(localUrl);
        onUrlChange(result.url);
      })
      .catch((err) => {
        if (cancelled) return;
        if (onError) onError(err);
        // blob preview রেখে দাও — user দেখতে পাবে
      });

    // cancel function return করি যাতে component unmount হলে cleanup করা যায়
    return function cancel() {
      cancelled = true;
      URL.revokeObjectURL(localUrl);
    };
  },
};

// ── Folder constants — সব জায়গায় একই ব্যবহার করো ─────────────
export const UPLOAD_FOLDERS = {
  CATEGORY_IMAGES:  'moom24/categories',
  PRODUCT_IMAGES:   'moom24/products',
  BRAND_LOGOS:      'moom24/brands',
  BANNER_IMAGES:    'moom24/banners',
  USER_AVATARS:     'moom24/avatars',
  REVIEW_IMAGES:    'moom24/reviews',
  GIFT_CARD_IMAGES: 'moom24/gift-cards',
  DOCUMENTS:        'moom24/documents',
  VIDEOS:           'moom24/videos',
};