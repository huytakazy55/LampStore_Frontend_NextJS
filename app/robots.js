export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/checkout/', '/my-orders/'],
            },
        ],
        sitemap: 'https://capylumine.com/sitemap.xml',
    };
}
