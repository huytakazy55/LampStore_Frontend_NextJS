const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://capylumine.com';
const SITE_URL = 'https://capylumine.com';

export default async function sitemap() {
    // Static pages
    const staticPages = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${SITE_URL}/categories`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/news`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ];

    // Dynamic product pages
    let productPages = [];
    try {
        const res = await fetch(`${API_ENDPOINT}/api/Product`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const products = data?.$values || data || [];
            productPages = products.map(product => ({
                url: `${SITE_URL}/product/${product.id}`,
                lastModified: new Date(product.updatedAt || product.createdAt || new Date()),
                changeFrequency: 'weekly',
                priority: 0.9,
            }));
        }
    } catch (error) {
        console.error('Error fetching products for sitemap:', error);
    }

    // Dynamic news pages
    let newsPages = [];
    try {
        const res = await fetch(`${API_ENDPOINT}/api/News?publishedOnly=true`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const news = data?.$values || data || [];
            newsPages = news.map(item => ({
                url: `${SITE_URL}/news/${item.id}`,
                lastModified: new Date(item.updatedAt || item.createdAt || new Date()),
                changeFrequency: 'weekly',
                priority: 0.6,
            }));
        }
    } catch (error) {
        console.error('Error fetching news for sitemap:', error);
    }

    return [...staticPages, ...productPages, ...newsPages];
}
