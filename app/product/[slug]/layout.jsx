const API_ENDPOINT = process.env.INTERNAL_API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT;
const SITE_URL = 'https://capylumine.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

function stripHtml(value = '', maxLength)
{
    const text = value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\s+/g, ' ')
        .trim();

    return maxLength ? text.slice(0, maxLength).trim() : text;
}

function normalizeArray(value)
{
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.$values)) return value.$values;
    return [];
}

function getImagePath(image)
{
    return image?.imagePath || image?.ImagePath || '';
}

function toAbsoluteSiteUrl(path, fallback = DEFAULT_OG_IMAGE)
{
    if (!path) return fallback;
    if (path.startsWith('http')) {
        try
        {
            const url = new URL(path);
            const proxiedFolders = ['/ImageImport', '/NewsImages', '/BannerImages', '/CategoryImages'];
            if (proxiedFolders.some(folder => url.pathname.startsWith(folder)))
            {
                return `${SITE_URL}${url.pathname}${url.search}`;
            }
        } catch { }

        return path;
    }

    return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

function getProductImages(product)
{
    return normalizeArray(product?.images)
        .map(image => toAbsoluteSiteUrl(getImagePath(image), null))
        .filter(Boolean);
}

function getProductPrice(product)
{
    const variant = product?.variant;
    return variant?.discountPrice || variant?.price || product?.minPrice || 0;
}

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

        const price = getProductPrice(product);
        const description = product.description
            ? stripHtml(product.description, 160)
            : `Mua ${product.name} tại CapyLumine với giá ${price.toLocaleString('vi-VN')}₫. Giao hàng toàn quốc.`;

        const productImages = getProductImages(product);
        const ogImage = productImages[0] || DEFAULT_OG_IMAGE;

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
        const price = getProductPrice(product);
        const imageUrls = getProductImages(product);
        const cleanDescription = stripHtml(product.description, 500);

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
            '@id': `${SITE_URL}/product/${slug}#product`,
            name: product.name,
            description: cleanDescription || product.name,
            image: imageUrls.length > 0 ? imageUrls : [DEFAULT_OG_IMAGE],
            url: `${SITE_URL}/product/${slug}`,
            brand: {
                '@type': 'Brand',
                name: 'CapyLumine',
            },
            productID: product.id,
            sku: variant?.sku || product.id,
            mpn: variant?.sku || product.id,
            category: product.categoryName || product.category?.name || 'Đèn trang trí',
            ...(variant?.materials && { material: variant.materials }),
            offers: {
                '@type': 'Offer',
                url: `${SITE_URL}/product/${slug}`,
                priceCurrency: 'VND',
                price: Number(price).toFixed(0),
                priceValidUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
                    shippingRate: {
                        '@type': 'MonetaryAmount',
                        value: 0,
                        currency: 'VND',
                    },
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
