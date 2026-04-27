export default function robots()
{
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/checkout/', '/my-orders/', '/wishlist/'],
            },
        ],
        sitemap: 'https://capylumine.com/sitemap.xml',
    };
}
