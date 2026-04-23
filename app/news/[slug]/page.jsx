"use client";


// News detail page - will be implemented in the next iteration
// For now, redirect to the original news detail component
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import NewsService from '@/services/NewsService';
import { resolveImagePath } from '@/lib/imageUtils';

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;

    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedNews, setRelatedNews] = useState([]);

    useEffect(() => {
        if (!slug) return;
        const fetchNewsDetail = async () => {
            try {
                setLoading(true);
                const response = await NewsService.getNewsBySlug(slug);
                setNews(response.data);

                // Fetch related news
                const allRes = await NewsService.getAllNews(true);
                const allData = allRes.data?.$values || allRes.data || [];
                // Compare by slug or id
                setRelatedNews(allData.filter(n => n.slug !== slug && String(n.id) !== String(slug)).slice(0, 3));
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNewsDetail();
    }, [slug]);

    const getImageSrc = (imageUrl) => {
        if (!imageUrl) return '';
        return resolveImagePath(imageUrl);
    };

    if (loading) {
        return (
            <>
                <TopBar />
                <Header />
                <NavbarPrimary />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
                <Footer />
            </>
        );
    }

    if (!news) {
        return (
            <>
                <TopBar />
                <Header />
                <NavbarPrimary />
                <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                    <i className='bx bx-error-circle text-6xl text-gray-300'></i>
                    <p className="text-lg text-gray-500">Không tìm thấy bài viết</p>
                    <button onClick={() => router.push('/news')} className="px-6 py-2 bg-amber-500 text-white rounded-lg">Quay lại tin tức</button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />

            <div className="bg-gray-50 min-h-screen">
                <div className="w-full xl:mx-auto xl:max-w-[900px] px-4 xl:px-0 py-8 md:py-12">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <a href="/" className="hover:text-amber-600 transition-colors">Trang chủ</a>
                        <i className='bx bx-chevron-right text-xs'></i>
                        <a href="/news" className="hover:text-amber-600 transition-colors">Tin tức</a>
                        <i className='bx bx-chevron-right text-xs'></i>
                        <span className="text-gray-800 font-medium truncate max-w-[200px]">{news.title}</span>
                    </nav>

                    <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        {news.imageUrl && (
                            <div className="relative h-64 md:h-[400px] overflow-hidden">
                                <Image src={getImageSrc(news.imageUrl)} alt={news.title} className="w-full h-full object-cover" fill sizes="100vw" quality={80} priority />
                            </div>
                        )}
                        <div className="p-6 md:p-10">
                            {news.category && (
                                <span className="inline-block bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">{news.category}</span>
                            )}
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">{news.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
                                <span className="flex items-center gap-1">
                                    <i className='bx bx-calendar'></i>
                                    {new Date(news.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <i className='bx bx-show'></i> {news.viewCount || 0} lượt xem
                                </span>
                            </div>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: news.content }} />
                        </div>
                    </article>

                    {/* Related */}
                    {relatedNews.length > 0 && (
                        <div className="mt-10">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Bài viết liên quan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedNews.map(item => (
                                    <div key={item.id} className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
                                        onClick={() => router.push(`/news/${item.slug || item.id}`)}>
                                        <div className="relative h-40 overflow-hidden">
                                            <Image src={getImageSrc(item.imageUrl)} alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" fill sizes="33vw" quality={75} />
                                        </div>
                                        <div className="p-4">
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-yellow-600">{item.title}</h4>
                                            <p className="text-xs text-gray-400 mt-2">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
