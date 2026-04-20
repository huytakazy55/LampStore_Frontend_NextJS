export async function generateMetadata({ params }) {
    const { id } = await params;
    const API = process.env.NEXT_PUBLIC_API_ENDPOINT;

    try {
        const res = await fetch(`${API}/api/Product/${id}`, { next: { revalidate: 60 } });
        if (!res.ok) return { title: 'Sản phẩm | CapyLumine' };
        const product = await res.json();

        const variant = product.variant;
        const price = variant?.discountPrice || variant?.price || 0;
        const description = product.description
            ? product.description.replace(/<[^>]*>/g, '').slice(0, 160)
            : `Mua ${product.name} tại CapyLumine với giá ${price.toLocaleString('vi-VN')}₫. Giao hàng toàn quốc.`;

        const images = product.images?.$values || product.images || [];
        const ogImage = images.length > 0
            ? (images[0].imagePath?.startsWith('http') ? images[0].imagePath : `${API}${images[0].imagePath}`)
            : '/og-image.png';

        return {
            title: product.name,
            description,
            openGraph: {
                title: `${product.name} | CapyLumine`,
                description,
                images: [{ url: ogImage }],
                type: 'product',
                locale: 'vi_VN',
            },
            twitter: {
                card: 'summary_large_image',
                title: product.name,
                description,
                images: [ogImage],
            },
        };
    } catch {
        return { title: 'Sản phẩm | CapyLumine' };
    }
}

export { default } from './page.jsx';
