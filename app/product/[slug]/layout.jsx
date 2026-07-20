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
    if (path.startsWith('http'))
    {
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

function formatSchemaDate(value)
{
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
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

    // Prevent indexing of /product/undefined
    if (!slug || slug === 'undefined')
    {
        return {
            title: 'Không tìm thấy sản phẩm | CapyLumine',
            robots: { index: false, follow: false },
        };
    }

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
        const offerValidFrom = formatSchemaDate(product.updatedAt || product.updateAt || product.createdAt || product.createAt)
            || new Date().toISOString().split('T')[0];
        const gtin = variant?.gtin || variant?.barcode || product.gtin || product.barcode || product.gtin13 || product.gtin14;

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

        const validReviews = reviews.filter(r => Number(r.rating) > 0);
        const productAverageRating = Number(product.averageRating || product.avgRating || 0);
        const productReviewCount = Number(product.reviewCount || product.reviewsCount || product.ratingCount || 0);
        const avgRating = validReviews.length > 0
            ? (validReviews.reduce((s, r) => s + Number(r.rating), 0) / validReviews.length).toFixed(1)
            : (productAverageRating > 0 && productReviewCount > 0 ? productAverageRating.toFixed(1) : null);
        const reviewCount = validReviews.length || productReviewCount;

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
            ...(gtin && { gtin }),
            category: product.categoryName || product.category?.name || 'Đèn trang trí',
            ...(variant?.materials && { material: variant.materials }),
            offers: {
                '@type': 'Offer',
                url: `${SITE_URL}/product/${slug}`,
                priceCurrency: 'VND',
                price: Number(price).toFixed(0),
                validFrom: offerValidFrom,
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
        if (avgRating && reviewCount > 0)
        {
            jsonLd.aggregateRating = {
                '@type': 'AggregateRating',
                ratingValue: avgRating,
                reviewCount,
                bestRating: 5,
                worstRating: 1,
            };
        }

        if (validReviews.length > 0)
        {
            // Add individual reviews (max 5 for performance)
            jsonLd.review = validReviews.slice(0, 5).map(r => ({
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

// Helper: format price for SSR
function formatPriceSSR(price)
{
    if (!price) return '0';
    return Number(price).toLocaleString('vi-VN');
}

// Helper: resolve image to absolute URL for SSR rendering
function resolveImgSrc(path)
{
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Fetch related products (same category)
async function fetchRelatedProducts(product)
{
    try
    {
        const res = await fetch(`${API_ENDPOINT}/api/Products`, { next: { revalidate: 120 } });
        if (!res.ok) return [];
        const data = await res.json();
        const products = data?.$values || data || [];
        return products
            .filter(p => p.categoryId === product.categoryId && p.id !== product.id && (p.slug || p.id))
            .slice(0, 6);
    } catch
    {
        return [];
    }
}

export default async function ProductLayout({ children, params })
{
    const { slug } = await params;
    const productJsonLd = await getProductJsonLd(slug);

    // Fetch product for SSR content
    let product = null;
    let relatedProducts = [];
    try
    {
        product = await fetchProductBySlug(slug);
        if (product)
        {
            relatedProducts = await fetchRelatedProducts(product);
        }
    } catch { }

    const productName = product?.name || 'Sản phẩm';
    const variant = product?.variant;
    const price = product ? getProductPrice(product) : 0;
    const originalPrice = variant?.price || product?.maxPrice || 0;
    const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
    const discountPercent = hasDiscount ? Math.round((1 - variant.discountPrice / variant.price) * 100) : 0;
    const stock = variant?.stock || 0;
    const productImages = product ? getProductImages(product) : [];
    const description = product?.description ? stripHtml(product.description, 1000) : '';
    const categoryName = product?.categoryName || product?.category?.name || '';

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

            {/* SSR Product Content — visible to Googlebot, hidden after client hydration */}
            {product && (
                <div data-ssr-content="product" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
                    <article>
                        {/* Breadcrumb */}
                        <nav aria-label="Breadcrumb">
                            <a href="/">Trang chủ</a> &gt;
                            {categoryName && <><a href="/categories">{categoryName}</a> &gt;</>}
                            <span>{productName}</span>
                        </nav>

                        {/* Product Name */}
                        <h1>{productName}</h1>

                        {/* Product Images */}
                        {productImages.length > 0 && (
                            <div>
                                {productImages.map((imgUrl, i) => (
                                    <img key={i} src={imgUrl} alt={`${productName} - Ảnh ${i + 1}`} width="400" height="400" loading={i === 0 ? 'eager' : 'lazy'} />
                                ))}
                            </div>
                        )}

                        {/* Price */}
                        <div>
                            <p>Giá: <strong>{formatPriceSSR(price)}₫</strong></p>
                            {hasDiscount && (
                                <p>Giá gốc: <del>{formatPriceSSR(originalPrice)}₫</del> (-{discountPercent}%)</p>
                            )}
                            <p>{stock > 0 ? `Còn ${stock} sản phẩm` : 'Hết hàng'}</p>
                        </div>

                        {/* Product Details */}
                        <div>
                            <h2>Chi tiết sản phẩm</h2>
                            <p>Tên: {productName}</p>
                            {variant?.materials && <p>Chất liệu: {variant.materials}</p>}
                            {variant?.weight && <p>Trọng lượng: {variant.weight} gram</p>}
                            {product?.tags && <p>Tags: {product.tags}</p>}
                            {categoryName && <p>Danh mục: <a href={`/categories/${product.category?.slug || ''}`}>{categoryName}</a></p>}
                        </div>

                        {/* Description */}
                        {description && (
                            <div>
                                <h2>Mô tả sản phẩm</h2>
                                <p>{description}</p>
                            </div>
                        )}

                        {/* Trust badges */}
                        <ul>
                            <li>Đổi ý miễn phí 15 ngày</li>
                            <li>Hàng chính hãng 100%</li>
                            <li>Miễn phí vận chuyển</li>
                        </ul>

                        {/* Related Products — crawlable links */}
                        {relatedProducts.length > 0 && (
                            <div>
                                <h2>Sản phẩm liên quan</h2>
                                <ul>
                                    {relatedProducts.map(rp =>
                                    {
                                        const rpSlug = rp.slug || rp.id;
                                        const rpVariant = rp.variant;
                                        const rpPrice = rpVariant?.discountPrice || rpVariant?.price || rp.minPrice || 0;
                                        const rpImgs = normalizeArray(rp.images);
                                        const rpImgPath = rpImgs.length > 0 ? getImagePath(rpImgs[0]) : null;
                                        const rpImgUrl = rpImgPath ? resolveImgSrc(rpImgPath) : null;
                                        return (
                                            <li key={rp.id}>
                                                <a href={`/product/${rpSlug}`}>
                                                    {rpImgUrl && <img src={rpImgUrl} alt={rp.name} width="200" height="200" loading="lazy" />}
                                                    <span>{rp.name}</span>
                                                    <span> - {formatPriceSSR(rpPrice)}₫</span>
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </article>
                </div>
            )}

            {children}
        </>
    );
}
