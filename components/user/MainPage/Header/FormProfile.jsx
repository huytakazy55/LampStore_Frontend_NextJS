"use client";

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';
import { setAvatar } from '@/redux/slices/avatarSlice';
const avatar = '/images/Avatar.jpg';import AuthService from '@/services/AuthService'
import ProfileService from '@/services/ProfileService'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'
import Compressor from 'compressorjs';

const FormProfile = ({ popupProfileRef, toggleProfile, setToggleProfile }) => {
  const dispatch = useDispatch();
  const [token, setToken] = useState(null);
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const [infoSideActive, setInfoSideActive] = useState('info');
  const [profileData, setProfileData] = useState({
    FullName: '',
    Email: '',
    PhoneNumber: '',
    UserId: '',
    Address: '',
    username: '',
    password: '',
    ProfileAvatar: ''
  });

  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (toggleProfile && token) {
      AuthService.profile()
        .then((res) => {
          const userId = jwtDecode(token).nameid;
          setProfileData({
            id: res?.id,
            FullName: res?.fullName,
            UserId: userId,
            Email: res?.email,
            PhoneNumber: res?.phoneNumber,
            Address: res?.address,
            ProfileAvatar: res?.profileAvatar
          });
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, [toggleProfile, token]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (profileData.id) {
      ProfileService.UpdateUserProfile(profileData.id, profileData.FullName, profileData.UserId, profileData.Email, profileData.PhoneNumber, profileData.Address)
        .then((response) => {
          toast.success("Đã cập nhật thông tin hồ sơ.");
          console.log(response.data);
        })
        .catch((error) => {
          toast.error("Lỗi cập nhật hồ sơ.")
          console.log(error);
        });
    } else {
      ProfileService.CreateUserProfile(profileData.FullName, profileData.UserId, profileData.Email, profileData.PhoneNumber, profileData.Address)
        .then((res) => {
          toast.success("Thêm mới hồ sơ thành công.");
        })
        .catch((err) => {
          toast.error("Có lỗi xảy ra khi thêm mới hồ sơ.");
        })
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleDeleteAvatar = (e) => {
    e.preventDefault();
    if (profileData.ProfileAvatar) {
      ProfileService.DeleteAvatar(profileData.id)
        .then((res) => {
          toast.success("Đã xóa ảnh đại diện.");
          dispatch(setAvatar(''));
          setPreviewImage(null);
          profileData.ProfileAvatar = '';
        })
        .catch((err) => {
          toast.error("Có lỗi xảy ra.");
        })
    } else {
      toast.error("Không tồn tại ảnh đại diện.");
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 1 * 1024 * 1024;

    if (file) {
      if (file.size > maxSize) {
        toast.error("Kích thước ảnh phải nhỏ hơn 1MB.");
        return;
      }

      new Compressor(file, {
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
        success(result) {
          const formData = new FormData();
          formData.append('ProfileAvatar', result, result.name);

          ProfileService.UploadAvatar(profileData.id, formData)
            .then((response) => {
              const avatarURL = URL.createObjectURL(result);
              setPreviewImage(avatarURL);
              toast.success("Upload ảnh đại diện thành công.");
              dispatch(setAvatar(avatarURL));
            })
            .catch((error) => {
              toast.error("Upload ảnh không thành công.");
            });
        },
        error(err) {
          toast.error("Có lỗi xảy ra khi nén ảnh.");
        }
      });
    }
  };

  const avatarSrc = previewImage
    ? previewImage
    : profileData.ProfileAvatar
      ? (profileData.ProfileAvatar.startsWith('http') ? profileData.ProfileAvatar : `${API_ENDPOINT}${profileData.ProfileAvatar}`)
      : avatar;

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${toggleProfile ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => setToggleProfile && setToggleProfile(false)}></div>

      {/* Modal */}
      <div ref={popupProfileRef} onClick={(e) => e.stopPropagation()}
        className={`relative w-[95%] max-w-[820px] bg-white dark:bg-gray-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300 ${toggleProfile ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

        {/* Header */}
        <div className='relative bg-gradient-to-r from-rose-600 to-amber-500 px-6 py-5 overflow-hidden'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2'></div>
          <div className='absolute bottom-0 left-16 w-20 h-20 bg-white/5 rounded-full translate-y-1/2'></div>
          <div className='relative z-10'>
            <h2 className='text-lg font-bold text-white flex items-center gap-2'>
              <i className='bx bx-user-circle text-xl'></i>
              Thông tin cá nhân
            </h2>
            <p className='text-sm text-white/70 mt-0.5'>Quản lý thông tin hồ sơ của bạn</p>
          </div>
        </div>

        {/* Body */}
        <div className='flex flex-col md:flex-row max-h-[calc(85vh-80px)] overflow-y-auto'>

          {/* Left Panel - Avatar */}
          <div className='md:w-[260px] flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center bg-gray-50/50 dark:bg-gray-800/30'>
            {/* Avatar */}
            <div className='relative mb-4 group'>
              <div className='w-28 h-28 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-700 shadow-lg'>
                <img className='w-full h-full object-cover' src={avatarSrc} alt="Avatar" />
              </div>
              {/* Delete button */}
              {profileData.ProfileAvatar && (
                <button onClick={handleDeleteAvatar}
                  className='absolute -top-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer group/del'>
                  <i className='bx bx-trash text-sm text-gray-400 group-hover/del:text-red-500 transition-colors'></i>
                </button>
              )}
            </div>

            <p className='text-base font-semibold text-gray-800 dark:text-gray-100 text-center mb-1'>
              {profileData.FullName || '—'}
            </p>
            <p className='text-xs text-gray-400 dark:text-gray-500 text-center mb-5'>{profileData.Email || ''}</p>

            {/* Upload button */}
            <input type="file" id="fileInput" className='hidden' onChange={handleFileChange} accept="image/*" />
            <button type="button" onClick={() => document.getElementById('fileInput').click()}
              className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white text-sm font-medium rounded-lg shadow-md shadow-rose-200 dark:shadow-rose-900/30 transition-all cursor-pointer'>
              <i className='bx bx-upload text-base'></i>
              Tải ảnh mới
            </button>

            <p className='text-[11px] text-gray-400 dark:text-gray-500 text-center mt-3 leading-relaxed'>
              Ảnh JPG, PNG tối đa <strong>1 MB</strong>.<br />Sẽ được tự động resize.
            </p>
          </div>

          {/* Right Panel - Form */}
          <div className='flex-1 min-w-0'>
            {/* Tabs */}
            <div className='flex border-b border-gray-100 dark:border-gray-800 px-6 pt-1'>
              <button onClick={() => setInfoSideActive('info')}
                className={`relative px-1 py-3 mr-6 text-sm font-medium transition-colors cursor-pointer ${infoSideActive === 'info'
                  ? 'text-rose-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-rose-600 after:rounded-full'
                  : 'text-gray-400 hover:text-gray-600'}`}>
                <i className='bx bx-user mr-1.5 align-middle'></i>
                Thông tin người dùng
              </button>
              <button onClick={() => setInfoSideActive('bill')}
                className={`relative px-1 py-3 text-sm font-medium transition-colors cursor-pointer ${infoSideActive === 'bill'
                  ? 'text-rose-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-rose-600 after:rounded-full'
                  : 'text-gray-400 hover:text-gray-600'}`}>
                <i className='bx bx-receipt mr-1.5 align-middle'></i>
                Thông tin hóa đơn
              </button>
            </div>

            {/* Form Content */}
            <div className='p-6'>
              <div className={`${infoSideActive === 'info' ? 'block' : 'hidden'}`}>
                <form onSubmit={handleSubmit}>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-5'>
                    <div>
                      <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2' htmlFor='FullName'>
                        Tên người dùng
                      </label>
                      <input
                        className='w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all placeholder-gray-300'
                        type="text" id='FullName' name='FullName' value={profileData.FullName} onChange={handleInputChange}
                        placeholder='Nhập tên của bạn' />
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2' htmlFor='Email'>
                        Email
                      </label>
                      <input
                        className='w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all placeholder-gray-300'
                        type="email" id='Email' name='Email' value={profileData.Email} onChange={handleInputChange}
                        placeholder='email@example.com' />
                    </div>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-6'>
                    <div>
                      <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2' htmlFor='PhoneNumber'>
                        Số điện thoại
                      </label>
                      <input
                        className='w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all placeholder-gray-300'
                        type="text" id='PhoneNumber' name='PhoneNumber' value={profileData.PhoneNumber} onChange={handleInputChange}
                        placeholder='0xxx xxx xxx' />
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2' htmlFor='Address'>
                        Địa chỉ
                      </label>
                      <input
                        className='w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all placeholder-gray-300'
                        type="text" id='Address' name='Address' value={profileData.Address} onChange={handleInputChange}
                        placeholder='Số nhà, đường, quận/huyện...' />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className='flex justify-end'>
                    <button
                      className='flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-sm font-semibold rounded-lg shadow-md shadow-rose-200 dark:shadow-rose-900/30 transition-all cursor-pointer'
                      type='submit'>
                      <i className='bx bx-check-circle text-base'></i>
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>

              {/* Bill tab */}
              <div className={`${infoSideActive === 'bill' ? 'block' : 'hidden'}`}>
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <div className='w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4'>
                    <i className='bx bx-receipt text-3xl text-gray-300 dark:text-gray-600'></i>
                  </div>
                  <p className='text-gray-400 text-sm'>Chưa có thông tin hóa đơn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default FormProfile