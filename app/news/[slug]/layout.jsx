const API_ENDPOINT = process.env.INTERNAL_API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT;
const SITE_URL = 'https://capylumine.com';

export async function generateMetadata({ params })
{
    const { slug } = await params;

    try
    {
        const res = await fetch(`${API_ENDPOINT}/api/News/slug/${slug}`, { next: { revalidate: 300 } });
        if (!res.ok) return { title: 'Tin tức | CapyLumine' };
        const news = await res.json();

        const description = news.excerpt
            || news.content?.replace(/<[^>]*>/g, '').slice(0, 160)
            || `Đọc bài viết ${news.title} tại CapyLumine.`;

        const ogImage = news.imageUrl
            ? (news.imageUrl.startsWith('http') ? news.imageUrl : `${SITE_URL}${news.imageUrl.startsWith('/') ? '' : '/'}${news.imageUrl}`)
            : `${SITE_URL}/og-image.png`;

        return {
            title: news.title,
            description,
            alternates: { canonical: `${SITE_URL}/news/${slug}` },
            openGraph: {
                title: `${news.title} | CapyLumine`,
                description,
                url: `${SITE_URL}/news/${slug}`,
                type: 'article',
                locale: 'vi_VN',
                siteName: 'CapyLumine',
                publishedTime: news.createdAt,
                modifiedTime: news.updatedAt || news.createdAt,
                section: news.category || 'Tin tức',
                images: [{ url: ogImage, alt: news.title }],
            },
            twitter: {
                card: 'summary_large_image',
                title: news.title,
                description,
                images: [ogImage],
            },
        };
    } catch
    {
        return { title: 'Tin tức | CapyLumine' };
    }
}

// Article JSON-LD
async function getArticleJsonLd(slug)
{
    try
    {
        const res = await fetch(`${API_ENDPOINT}/api/News/slug/${slug}`, { next: { revalidate: 300 } });
        if (!res.ok) return null;
        const news = await res.json();

        const ogImage = news.imageUrl
            ? (news.imageUrl.startsWith('http') ? news.imageUrl : `${SITE_URL}${news.imageUrl.startsWith('/') ? '' : '/'}${news.imageUrl}`)
            : `${SITE_URL}/og-image.png`;

        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: news.title,
            description: news.excerpt || news.content?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
            image: ogImage,
            datePublished: news.createdAt,
            dateModified: news.updatedAt || news.createdAt,
            author: {
                '@type': 'Organization',
                name: 'CapyLumine',
                url: SITE_URL,
            },
            publisher: {
                '@type': 'Organization',
                name: 'CapyLumine',
                logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png` },
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${SITE_URL}/news/${slug}`,
            },
        };
    } catch
    {
        return null;
    }
}

// BreadcrumbList
function getBreadcrumbJsonLd(newsTitle, newsId)
{
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Tin tức', item: `${SITE_URL}/news` },
            { '@type': 'ListItem', position: 3, name: newsTitle, item: `${SITE_URL}/news/${newsId}` },
        ],
    };
}

export default async function NewsDetailLayout({ children, params })
{
    const { slug } = await params;
    const articleJsonLd = await getArticleJsonLd(slug);

    let newsTitle = 'Bài viết';
    try
    {
        const res = await fetch(`${API_ENDPOINT}/api/News/slug/${slug}`, { next: { revalidate: 300 } });
        if (res.ok)
        {
            const news = await res.json();
            newsTitle = news.title;
        }
    } catch { }

    return (
        <>
            {articleJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbJsonLd(newsTitle, slug)) }}
            />
            {children}
        </>
    );
}
