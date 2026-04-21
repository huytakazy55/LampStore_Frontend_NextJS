const SITE_URL = 'https://capylumine.com';

const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CapyLumine',
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    description: 'CapyLumine - Cửa hàng đèn trang trí cao cấp hàng đầu Việt Nam. Chuyên đèn ngủ dễ thương, đèn bàn học, đèn LED nghệ thuật.',
    contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: 'Vietnamese',
    },
    sameAs: [],
};

const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CapyLumine',
    url: SITE_URL,
    description: 'Cửa hàng đèn trang trí cao cấp - Đèn ngủ, đèn bàn, đèn LED nghệ thuật',
    publisher: {
        '@type': 'Organization',
        name: 'CapyLumine',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png` },
    },
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/categories?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
};

const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'CapyLumine',
    url: SITE_URL,
    image: `${SITE_URL}/og-image.png`,
    description: 'Cửa hàng đèn trang trí cao cấp hàng đầu Việt Nam. Giao hàng toàn quốc, đổi trả miễn phí 15 ngày.',
    priceRange: '₫₫',
    currenciesAccepted: 'VND',
    paymentAccepted: 'Cash, Bank Transfer, COD',
    address: {
        '@type': 'PostalAddress',
        addressCountry: 'VN',
    },
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Đèn trang trí CapyLumine',
        itemListElement: [
            { '@type': 'OfferCatalog', name: 'Đèn ngủ' },
            { '@type': 'OfferCatalog', name: 'Đèn bàn học' },
            { '@type': 'OfferCatalog', name: 'Đèn LED nghệ thuật' },
            { '@type': 'OfferCatalog', name: 'Đèn anime' },
        ],
    },
};

export const metadata = {
    title: 'CapyLumine - Đèn Ngủ & Đèn Trang Trí Cao Cấp | Giao Hàng Toàn Quốc',
    description: 'CapyLumine - Cửa hàng đèn trang trí cao cấp hàng đầu Việt Nam. Chuyên đèn ngủ dễ thương, đèn bàn học, đèn LED nghệ thuật, đèn anime. Giao hàng toàn quốc, đổi trả miễn phí 15 ngày.',
    alternates: {
        canonical: SITE_URL,
    },
    openGraph: {
        title: 'CapyLumine - Đèn Ngủ & Đèn Trang Trí Cao Cấp',
        description: 'Cửa hàng đèn trang trí cao cấp hàng đầu Việt Nam. Đèn ngủ, đèn bàn, đèn LED nghệ thuật. Giao hàng toàn quốc.',
        url: SITE_URL,
        type: 'website',
        locale: 'vi_VN',
        siteName: 'CapyLumine',
        images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'CapyLumine - Đèn trang trí cao cấp' }],
    },
    keywords: ['đèn ngủ', 'đèn trang trí', 'đèn bàn học', 'đèn LED', 'đèn anime', 'đèn capybara', 'lamp shop', 'CapyLumine', 'đèn cao cấp', 'đèn dễ thương'],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        // Add Google Search Console verification here when available
        // google: 'your-google-verification-code',
    },
};

export default function MainLayout({ children })
{
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
            />
            {children}
        </>
    );
}
