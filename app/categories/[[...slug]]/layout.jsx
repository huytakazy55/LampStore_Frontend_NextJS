const API_ENDPOINT = process.env.INTERNAL_API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT;
const SITE_URL = 'https://capylumine.com';

export async function generateMetadata({ params })
{
    const resolved = await params;
    const slug = resolved?.slug?.[0];

    if (!slug)
    {
        return {
            title: 'Danh mục sản phẩm - Đèn trang trí',
            description: 'Khám phá bộ sưu tập đèn trang trí đa dạng tại CapyLumine. Đèn ngủ dễ thương, đèn bàn học, đèn LED nghệ thuật, đèn anime.',
            alternates: { canonical: `${SITE_URL}/categories` },
            openGraph: {
                title: 'Danh mục sản phẩm | CapyLumine',
                description: 'Khám phá bộ sưu tập đèn trang trí đa dạng tại CapyLumine.',
                url: `${SITE_URL}/categories`,
                type: 'website',
                locale: 'vi_VN',
                siteName: 'CapyLumine',
            },
        };
    }

    try
    {
        const res = await fetch(`${API_ENDPOINT}/api/Categories/slug/${slug}`, { next: { revalidate: 300 } });
        if (!res.ok) return { title: 'Danh mục sản phẩm | CapyLumine' };
        const category = await res.json();

        const title = `${category.name} - Đèn trang trí cao cấp`;
        const description = category.description
            || `Mua ${category.name} chất lượng cao tại CapyLumine. Giao hàng toàn quốc, đổi trả miễn phí 15 ngày.`;

        return {
            title,
            description,
            alternates: { canonical: `${SITE_URL}/categories/${slug}` },
            openGraph: {
                title: `${category.name} | CapyLumine`,
                description,
                url: `${SITE_URL}/categories/${slug}`,
                type: 'website',
                locale: 'vi_VN',
                siteName: 'CapyLumine',
                ...(category.imageUrl && {
                    images: [{
                        url: category.imageUrl.startsWith('http') ? category.imageUrl : `${SITE_URL}${category.imageUrl.startsWith('/') ? '' : '/'}${category.imageUrl}`,
                        alt: category.name,
                    }],
                }),
            },
        };
    } catch
    {
        return { title: 'Danh mục sản phẩm | CapyLumine' };
    }
}

// Helper: format price for SSR
function formatPriceSSR(price)
{
    if (!price) return '0';
    return Number(price).toLocaleString('vi-VN');
}

function resolveImgSrc(path)
{
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

function normalizeArray(value)
{
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.$values)) return value.$values;
    return [];
}

async function fetchCategories()
{
    try
    {
        const res = await fetch(`${API_ENDPOINT}/api/Categories`, { next: { revalidate: 120 } });
        if (!res.ok) return [];
        const data = await res.json();
        return data?.$values || data || [];
    } catch
    {
        return [];
    }
}

async function fetchProducts()
{
    try
    {
        const res = await fetch(`${API_ENDPOINT}/api/Products`, { next: { revalidate: 120 } });
        if (!res.ok) return [];
        const data = await res.json();
        return data?.$values || data || [];
    } catch
    {
        return [];
    }
}

export default async function CategoryLayout({ children, params })
{
    const resolved = await params;
    const slug = resolved?.slug?.[0] || null;

    // Fetch data server-side for SSR content
    let categories = [];
    let products = [];
    let activeCategory = null;

    try
    {
        categories = await fetchCategories();
        products = await fetchProducts();

        if (slug)
        {
            activeCategory = categories.find(c => c.slug === slug || String(c.id) === slug) || null;
        } else if (categories.length > 0)
        {
            activeCategory = categories[0];
        }
    } catch { }

    // Filter products for active category
    const categoryProducts = activeCategory
        ? products.filter(p => String(p.categoryId) === String(activeCategory.id) && (p.slug || p.id)).slice(0, 20)
        : [];

    return (
        <>
            {/* SSR Category Content — visible to Googlebot */}
            <div data-ssr-content="categories" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb">
                    <a href="/">Trang chủ</a> &gt;
                    <a href="/categories">Danh mục sản phẩm</a>
                    {activeCategory && <> &gt; <span>{activeCategory.name}</span></>}
                </nav>

                <h1>Danh Mục Sản Phẩm</h1>
                <p>Khám phá các bộ sưu tập đèn ngủ cao cấp của chúng tôi</p>

                {/* Category Sidebar — crawlable links */}
                {categories.length > 0 && (
                    <nav aria-label="Danh mục">
                        <h2>Danh mục ({categories.length})</h2>
                        <ul>
                            {categories.map(cat => (
                                <li key={cat.id}>
                                    <a href={`/categories/${cat.slug || cat.id}`}>{cat.name}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {/* Active Category Products — crawlable product links */}
                {activeCategory && (
                    <section>
                        <h2>{activeCategory.name} - {categoryProducts.length} sản phẩm</h2>
                        {categoryProducts.length > 0 ? (
                            <ul>
                                {categoryProducts.map(product =>
                                {
                                    const variant = product.variant;
                                    const price = variant?.discountPrice || variant?.price || product.minPrice || 0;
                                    const originalPrice = variant?.price || 0;
                                    const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
                                    const discountPercent = hasDiscount ? Math.round((1 - variant.discountPrice / variant.price) * 100) : 0;
                                    const imgs = normalizeArray(product.images);
                                    const imgPath = imgs.length > 0 ? (imgs[0]?.imagePath || imgs[0]?.ImagePath) : null;
                                    const imgUrl = imgPath ? resolveImgSrc(imgPath) : null;

                                    return (
                                        <li key={product.id}>
                                            <a href={`/product/${product.slug || product.id}`}>
                                                {imgUrl && <img src={imgUrl} alt={product.name} width="200" height="200" loading="lazy" />}
                                                <h3>{product.name}</h3>
                                                <p>
                                                    Giá: {formatPriceSSR(price)}₫
                                                    {hasDiscount && <> (Giá gốc: <del>{formatPriceSSR(originalPrice)}₫</del> -{discountPercent}%)</>}
                                                </p>
                                                <p>Danh mục: {activeCategory.name}</p>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p>Chưa có sản phẩm trong danh mục này</p>
                        )}
                    </section>
                )}
            </div>

            {children}
        </>
    );
}
