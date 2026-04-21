const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
const SITE_URL = 'https://capylumine.com';

export async function generateMetadata({ params })
{
    const resolved = await params;
    const categoryId = resolved?.categoryId?.[0];

    if (!categoryId)
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
        const res = await fetch(`${API_ENDPOINT}/api/Category/${categoryId}`, { next: { revalidate: 300 } });
        if (!res.ok) return { title: 'Danh mục sản phẩm | CapyLumine' };
        const category = await res.json();

        const title = `${category.name} - Đèn trang trí cao cấp`;
        const description = category.description
            || `Mua ${category.name} chất lượng cao tại CapyLumine. Giao hàng toàn quốc, đổi trả miễn phí 15 ngày.`;

        return {
            title,
            description,
            alternates: { canonical: `${SITE_URL}/categories/${categoryId}` },
            openGraph: {
                title: `${category.name} | CapyLumine`,
                description,
                url: `${SITE_URL}/categories/${categoryId}`,
                type: 'website',
                locale: 'vi_VN',
                siteName: 'CapyLumine',
                ...(category.imageUrl && {
                    images: [{
                        url: category.imageUrl.startsWith('http') ? category.imageUrl : `${API_ENDPOINT}${category.imageUrl}`,
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

export default function CategoryLayout({ children })
{
    return children;
}
