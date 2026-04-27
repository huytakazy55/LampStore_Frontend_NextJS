/**
 * Resolve an image path from the backend API.
 *
 * Returns the path as-is so it can be served via Next.js rewrites,
 * which proxy `/ImageImport/*`, `/NewsImages/*`, etc. to the backend.
 *
 * This avoids hard-coding API_ENDPOINT into image URLs, which breaks
 * when Next.js Image Optimization tries to fetch server-side inside
 * a Docker container (localhost:5001 is unreachable from the container).
 *
 * - Absolute URLs (http/https) are returned unchanged (e.g. Cloudinary).
 * - Relative paths are prefixed with '/' if missing.
 *
 * @param {string} path - Image path from the API
 * @param {string} fallback - Fallback image if path is falsy
 * @returns {string}
 */
export function resolveImagePath(path, fallback = '/images/cameras-2.jpg')
{
    if (!path) return fallback;

    if (path.startsWith('http'))
    {
        try
        {
            const url = new URL(path);
            const proxyPaths = ['/ImageImport', '/NewsImages', '/BannerImages', '/CategoryImages'];
            // If the absolute URL points to a known backend asset folder, convert it to a relative path
            if (proxyPaths.some(p => url.pathname.startsWith(p)))
            {
                return url.pathname + url.search;
            }
        } catch (e)
        {
            // invalid URL parsing, continue
        }
        // External URLs (Cloudinary, Unsplash, etc.) — pass through
        return path;
    }

    // Ensure relative path starts with /
    return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Get the first product image path (handles both casing conventions).
 */
export function getProductImagePath(product, fallback = '/images/cameras-2.jpg')
{
    const images = product?.images?.$values || product?.images || product?.Images || [];
    if (Array.isArray(images) && images.length > 0)
    {
        const path = images[0].imagePath || images[0].ImagePath;
        return resolveImagePath(path, fallback);
    }
    return fallback;
}
