const API_ENDPOINT = process.env.INTERNAL_API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT;
const SITE_URL = 'https://capylumine.com';

async function fetchProductBySlug(slug)
{
    const res = await fetch(`${API_ENDPOINT}/api/Products/slug/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
}

export async function generateMetadata({ params })
{
    const { slug } = await params;

    try
    {
        const product = await fetchProductBySlug(slug);
        if (!product) return { title: 'Sản phẩm | CapyLumine' };

        const variant = product.variant;
        const price = variant?.discountPrice || variant?.price || 0;
        const description = product.description
            ? product.description.replace(/<[^>]*>/g, '').slice(0, 160)
            : `Mua ${product.name} tại CapyLumine với giá ${price.toLocaleString('vi-VN')}₫. Giao hàng toàn quốc.`;

        const images = product.images?.$values || product.images || [];
        const ogImage = images.length > 0
            ? (images[0].imagePath?.startsWith('http') ? images[0].imagePath : `${SITE_URL}${images[0].imagePath?.startsWith('/') ? '' : '/'}${images[0].imagePath}`)
            : `${SITE_URL}/og-image.png`;

        return {
            title: product.name,
            description,
            alternates: {
                canonical: `${SITE_URL}/product/${slug}`,
            },
            openGraph: {
                title: `${product.name} | CapyLumine`,
                description,
                url: `${SITE_URL}/product/${slug}`,
                images: [{ url: ogImage, width: 800, height: 800, alt: product.name }],
                type: 'website',
                locale: 'vi_VN',
                siteName: 'CapyLumine',
            },
            twitter: {
                card: 'summary_large_image',
                title: product.name,
                description,
                images: [ogImage],
            },
        };
    } catch
    {
        return { title: 'Sản phẩm | CapyLumine' };
    }
}

// JSON-LD Structured Data for Product (rendered server-side)
async function getProductJsonLd(slug)
{
    try
    {
        const product = await fetchProductBySlug(slug);
        if (!product) return null;

        const variant = product.variant;
        const price = variant?.discountPrice || variant?.price || product.minPrice || 0;
        const originalPrice = variant?.price || product.maxPrice || 0;
        const images = product.images?.$values || product.images || [];
        const imageUrls = images.map(img =>
            img.imagePath?.startsWith('http') ? img.imagePath : `${SITE_URL}${img.imagePath?.startsWith('/') ? '' : '/'}${img.imagePath}`
        );

        // Fetch reviews using product.id
        let reviews = [];
        try
        {
            const reviewRes = await fetch(`${API_ENDPOINT}/api/ProductReviews/${product.id}`, { next: { revalidate: 300 } });
            if (reviewRes.ok)
            {
                const reviewData = await reviewRes.json();
                reviews = reviewData?.$values || reviewData || [];
            }
        } catch { }

        const avgRating = reviews.length > 0
            ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1)
            : null;

        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description?.replace(/<[^>]*>/g, '').slice(0, 500) || '',
            image: imageUrls,
            url: `${SITE_URL}/product/${slug}`,
            brand: {
                '@type': 'Brand',
                name: 'CapyLumine',
            },
            sku: variant?.sku || product.id,
            offers: {
                '@type': 'Offer',
                url: `${SITE_URL}/product/${slug}`,
                priceCurrency: 'VND',
                price: price,
                ...(originalPrice > price && {
                    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                }),
                availability: (variant?.stock || 0) > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                itemCondition: 'https://schema.org/NewCondition',
                seller: {
                    '@type': 'Organization',
                    name: 'CapyLumine',
                },
                shippingDetails: {
                    '@type': 'OfferShippingDetails',
                    shippingDestination: {
                        '@type': 'DefinedRegion',
                        addressCountry: 'VN',
                    },
                    deliveryTime: {
                        '@type': 'ShippingDeliveryTime',
                        handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
                        transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 7, unitCode: 'DAY' },
                    },
                },
                hasMerchantReturnPolicy: {
                    '@type': 'MerchantReturnPolicy',
                    applicableCountry: 'VN',
                    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                    merchantReturnDays: 15,
                    returnMethod: 'https://schema.org/ReturnByMail',
                    returnFees: 'https://schema.org/FreeReturn',
                },
            },
        };

        // Add aggregate rating if reviews exist
        if (avgRating && reviews.length > 0)
        {
            jsonLd.aggregateRating = {
                '@type': 'AggregateRating',
                ratingValue: avgRating,
                reviewCount: reviews.length,
                bestRating: 5,
                worstRating: 1,
            };
            // Add individual reviews (max 5 for performance)
            jsonLd.review = reviews.slice(0, 5).map(r => ({
                '@type': 'Review',
                author: { '@type': 'Person', name: r.userName || 'Khách hàng' },
                datePublished: r.createAt || r.createdAt,
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: Number(r.rating),
                    bestRating: 5,
                },
                reviewBody: r.comment,
            }));
        }

        return jsonLd;
    } catch
    {
        return null;
    }
}

// BreadcrumbList JSON-LD
function getBreadcrumbJsonLd(productName, slug)
{
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: `${SITE_URL}/categories` },
            { '@type': 'ListItem', position: 3, name: productName, item: `${SITE_URL}/product/${slug}` },
        ],
    };
}

export default async function ProductLayout({ children, params })
{
    const { slug } = await params;
    const productJsonLd = await getProductJsonLd(slug);

    // Get product name for breadcrumb
    let productName = 'Sản phẩm';
    try
    {
        const product = await fetchProductBySlug(slug);
        if (product) productName = product.name;
    } catch { }

    return (
        <>
            {productJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbJsonLd(productName, slug)) }}
            />
            {children}
        </>
    );
}
