"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react'
import FormLogin from './FormLogin'
import FormCart from './FormCart';
import FormActionLogin from './FormActionLogin';
import { useSelector } from 'react-redux';
// react-tooltip css removed;
import { toast } from 'react-toastify';
const Logo = '/images/Capylumine.png';const avatarimg = '/images/Avatar.jpg';import AuthService from '@/services/AuthService';
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
  const [arrowIcon, setArrowIcon] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { data: categories = [] } = useCategories();
  const [suggestions, setSuggestions] = useState({ categories: [], products: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        })
        .catch((error) =>
        {
          console.error("Error fetching profile:", error);
        });
    } else
    {
      setAvatar({ ProfileAvatar: '' });
    }
  }, [token]);



  const toggleLoginForm = () =>
  {
    setToggleLogin(!toggleLogin);
  }

  const toggleArrow = () =>
  {
    setArrowIcon(!arrowIcon);
  };

  const closeArrow = () =>
  {
    setArrowIcon(false);
  };

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

  // Xử lý tìm kiếm nhanh
  const handleQuickSearch = async () =>
  {
    if (!searchKeyword.trim()) return;

    setIsSearching(true);
    try
    {
      const result = await SearchService.quickSearch(searchKeyword);

      // Chuyển đến trang kết quả tìm kiếm
      navigate('/search', {
        state: {
          searchResults: result,
          keyword: searchKeyword,
          categoryId: selectedCategory
        }
      });
    } catch (error)
    {
      console.error('Search error:', error);
    } finally
    {
      setIsSearching(false);
    }
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

  // Handle suggestion click - category
  const handleCategorySuggestionClick = (category) =>
  {
    setShowSuggestions(false);
    setSearchKeyword('');
    navigate('/search', {
      state: {
        keyword: searchKeyword,
        categoryId: category.id
      }
    });
  };

  // Handle suggestion click - product
  const handleProductSuggestionClick = (product) =>
  {
    setShowSuggestions(false);
    setSearchKeyword(product.name || '');
    navigate(`/product/${product.id}`);
  };

  // Xử lý Enter key
  const handleKeyDown = (e) =>
  {
    if (e.key === 'Enter')
    {
      setShowSuggestions(false);
      handleQuickSearch();
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

    document.addEventListener('click', handleOutsideClick, true);
    return () =>
    {
      document.removeEventListener('click', handleOutsideClick, true);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() =>
  {
    setMobileMenuOpen(false);
  }, [navigate]);

  return (
    <>
      <div className='w-full xl:mx-auto xl:max-w-[1440px] flex justify-between items-center h-16 md:h-28 px-4 xl:px-0'>
        {/* Logo */}
        <div className='flex-shrink-0'>
          <a href="/" className='flex items-center gap-2 no-underline group'>
            <div className='w-10 h-10 md:w-14 md:h-14 rounded-lg overflow-hidden shadow-md group-hover:shadow-amber-300/50 transition-all duration-300 group-hover:scale-105'>
              <img src={Logo} alt="CapyLumine" className='w-full h-full object-cover' />
            </div>
            <div className='hidden sm:block'>
              <div className='text-lg md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors duration-300'>
                Capy<span className='text-amber-500'>Lumine</span>
              </div>
              <div className='text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-[0.15em] uppercase -mt-1 transition-colors duration-300'>
                Premium Lighting
              </div>
            </div>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className='md:hidden cursor-pointer' onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <i className={`bx ${mobileMenuOpen ? 'bx-x' : 'bx-menu'} text-2xl`}></i>
        </div>

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
              className='flex items-center justify-center w-7 h-7 mr-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200'
              onClick={() => { setSearchKeyword(''); setSuggestions({ categories: [], products: [] }); setShowSuggestions(false); }}
            >
              <i className='bx bx-x text-gray-400 text-lg'></i>
            </button>
          )}

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
            </div>
          )}

          {/* Dropdown danh mục */}
          <div className='hidden lg:flex items-center h-full relative w-[30%] border-l border-amber-300 dark:border-amber-600'>
            <div
              className='flex items-center justify-between w-full h-full px-4 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-r-full'
              onClick={() => setArrowIcon(!arrowIcon)}
              onBlur={() => setTimeout(() => setArrowIcon(false), 150)}
              tabIndex={0}
            >
              <span className='text-sm font-medium text-gray-500 dark:text-gray-400 truncate'>
                {selectedCategory
                  ? categories.find(c => String(c.id) === String(selectedCategory))?.name || 'Tất cả danh mục'
                  : 'Tất cả danh mục'}
              </span>
              <i className={`bx bx-chevron-down text-gray-400 text-sm transition-transform duration-300 flex-shrink-0 ${arrowIcon ? 'rotate-180' : ''}`}></i>
            </div>

            {/* Custom Dropdown Menu */}
            <div
              className={`absolute top-[calc(100%+8px)] right-0 w-full min-w-[200px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden transition-all duration-300 origin-top ${arrowIcon
                ? 'opacity-100 scale-y-100 translate-y-0'
                : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
                }`}
            >
              <div className='py-1.5 max-h-[280px] overflow-y-auto custom-scrollbar'>
                <div
                  className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-all duration-200 text-sm ${selectedCategory === ''
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold border-l-[3px] border-amber-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:pl-5 border-l-[3px] border-transparent'
                    }`}
                  onClick={() => { setSelectedCategory(''); setArrowIcon(false); }}
                >
                  <i className={`bx bx-category text-base ${selectedCategory === '' ? 'text-amber-500' : 'text-gray-400'}`}></i>
                  Tất cả danh mục
                </div>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-all duration-200 text-sm ${String(selectedCategory) === String(category.id)
                      ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold border-l-[3px] border-amber-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:pl-5 border-l-[3px] border-transparent'
                      }`}
                    onClick={() => { setSelectedCategory(String(category.id)); setArrowIcon(false); }}
                  >
                    <i className={`bx bx-lamp text-base ${String(selectedCategory) === String(category.id) ? 'text-amber-500' : 'text-gray-400'}`}></i>
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action icons - desktop */}
        <div className='hidden md:block w-auto lg:w-1/5 text-black dark:text-white'>
          <ul className='flex justify-end lg:justify-between items-center gap-3 lg:gap-0'>
            {/* Dark mode toggle */}
            <li className='relative cursor-pointer' onClick={toggleDarkMode}>
              <div className='w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 hover:bg-amber-100 dark:hover:bg-gray-700'>
                <i className={`bx ${isDark ? 'bx-sun text-amber-400' : 'bx-moon text-indigo-500'} text-xl transition-all duration-500`}
                  style={{ transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)' }}></i>
              </div>
            </li>
            <li className='group relative cursor-pointer' onClick={() =>
            {
              if (!isAuthenticated)
              {
                toast.info('Vui lòng đăng nhập để xem danh sách yêu thích!');
                return;
              }
              navigate('/wishlist');
            }}>
              <i className='bx bx-heart text-h2 leading-none align-middle text-red-600 cursor-pointer transition-transform duration-100 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]'></i>
              {wishlistCount > 0 && (
                <div className='absolute right-[-7px] bottom-[-10px] w-5 h-5 bg-rose-500 rounded-[50%] text-center text-xs leading-5 text-white font-medium'>{wishlistCount}</div>
              )}
            </li>
            <li className='flex justify-center items-center gap-1 cursor-pointer group' onClick={toggleFormcart} ref={buttonRef} >
              <div className='relative'>
                <i id='header-cart-icon' className='bx bx-shopping-bag text-h2 leading-none align-middle transition-transform duration-100 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]'></i>
                <FormCart popupRef={popupRef} toggleCart={toggleCart} setToggleCart={setToggleCart} />
                <div className='absolute right-[-7px] bottom-[-10px] w-5 h-5 bg-yellow-400 rounded-[50%] text-center text-xs leading-5 text-gray-700 font-medium'>{cartCount}</div>
              </div>
              <div className='hidden lg:block text-small ml-1 p-[2px] relative font-medium'>
                <div className='absolute w-1 h-1 -top-[2px] -left-[7px] text-small'>₫</div>
                {cartTotal.toLocaleString('vi-VN')}
              </div>
            </li>
            <FormLogin toggleLogin={toggleLogin} setToggleLogin={setToggleLogin} />

            {
              isAuthenticated ?
                <>
                  <li onClick={toggleActionLoginForm} ref={buttonActionRef} className='relative w-8 h-8 leading-8 border-2 border-yellow-400 rounded-[20%] p-[1px] cursor-pointer'>
                    <img className='rounded-[20%] h-full w-full ' src={avatarURL ? avatarURL : (avatar.ProfileAvatar ? (avatar.ProfileAvatar.startsWith('http') ? avatar.ProfileAvatar : `${API_ENDPOINT}${avatar.ProfileAvatar}`) : avatarimg)} alt="" />
                    <FormActionLogin toggleProfile={toggleProfile} setToggleProfile={setToggleProfile} buttonProfileRef={buttonProfileRef} popupActionRef={popupActionRef} toggleActionLogin={toggleActionLogin} setToggleActionLogin={setToggleActionLogin} />
                  </li>
                </> :
                <>
                  <li className='group' onClick={toggleLoginForm}>
                    <i className='bx bx-user text-h2 leading-none align-middle cursor-pointer transition-transform duration-100 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]'></i>
                  </li>
                </>
            }
          </ul>
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
              className='flex items-center justify-center w-6 h-6 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200'
              onClick={() => { setSearchKeyword(''); setSuggestions({ categories: [], products: [] }); setShowSuggestions(false); }}
            >
              <i className='bx bx-x text-gray-400 text-base'></i>
            </button>
          )}
        </div>
        {/* Mobile Search Suggestions */}
        {showSuggestions && (suggestions.categories.length > 0 || suggestions.products.length > 0) && (
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
        )}
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
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
                {isAuthenticated ? (
                  <>
                    <div className='flex items-center gap-3 p-2 rounded-lg bg-gray-50'>
                      <img className='w-10 h-10 rounded-full border-2 border-yellow-400' src={avatarURL ? avatarURL : (avatar.ProfileAvatar ? (avatar.ProfileAvatar.startsWith('http') ? avatar.ProfileAvatar : `${API_ENDPOINT}${avatar.ProfileAvatar}`) : avatarimg)} alt="" />
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
      )}

      {/* Profile Modal - rendered at top level for correct fixed positioning */}
      <FormProfile popupProfileRef={popupProfileRef} toggleProfile={toggleProfile} setToggleProfile={setToggleProfile} />
    </>
  )
}

export default Header