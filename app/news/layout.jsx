export const dynamic = "force-dynamic";

const SITE_URL = 'https://capylumine.com';

export const metadata = {
    title: 'Tin tức & Góc nội thất',
    description: 'Khám phá những xu hướng thiết kế chiếu sáng mới nhất, tips bố trí đèn trang trí và kiến thức hữu ích cho ngôi nhà hoàn hảo tại CapyLumine.',
    alternates: { canonical: `${SITE_URL}/news` },
    openGraph: {
        title: 'Tin tức & Góc nội thất | CapyLumine',
        description: 'Xu hướng thiết kế chiếu sáng, tips bố trí đèn trang trí cho ngôi nhà hoàn hảo.',
        url: `${SITE_URL}/news`,
        type: 'website',
        locale: 'vi_VN',
        siteName: 'CapyLumine',
    },
};

export default function NewsListLayout({ children })
{
    return children;
}
