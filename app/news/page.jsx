"use client";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import NewsService from '@/services/NewsService';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export default function NewsListPage() {
    const router = useRouter();
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await NewsService.getAllNews(true);
                const data = response.data?.$values || response.data || [];
                setNewsList(data);
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const categories = ['all', ...new Set(newsList.map(n => n.category).filter(Boolean))];
    const filteredNews = selectedCategory === 'all' ? newsList : newsList.filter(n => n.category === selectedCategory);

    const getImageSrc = (imageUrl) => {
        if (!imageUrl) return 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80';
        return imageUrl.startsWith('http') ? imageUrl : `${API_ENDPOINT}${imageUrl}`;
    };

    const featured = filteredNews[0];
    const rest = filteredNews.slice(1);

    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />

            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-hidden border-b border-amber-100">
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-yellow-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
                <div className="w-full xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0 py-10 md:py-14 relative z-10">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                        <a href="/" className="hover:text-amber-600 transition-colors font-medium">Trang chủ</a>
                        <i className='bx bx-chevron-right text-xs'></i>
                        <span className="text-amber-600 font-semibold">Tin tức</span>
                    </nav>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                        Tin tức & <span className="text-amber-600">Góc nội thất</span>
                    </h1>
                    <p className="text-gray-500 max-w-xl text-sm md:text-base leading-relaxed">
                        Khám phá những xu hướng thiết kế chiếu sáng mới nhất, tips bố trí đèn trang trí và kiến thức hữu ích cho ngôi nhà hoàn hảo.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-gray-50 min-h-screen">
                <div className="w-full xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0 py-8 md:py-12">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border
                                ${selectedCategory === cat
                                        ? 'bg-yellow-400 text-white border-yellow-400 shadow-md shadow-yellow-400/25'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-400 hover:text-yellow-600'
                                    }`}>
                                {cat === 'all' ? 'Tất cả' : cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-xl p-4 animate-pulse shadow-sm">
                                    <div className="bg-gray-200 h-52 w-full mb-4 rounded-lg"></div>
                                    <div className="bg-gray-200 h-5 w-3/4 mb-3 rounded"></div>
                                    <div className="bg-gray-200 h-4 w-full mb-2 rounded"></div>
                                    <div className="bg-gray-200 h-4 w-5/6 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredNews.length === 0 ? (
                        <div className="text-center text-gray-500 py-20">
                            <i className='bx bx-news text-6xl text-gray-300 mb-4 block'></i>
                            <p className="text-lg font-medium">Chưa có bài viết nào</p>
                        </div>
                    ) : (
                        <>
                            {/* Featured */}
                            {featured && (
                                <div className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 mb-10 border border-gray-100"
                                    onClick={() => router.push(`/news/${featured.slug || featured.id}`)}>
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="relative lg:w-3/5 h-64 md:h-80 lg:h-[420px] overflow-hidden">
                                            <Image src={getImageSrc(featured.imageUrl)} alt={featured.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" fill sizes="(max-width: 1024px) 100vw, 60vw" quality={80} priority />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-yellow-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">{featured.category}</span>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                    <i className='bx bxs-star text-xs'></i> Nổi bật
                                                </span>
                                            </div>
                                        </div>
                                        <div className="lg:w-2/5 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <i className='bx bx-calendar'></i>
                                                    {new Date(featured.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <i className='bx bx-show'></i> {featured.viewCount || 0} lượt xem
                                                </span>
                                            </div>
                                            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-yellow-600 transition-colors duration-300">
                                                {featured.title}
                                            </h2>
                                            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6 line-clamp-4">{featured.excerpt}</p>
                                            <div className="flex items-center gap-2 text-yellow-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                                                Đọc bài viết <i className='bx bx-right-arrow-alt text-xl'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Grid */}
                            {rest.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {rest.map((news) => (
                                        <article key={news.id}
                                            className="group cursor-pointer flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:-translate-y-1"
                                            onClick={() => router.push(`/news/${news.slug || news.id}`)}>
                                            <div className="relative h-52 overflow-hidden">
                                                <Image src={getImageSrc(news.imageUrl)} alt={news.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" fill sizes="(max-width: 768px) 100vw, 33vw" quality={75} />
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-yellow-400/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">{news.category}</span>
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <i className='bx bx-calendar'></i> {new Date(news.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <i className='bx bx-show'></i> {news.viewCount || 0}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors duration-200 leading-snug">{news.title}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow leading-relaxed">{news.excerpt}</p>
                                                <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-yellow-600 group-hover:gap-2.5 transition-all duration-300">
                                                    Đọc tiếp <i className='bx bx-right-arrow-alt text-base'></i>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
