"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import FormLogin from './FormLogin'
import FormCart from './FormCart';
import FormActionLogin from './FormActionLogin';
import { useSelector } from 'react-redux';
// react-tooltip css removed;
import { toast } from 'react-toastify';
const Logo = '/images/Capylumine-sm.png'; const avatarimg = '/images/Avatar.jpg'; import AuthService from '@/services/AuthService';
import FormProfile from './FormProfile';
import SearchService from '@/services/SearchService';
import { useCategories } from '../../../../hooks/useCategories';
import { useNavigate } from '@/lib/router-compat';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useTheme } from '@/contexts/ThemeContext';
import GuestProfileService from '@/services/GuestProfileService';

const Header = () =>
{
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const navigate = useNavigate();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const { cartCount, cartTotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { isDark, toggleDarkMode } = useTheme();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [toggleLogin, setToggleLogin] = useState(false);
  const [toggleActionLogin, setToggleActionLogin] = useState(false);
  const [toggleCart, setToggleCart] = useState(false)
  const [toggleProfile, setToggleProfile] = useState(false);
  const [avatar, setAvatar] = useState({ ProfileAvatar: '' })
  const [profileApiData, setProfileApiData] = useState(null);
  const [arrowIcon, setArrowIcon] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { data: categories = [] } = useCategories();
  const [suggestions, setSuggestions] = useState({ categories: [], products: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const debounceRef = useRef(null);
  const suggestionsRef = useRef(null);
  const popupRef = useRef(null);
  const popupActionRef = useRef(null);
  const popupProfileRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonActionRef = useRef(null);
  const buttonProfileRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuBtnRef = useRef(null);
  const avatarURL = useSelector((state) => state.avatar.avatar);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() =>
  {
    if (token)
    {
      AuthService.profile()
        .then((res) =>
        {
          setAvatar({
            ProfileAvatar: res?.profileAvatar
          });
          setProfileApiData(res);
        })
        .catch((error) =>
        {
          console.error("Error fetching profile:", error);
        });
    } else
    {
      setAvatar({ ProfileAvatar: '' });
      setProfileApiData(null);
    }
  }, [token]);



  const toggleLoginForm = () =>
  {
    setToggleLogin(!toggleLogin);
  }

  const toggleActionLoginForm = () =>
  {
    setToggleActionLogin(!toggleActionLogin);
  }

  const toggleFormcart = () =>
  {
    setToggleCart(!toggleCart);
  }

  const toggleFormProfile = () =>
  {
    setToggleProfile(!toggleProfile);
  }

  const handleClickOutside = (event, ref, buttonRef, toggleFunction) =>
  {
    if (ref.current && !ref.current.contains(event.target) &&
      buttonRef.current && !buttonRef.current.contains(event.target))
    {
      toggleFunction(false);
    }
  };

  // Chuyển trang tìm kiếm
  const handleSearch = () =>
  {
    if (!searchKeyword.trim()) return;
    setShowSuggestions(false);
    navigate(`/tim-kiem?q=${encodeURIComponent(searchKeyword.trim())}`);
  };

  // Debounced search suggestions
  const fetchSuggestions = useCallback(async (keyword) =>
  {
    if (!keyword.trim())
    {
      setSuggestions({ categories: [], products: [] });
      setShowSuggestions(false);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();

    // Filter categories client-side
    const matchedCategories = categories.filter(c =>
      c.name.toLowerCase().includes(lowerKeyword)
    ).slice(0, 3);

    // Fetch product suggestions from API
    try
    {
      const result = await SearchService.quickSearch(keyword, 1, 5);
      const products = result?.$values || result?.products?.$values || result?.products || [];
      setSuggestions({
        categories: matchedCategories,
        products: Array.isArray(products) ? products.slice(0, 6) : []
      });
      setShowSuggestions(true);
    } catch (error)
    {
      setSuggestions({ categories: matchedCategories, products: [] });
      setShowSuggestions(matchedCategories.length > 0);
    }
  }, [categories]);

  // Handle input change with debounce
  const handleSearchInputChange = (e) =>
  {
    const value = e.target.value;
    setSearchKeyword(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() =>
    {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle suggestion click - category → vào trang danh mục
  const handleCategorySuggestionClick = (category) =>
  {
    setShowSuggestions(false);
    setSearchKeyword('');
    navigate(`/categories/${category.slug || category.id}`);
  };

  // Handle suggestion click - product → vào trang sản phẩm
  const handleProductSuggestionClick = (product) =>
  {
    setShowSuggestions(false);
    setSearchKeyword(product.name || '');
    navigate(`/product/${product.slug || product.id}`);
  };

  // Enter key → chuyển trang tìm kiếm
  const handleKeyDown = (e) =>
  {
    if (e.key === 'Enter')
    {
      handleSearch();
    }
  };


  useEffect(() =>
  {
    const handleOutsideClick = (event) =>
    {
      handleClickOutside(event, popupRef, buttonRef, setToggleCart);
      handleClickOutside(event, popupActionRef, buttonActionRef, setToggleActionLogin);

      // Close suggestions when click outside
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
        searchRef.current && !searchRef.current.contains(event.target))
      {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleOutsideClick, false);
    return () =>
    {
      document.removeEventListener('click', handleOutsideClick, false);
    };
  }, []);

  // Close mobile menu on route change (only when pathname actually changes)
  useEffect(() =>
  {
    if (prevPathnameRef.current !== pathname)
    {
      setMobileMenuOpen(false);
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  // Native DOM click listener for hamburger button (bypasses React hydration issues)
  useEffect(() =>
  {
    const btn = mobileMenuBtnRef.current;
    if (!btn) return;
    const handleClick = (e) =>
    {
      e.stopPropagation();
      setMobileMenuOpen(prev => !prev);
    };
    btn.addEventListener('click', handleClick);
    return () => btn.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      <div className='w-full xl:mx-auto xl:max-w-[1440px] flex justify-between items-center h-16 md:h-28 px-4 xl:px-0 overflow-visible relative z-50 isolate'>
        {/* Logo */}
        <div className='flex-shrink-0'>
          <a href="/" className='flex items-center gap-3 no-underline group'>
            <div className='w-14 h-14 md:w-[72px] md:h-[72px] rounded-xl md:rounded-2xl overflow-hidden shadow-md group-hover:shadow-primary-300/50 transition-all duration-300 group-hover:scale-105 flex-shrink-0'>
              <img src={Logo} alt="CapyLumine" className='w-full h-full object-cover' />
            </div>
            <div className='hidden sm:flex flex-col mt-1 md:mt-2'>
              <div className={`text-[20px] md:text-[26px] font-extrabold tracking-tight font-sans leading-none mb-1 flex items-center ml-1`}>
                <span className='text-[#2e1d75] dark:text-[#a89cd9]'>Capy</span>
                <span className='text-[#9328f5] dark:text-[#b774fa]'>Lum</span>
                <span className='relative inline-block'>
                    <span className='text-[#9328f5] dark:text-[#b774fa] relative z-10'>ı</span>
                    {/* Sparkle as dot */}
                    <span className="absolute top-[1px] left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center">
                        <svg className="relative w-1 h-1 md:w-1.5 md:h-1.5 text-[#ffce54]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C12 0 12 10 24 12C12 14 12 24 12 24C12 24 12 14 0 12C12 10 12 0 12 0Z" />
                        </svg>
                    </span>
                </span>
                <span className='text-[#9328f5] dark:text-[#b774fa]'>ne</span>
              </div>
              
              <div className='flex items-center ml-1'>
                <div className="relative flex items-center justify-center">
                    <svg className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] text-[#ffce54] drop-shadow-[0_0_4px_rgba(255,206,84,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.996 12.882A10.016 10.016 0 0 1 12 2.004c0-.28.026-.554.07-.822A9.99 9.99 0 0 0 2 11.996 9.99 9.99 0 0 0 12 21.99 9.99 9.99 0 0 0 21.996 12.882z" />
                    </svg>
                    <svg className="absolute top-[1px] right-[1px] w-1.5 h-1.5 text-[#fff2a8]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C12 0 12 10 24 12C12 14 12 24 12 24C12 24 12 14 0 12C12 10 12 0 12 0Z" />
                    </svg>
                    <svg className="absolute -bottom-1 -right-2 w-2 h-2 text-[#ffce54]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C12 0 12 10 24 12C12 14 12 24 12 24C12 24 12 14 0 12C12 10 12 0 12 0Z" />
                    </svg>
                </div>
                <div className='text-[10px] md:text-[12px] text-[#ffce54] font-extrabold tracking-tighter uppercase leading-none ml-1.5' style={{ fontFamily: 'sans-serif' }}>
                  DREAMY NIGHT LIGHTS
                </div>
                <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#ffce54] ml-1 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C12 0 12 10 24 12C12 14 12 24 12 24C12 24 12 14 0 12C12 10 12 0 12 0Z" />
                </svg>
              </div>
            </div>
          </a>
        </div>

        {/* Menu toggle - visible on mobile & tablet (below lg breakpoint) */}
        <button
          ref={mobileMenuBtnRef}
          className='lg:hidden cursor-pointer bg-transparent border-none p-2 z-[60] relative'
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
        >
          <i className={`bx ${mobileMenuOpen ? 'bx-x' : 'bx-menu'} text-2xl text-gray-800 dark:text-white pointer-events-none`}></i>
        </button>

        {/* Search bar - hidden on mobile, shown on md+ */}
        <div className='hidden md:flex items-center bg-gray-50 dark:bg-gray-800 rounded-full w-2/5 lg:w-1/2 h-11 relative border-2 border-primary-400 dark:border-primary-500 focus-within:ring-2 focus-within:ring-primary-400/20 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all duration-300 shadow-sm hover:shadow-md' ref={searchRef}>
          {/* Search icon */}
          <div className='flex items-center justify-center pl-4 pr-1'>
            {isSearching ? (
              <i className='bx bx-loader-alt bx-spin text-primary-500 text-lg'></i>
            ) : (
              <i className='bx bx-search text-gray-400 dark:text-gray-500 text-lg'></i>
            )}
          </div>

          {/* Input tìm kiếm */}
          <input
            className='flex-1 bg-transparent outline-0 border-0 py-[2px] px-2 h-full text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500'
            type="text"
            placeholder='Tìm kiếm sản phẩm...'
            value={searchKeyword}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (searchKeyword.trim()) fetchSuggestions(searchKeyword); }}
            autoComplete='off'
          />

          {/* Clear button */}
          {searchKeyword && (
            <button
              aria-label="Xóa từ khóa tìm kiếm"
              className='flex items-center justify-center w-7 h-7 mr-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200'
              onClick={() => { setSearchKeyword(''); setSuggestions({ categories: [], products: [] }); setShowSuggestions(false); }}
            >
              <i className='bx bx-x text-gray-400 text-lg'></i>
            </button>
          )}

          {/* Nút tìm kiếm */}
          <button
            aria-label="Tìm kiếm"
            className='flex items-center justify-center w-9 h-9 mr-[2px] bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-all duration-200 active:scale-90 cursor-pointer shrink-0'
            onClick={handleSearch}
          >
            <i className='bx bx-search text-lg'></i>
          </button>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (suggestions.categories.length > 0 || suggestions.products.length > 0) && (
            <div
              ref={suggestionsRef}
              className='absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-100 dark:border-gray-800 z-[60] overflow-hidden animate-fadeIn backdrop-blur-sm'
            >
              {/* Category suggestions */}
              {suggestions.categories.length > 0 && (
                <div className='border-b border-gray-100 dark:border-gray-800'>
                  {suggestions.categories.map((cat) => (
                    <div
                      key={`cat-${cat.id}`}
                      className='flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-150 group'
                      onClick={() => handleCategorySuggestionClick(cat)}
                    >
                      <div className='w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors'>
                        <i className='bx bx-category text-primary-600 dark:text-primary-400 text-sm'></i>
                      </div>
                      <span className='text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'>
                        Tìm trong danh mục <strong className='text-primary-600 dark:text-primary-400'>"{cat.name}"</strong>
                      </span>
                      <i className='bx bx-chevron-right text-gray-400 ml-auto text-lg'></i>
                    </div>
                  ))}
                </div>
              )}

              {/* Product suggestions */}
              {suggestions.products.length > 0 && (
                <div className='py-1'>
                  <div className='px-4 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>Sản phẩm gợi ý</div>
                  {suggestions.products.map((product, index) => (
                    <div
                      key={`prod-${product.id || index}`}
                      className='flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 group'
                      onClick={() => handleProductSuggestionClick(product)}
                    >
                      <i className='bx bx-search text-gray-400 text-base group-hover:text-primary-500 transition-colors'></i>
                      <span className='text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white truncate'>{product.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Xem tất cả kết quả */}
              {searchKeyword.trim() && (
                <div
                  className='border-t border-gray-100 dark:border-gray-800 px-4 py-3 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group flex items-center justify-center gap-2'
                  onClick={handleSearch}
                >
                  <i className='bx bx-right-arrow-alt text-primary-500 group-hover:translate-x-1 transition-transform'></i>
                  <span className='text-sm font-medium text-primary-600 dark:text-primary-400'>Xem tất cả kết quả cho "{searchKeyword}"</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action icons - desktop */}
        <div className='hidden md:block w-auto lg:w-1/5 text-black dark:text-white'>
          <ul className='flex justify-end lg:justify-between items-center gap-2 lg:gap-1'>
            {/* Dark mode toggle */}
            <li className='relative group cursor-pointer' aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'} onClick={toggleDarkMode}>
              <div className='w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-500 hover:bg-primary-50 dark:hover:bg-gray-700 hover:scale-110 hover:shadow-md hover:shadow-primary-200/30 dark:hover:shadow-primary-900/20 active:scale-95'>
                <i className={`bx ${isDark ? 'bx-sun text-primary-400' : 'bx-moon text-indigo-500'} text-xl transition-all duration-500`}
                  style={{ transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)' }}></i>
              </div>
              <span className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[12px] font-bold text-gray-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 z-[100]">
                {isDark ? 'Chế độ sáng' : 'Chế độ tối'}
              </span>
            </li>

            {/* Wishlist */}
            <li className='group relative cursor-pointer' aria-label="Danh sách yêu thích" onClick={() =>
            {
              if (!isAuthenticated)
              {
                toast.info('Vui lòng đăng nhập để xem danh sách yêu thích!');
                return;
              }
              navigate('/wishlist');
            }}>
              <div className='w-10 h-10 flex items-center justify-center rounded-xl bg-primary-50/80 dark:bg-primary-950/30 backdrop-blur-sm transition-all duration-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:scale-110 hover:shadow-md hover:shadow-primary-200/40 active:scale-95'>
                <i className='bx bx-heart text-xl text-primary-500 dark:text-primary-400 transition-all duration-300 group-hover:text-primary-600'></i>
              </div>
              {wishlistCount > 0 && (
                <div className='absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-br from-primary-500 to-pink-600 rounded-full text-center text-[10px] leading-[18px] text-white font-bold shadow-lg shadow-primary-500/30 animate-pulse'>{wishlistCount}</div>
              )}
              <span className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[12px] font-bold text-gray-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 z-[100]">
                Danh sách yêu thích
              </span>
            </li>

            {/* Cart */}
            <li className='flex justify-center items-center gap-2 cursor-pointer group' aria-label="Giỏ hàng" onClick={toggleFormcart} ref={buttonRef}>
              <div className='relative'>
                <div className='w-10 h-10 flex items-center justify-center rounded-xl bg-primary-50/80 dark:bg-primary-950/30 backdrop-blur-sm transition-all duration-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:scale-110 hover:shadow-md hover:shadow-primary-200/40 active:scale-95'>
                  <i id='header-cart-icon' className='bx bx-shopping-bag text-xl text-primary-600 dark:text-primary-400 transition-all duration-300 group-hover:text-primary-700'></i>
                </div>
                <FormCart popupRef={popupRef} toggleCart={toggleCart} setToggleCart={setToggleCart} />
                <div className='absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-br from-primary-400 to-accent-500 rounded-full text-center text-[10px] leading-[18px] text-white font-bold shadow-lg shadow-primary-400/30'>{cartCount}</div>
                <span className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[12px] font-bold text-gray-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 z-[100]">
                  Giỏ hàng
                </span>
              </div>
              <div className='hidden lg:flex flex-col text-xs ml-0.5'>
                <span className='text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight'>Giỏ hàng</span>
                <span className='font-bold text-gray-800 dark:text-gray-200 leading-tight'>{cartTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </li>

            {/* User / Avatar */}
            {
              mounted && isAuthenticated ?
                <>
                  <li onClick={toggleActionLoginForm} ref={buttonActionRef} className='relative cursor-pointer group'>
                    <div className='w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary-400/60 dark:ring-primary-500/40 transition-all duration-300 hover:ring-primary-500 hover:scale-110 hover:shadow-lg hover:shadow-primary-300/30 active:scale-95'>
                      <img className='h-full w-full object-cover' src={avatarURL ? avatarURL : (avatar.ProfileAvatar ? (avatar.ProfileAvatar.startsWith('http') ? avatar.ProfileAvatar : `${API_ENDPOINT}${avatar.ProfileAvatar}`) : avatarimg)} alt="Ảnh đại diện người dùng" />
                    </div>
                    <div className='absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white dark:border-gray-900'></div>
                    <FormActionLogin toggleProfile={toggleProfile} setToggleProfile={setToggleProfile} buttonProfileRef={buttonProfileRef} popupActionRef={popupActionRef} toggleActionLogin={toggleActionLogin} setToggleActionLogin={setToggleActionLogin} />
                    <span className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[12px] font-bold text-gray-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 z-[100]">
                      Tài khoản của tôi
                    </span>
                  </li>
                </> :
                <>
                  <li className='group relative cursor-pointer' aria-label="Đăng nhập" onClick={toggleLoginForm}>
                    <div className='w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:scale-110 hover:shadow-md hover:shadow-indigo-200/30 active:scale-95'>
                      <i className='bx bx-user text-xl text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'></i>
                    </div>
                    <span className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[12px] font-bold text-gray-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 z-[100]">
                      Đăng nhập
                    </span>
                  </li>
                </>
            }
          </ul>
        </div>
        <FormLogin toggleLogin={toggleLogin} setToggleLogin={setToggleLogin} />
      </div>

      {/* Mobile search bar - shown below header on mobile */}
      <div className='md:hidden px-4 pb-3' ref={searchRef}>
        <div className='flex items-center bg-gray-50 dark:bg-gray-800 rounded-full h-10 relative border-2 border-primary-400 dark:border-primary-500 focus-within:ring-2 focus-within:ring-primary-400/20 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all duration-300 shadow-sm'>
          <div className='flex items-center justify-center pl-3.5 pr-1'>
            {isSearching ? (
              <i className='bx bx-loader-alt bx-spin text-primary-500 text-base'></i>
            ) : (
              <i className='bx bx-search text-gray-400 dark:text-gray-500 text-base'></i>
            )}
          </div>
          <input
            className='flex-1 bg-transparent outline-0 border-0 py-[2px] px-2 h-full text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500'
            type="text"
            placeholder='Tìm kiếm sản phẩm...'
            value={searchKeyword}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (searchKeyword.trim()) fetchSuggestions(searchKeyword); }}
            autoComplete='off'
          />
          {searchKeyword && (
            <button
              aria-label="Xóa từ khóa tìm kiếm"
              className='flex items-center justify-center w-6 h-6 mr-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200'
              onClick={() => { setSearchKeyword(''); setSuggestions({ categories: [], products: [] }); setShowSuggestions(false); }}
            >
              <i className='bx bx-x text-gray-400 text-base'></i>
            </button>
          )}
          {/* Nút tìm kiếm mobile */}
          <button
            aria-label="Tìm kiếm"
            className='flex items-center justify-center w-8 h-8 mr-1 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-all duration-200 active:scale-90 cursor-pointer shrink-0'
            onClick={handleSearch}
          >
            <i className='bx bx-search text-base'></i>
          </button>
        </div>
        {/* Mobile Search Suggestions */}
        {
          showSuggestions && (suggestions.categories.length > 0 || suggestions.products.length > 0) && (
            <div
              ref={suggestionsRef}
              className='w-full bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-100 dark:border-gray-800 z-[60] overflow-hidden animate-fadeIn mt-2'
            >
              {suggestions.categories.length > 0 && (
                <div className='border-b border-gray-100 dark:border-gray-800'>
                  {suggestions.categories.map((cat) => (
                    <div key={`mcat-${cat.id}`} className='flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors' onClick={() => handleCategorySuggestionClick(cat)}>
                      <div className='w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0'><i className='bx bx-category text-primary-600 dark:text-primary-400 text-xs'></i></div>
                      <span className='text-sm text-gray-700 dark:text-gray-300 truncate'>Danh mục <strong className='text-primary-600 dark:text-primary-400'>"{cat.name}"</strong></span>
                    </div>
                  ))}
                </div>
              )}
              {suggestions.products.length > 0 && (
                <div className='py-1'>
                  {suggestions.products.map((product, index) => (
                    <div key={`mprod-${product.id || index}`} className='flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors' onClick={() => handleProductSuggestionClick(product)}>
                      <i className='bx bx-search text-gray-400 text-sm'></i>
                      <span className='text-sm text-gray-600 dark:text-gray-400 truncate'>{product.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }
      </div>

      {/* Mobile navigation drawer */}
      {
        mobileMenuOpen && (
          <div className='lg:hidden fixed inset-0 z-[100]'>
            {/* Overlay */}
            <div className='absolute inset-0 bg-black/50' onClick={() => setMobileMenuOpen(false)}></div>
            {/* Drawer */}
            <div className='absolute right-0 top-0 h-full w-72 bg-white shadow-2xl animate-fadeIn overflow-y-auto'>
              <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
                <span className='font-semibold text-lg'>Menu</span>
                <i className='bx bx-x text-2xl cursor-pointer' onClick={() => setMobileMenuOpen(false)}></i>
              </div>
              <div className='p-4'>
                {/* User actions */}
                <div className='space-y-3 mb-6'>
                  {mounted && isAuthenticated ? (
                    <>
                      <div className='flex items-center gap-3 p-2 rounded-lg bg-gray-50'>
                        <img className='w-10 h-10 rounded-full border-2 border-secondary-400' src={avatarURL ? avatarURL : (avatar.ProfileAvatar ? (avatar.ProfileAvatar.startsWith('http') ? avatar.ProfileAvatar : `${API_ENDPOINT}${avatar.ProfileAvatar}`) : avatarimg)} alt="Ảnh đại diện" />
                        <span className='font-medium text-sm'>Tài khoản</span>
                      </div>
                      <div onClick={() => { toggleFormProfile(); setMobileMenuOpen(false); }} className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer'>
                        <i className='bx bx-user text-xl text-gray-600'></i>
                        <span className='text-sm'>Hồ sơ</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {GuestProfileService.getGuestCode() && (
                        <div className='flex items-center gap-3 p-2 rounded-lg bg-primary-50 border border-primary-200'>
                          <div className='w-10 h-10 flex items-center justify-center rounded-full bg-primary-100'>
                            <i className='bx bx-user-circle text-2xl text-primary-600'></i>
                          </div>
                          <div>
                            <span className='font-medium text-xs text-gray-500'>Khách vãng lai</span>
                            <p className='font-bold text-sm text-primary-700'>{GuestProfileService.getGuestCode()}</p>
                          </div>
                        </div>
                      )}
                      <div onClick={() => { toggleLoginForm(); setMobileMenuOpen(false); }} className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer'>
                        <i className='bx bx-log-in text-xl text-gray-600'></i>
                        <span className='text-sm'>Đăng nhập</span>
                      </div>
                      <div onClick={() => { navigate('/my-orders/guest'); setMobileMenuOpen(false); }} className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer'>
                        <i className='bx bx-package text-xl text-gray-600'></i>
                        <span className='text-sm'>Đơn hàng của tôi</span>
                      </div>
                    </>
                  )}
                  <div onClick={() => { toggleFormcart(); setMobileMenuOpen(false); }} className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer'>
                    <i className='bx bx-shopping-bag text-xl text-gray-600'></i>
                    <span className='text-sm'>Giỏ hàng</span>
                  </div>
                  <div onClick={() => { if (!isAuthenticated) { toast.info('Vui lòng đăng nhập để xem danh sách yêu thích!'); } else { navigate('/wishlist'); } setMobileMenuOpen(false); }} className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer'>
                    <i className='bx bx-heart text-xl text-red-500'></i>
                    <span className='text-sm'>Yêu thích</span>
                    {wishlistCount > 0 && (
                      <span className='ml-auto bg-primary-100 text-primary-600 text-xs px-2 py-0.5 rounded-full font-medium'>{wishlistCount}</span>
                    )}
                  </div>
                </div>
                {/* Categories */}
                <div className='border-t border-gray-200 pt-4'>
                  <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>Danh mục</h3>
                  <div className='space-y-1'>
                    {categories.map((category) => (
                      <a key={category.id} href={`#category-${category.id}`} className='flex items-center gap-3 p-3 hover:bg-secondary-50 rounded-lg text-sm text-gray-700' onClick={() => setMobileMenuOpen(false)}>
                        <i className='bx bx-lamp text-secondary-500'></i>
                        {category.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Profile Modal - rendered at top level for correct fixed positioning */}
      <FormProfile popupProfileRef={popupProfileRef} toggleProfile={toggleProfile} setToggleProfile={setToggleProfile} profileApiData={profileApiData} />
    </>
  )
}

export default Header