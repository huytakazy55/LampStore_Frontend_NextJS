"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react'
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

const Header = () =>
{
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const navigate = useNavigate();
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

  // Close mobile menu on route change
  useEffect(() =>
  {
    setMobileMenuOpen(false);
  }, [navigate]);

  return (
    <>
      <div className='w-full xl:mx-auto xl:max-w-[1440px] flex justify-between items-center h-16 md:h-28 px-4 xl:px-0 overflow-visible relative z-50 isolate'>
        {/* Logo */}
        <div className='flex-shrink-0'>
          <a href="/" className='flex items-center gap-2 no-underline group'>
            <div className='w-10 h-10 md:w-14 md:h-14 rounded-lg overflow-hidden shadow-md group-hover:shadow-amber-300/50 transition-all duration-300 group-hover:scale-105'>
              <img src={Logo} alt="CapyLumine" className='w-full h-full object-cover' width={56} height={56} />
            </div>
            <div className='hidden sm:block'>
              <div className='text-lg md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors duration-300'>
                Capy<span className='text-amber-600'>Lumine</span>
              </div>
              <div className='text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-[0.15em] uppercase -mt-1 transition-colors duration-300'>
                Premium Lighting
              </div>
            </div>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className='md:hidden cursor-pointer bg-transparent border-none p-2 z-[60] relative'
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
        >
          <i className={`bx ${mobileMenuOpen ? 'bx-x' : 'bx-menu'} text-2xl text-gray-800 dark:text-white pointer-events-none`}></i>
        </button>

        {/* Desktop menu icon (hidden on mobile) */}
        <div className='hidden md:block lg:hidden'>
          <i className='bx bx-menu leading-none align-middle text-h2'></i>
        </div>

        {/* Search bar - hidden on mobile, shown on md+ */}
        <div className='hidden md:flex items-center bg-gray-50 dark:bg-gray-800 rounded-full w-2/5 lg:w-1/2 h-11 relative border-2 border-amber-400 dark:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all duration-300 shadow-sm hover:shadow-md' ref={searchRef}>
          {/* Search icon */}
          <div className='flex items-center justify-center pl-4 pr-1'>
            {isSearching ? (
              <i className='bx bx-loader-alt bx-spin text-amber-500 text-lg'></i>
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
            className='flex items-center justify-center w-9 h-9 mr-[2px] bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-all duration-200 active:scale-90 cursor-pointer shrink-0'
            onClick={handleSearch}
          >
            <i className='bx bx-search text-lg'></i>
          </button>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (suggestions.categories.length > 0 || suggestions.products.length > 0) && (
            <div
              ref={suggestionsRef}
              className='absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-[60] overflow-hidden animate-fadeIn backdrop-blur-sm'
            >
              {/* Category suggestions */}
              {suggestions.categories.length > 0 && (
                <div className='border-b border-gray-100 dark:border-gray-800'>
                  {suggestions.categories.map((cat) => (
                    <div
                      key={`cat-${cat.id}`}
                      className='flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-150 group'
                      onClick={() => handleCategorySuggestionClick(cat)}
                    >
                      <div className='w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 transition-colors'>
                        <i className='bx bx-category text-amber-600 dark:text-amber-400 text-sm'></i>
                      </div>
                      <span className='text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'>
                        Tìm trong danh mục <strong className='text-amber-600 dark:text-amber-400'>"{cat.name}"</strong>
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
                      <i className='bx bx-search text-gray-400 text-base group-hover:text-amber-500 transition-colors'></i>
                      <span className='text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white truncate'>{product.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Xem tất cả kết quả */}
              {searchKeyword.trim() && (
                <div
                  className='border-t border-gray-100 dark:border-gray-800 px-4 py-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group flex items-center justify-center gap-2'
                  onClick={handleSearch}
                >
                  <i className='bx bx-right-arrow-alt text-amber-500 group-hover:translate-x-1 transition-transform'></i>
                  <span className='text-sm font-medium text-amber-600 dark:text-amber-400'>Xem tất cả kết quả cho "{searchKeyword}"</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action icons - desktop */}
        <div className='hidden md:block w-auto lg:w-1/5 text-black dark:text-white'>
          <ul className='flex justify-end lg:justify-between items-center gap-2 lg:gap-1'>
            {/* Dark mode toggle */}
            <li className='relative cursor-pointer' aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'} onClick={toggleDarkMode}>
              <div className='w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-500 hover:bg-amber-50 dark:hover:bg-gray-700 hover:scale-110 hover:shadow-md hover:shadow-amber-200/30 dark:hover:shadow-amber-900/20 active:scale-95'>
                <i className={`bx ${isDark ? 'bx-sun text-amber-400' : 'bx-moon text-indigo-500'} text-xl transition-all duration-500`}
                  style={{ transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)' }}></i>
              </div>
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
              <div className='w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50/80 dark:bg-rose-950/30 backdrop-blur-sm transition-all duration-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:scale-110 hover:shadow-md hover:shadow-rose-200/40 active:scale-95'>
                <i className='bx bx-heart text-xl text-rose-500 dark:text-rose-400 transition-all duration-300 group-hover:text-rose-600'></i>
              </div>
              {wishlistCount > 0 && (
                <div className='absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-br from-rose-500 to-pink-600 rounded-full text-center text-[10px] leading-[18px] text-white font-bold shadow-lg shadow-rose-500/30 animate-pulse'>{wishlistCount}</div>
              )}
            </li>

            {/* Cart */}
            <li className='flex justify-center items-center gap-2 cursor-pointer group' aria-label="Giỏ hàng" onClick={toggleFormcart} ref={buttonRef}>
              <div className='relative'>
                <div className='w-10 h-10 flex items-center justify-center rounded-xl bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-sm transition-all duration-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:scale-110 hover:shadow-md hover:shadow-amber-200/40 active:scale-95'>
                  <i id='header-cart-icon' className='bx bx-shopping-bag text-xl text-amber-600 dark:text-amber-400 transition-all duration-300 group-hover:text-amber-700'></i>
                </div>
                <FormCart popupRef={popupRef} toggleCart={toggleCart} setToggleCart={setToggleCart} />
                <div className='absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-br from-amber-400 to-orange-500 rounded-full text-center text-[10px] leading-[18px] text-white font-bold shadow-lg shadow-amber-400/30'>{cartCount}</div>
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
                    <div className='w-10 h-10 rounded-xl overflow-hidden ring-2 ring-amber-400/60 dark:ring-amber-500/40 transition-all duration-300 hover:ring-amber-500 hover:scale-110 hover:shadow-lg hover:shadow-amber-300/30 active:scale-95'>
                      <img className='h-full w-full object-cover' src={avatarURL ? avatarURL : (avatar.ProfileAvatar ? (avatar.ProfileAvatar.startsWith('http') ? avatar.ProfileAvatar : `${API_ENDPOINT}${avatar.ProfileAvatar}`) : avatarimg)} alt="Ảnh đại diện người dùng" />
                    </div>
                    <div className='absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white dark:border-gray-900'></div>
                    <FormActionLogin toggleProfile={toggleProfile} setToggleProfile={setToggleProfile} buttonProfileRef={buttonProfileRef} popupActionRef={popupActionRef} toggleActionLogin={toggleActionLogin} setToggleActionLogin={setToggleActionLogin} />
                  </li>
                </> :
                <>
                  <li className='group cursor-pointer' aria-label="Đăng nhập" onClick={toggleLoginForm}>
                    <div className='w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:scale-110 hover:shadow-md hover:shadow-indigo-200/30 active:scale-95'>
                      <i className='bx bx-user text-xl text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'></i>
                    </div>
                  </li>
                </>
            }
          </ul>
          <FormLogin toggleLogin={toggleLogin} setToggleLogin={setToggleLogin} />
        </div>
      </div>

      {/* Mobile search bar - shown below header on mobile */}
      <div className='md:hidden px-4 pb-3' ref={searchRef}>
        <div className='flex items-center bg-gray-50 dark:bg-gray-800 rounded-full h-10 relative border-2 border-amber-400 dark:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all duration-300 shadow-sm'>
          <div className='flex items-center justify-center pl-3.5 pr-1'>
            {isSearching ? (
              <i className='bx bx-loader-alt bx-spin text-amber-500 text-base'></i>
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
            className='flex items-center justify-center w-8 h-8 mr-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-all duration-200 active:scale-90 cursor-pointer shrink-0'
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
              className='w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-[60] overflow-hidden animate-fadeIn mt-2'
            >
              {suggestions.categories.length > 0 && (
                <div className='border-b border-gray-100 dark:border-gray-800'>
                  {suggestions.categories.map((cat) => (
                    <div key={`mcat-${cat.id}`} className='flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors' onClick={() => handleCategorySuggestionClick(cat)}>
                      <div className='w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0'><i className='bx bx-category text-amber-600 dark:text-amber-400 text-xs'></i></div>
                      <span className='text-sm text-gray-700 dark:text-gray-300 truncate'>Danh mục <strong className='text-amber-600 dark:text-amber-400'>"{cat.name}"</strong></span>
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
          <div className='md:hidden fixed inset-0 z-[100]'>
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
                        <img className='w-10 h-10 rounded-full border-2 border-yellow-400' src={avatarURL ? avatarURL : (avatar.ProfileAvatar ? (avatar.ProfileAvatar.startsWith('http') ? avatar.ProfileAvatar : `${API_ENDPOINT}${avatar.ProfileAvatar}`) : avatarimg)} alt="Ảnh đại diện" />
                        <span className='font-medium text-sm'>Tài khoản</span>
                      </div>
                      <div onClick={() => { toggleFormProfile(); setMobileMenuOpen(false); }} className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer'>
                        <i className='bx bx-user text-xl text-gray-600'></i>
                        <span className='text-sm'>Hồ sơ</span>
                      </div>
                    </>
                  ) : (
                    <div onClick={() => { toggleLoginForm(); setMobileMenuOpen(false); }} className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer'>
                      <i className='bx bx-user text-xl text-gray-600'></i>
                      <span className='text-sm'>Đăng nhập</span>
                    </div>
                  )}
                  <div onClick={() => { toggleFormcart(); setMobileMenuOpen(false); }} className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer'>
                    <i className='bx bx-shopping-bag text-xl text-gray-600'></i>
                    <span className='text-sm'>Giỏ hàng</span>
                  </div>
                  <div onClick={() => { if (!isAuthenticated) { toast.info('Vui lòng đăng nhập để xem danh sách yêu thích!'); } else { navigate('/wishlist'); } setMobileMenuOpen(false); }} className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer'>
                    <i className='bx bx-heart text-xl text-red-500'></i>
                    <span className='text-sm'>Yêu thích</span>
                    {wishlistCount > 0 && (
                      <span className='ml-auto bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full font-medium'>{wishlistCount}</span>
                    )}
                  </div>
                </div>
                {/* Categories */}
                <div className='border-t border-gray-200 pt-4'>
                  <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>Danh mục</h3>
                  <div className='space-y-1'>
                    {categories.map((category) => (
                      <a key={category.id} href={`#category-${category.id}`} className='flex items-center gap-3 p-3 hover:bg-yellow-50 rounded-lg text-sm text-gray-700' onClick={() => setMobileMenuOpen(false)}>
                        <i className='bx bx-lamp text-yellow-500'></i>
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