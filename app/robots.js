export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/checkout/', '/my-orders/', '/wishlist/'],
            },
            {
                userAgent: 'facebookexternalhit',
                allow: '/',
            },
            {
                userAgent: 'Facebot',
                allow: '/',
            }
        ],
        sitemap: 'https://capylumine.com/sitemap.xml',
    };
}
