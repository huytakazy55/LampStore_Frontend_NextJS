"use client";

import { useState } from 'react';
import { toast } from 'react-toastify';
import AuthService from '@/services/AuthService';

const ChangePasswordModal = ({ isOpen, onClose }) =>
{
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () =>
    {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
    };

    const handleClose = () =>
    {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword)
        {
            toast.warning('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        if (newPassword.length < 6)
        {
            toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }
        if (newPassword !== confirmPassword)
        {
            toast.warning('Mật khẩu xác nhận không khớp!');
            return;
        }
        if (currentPassword === newPassword)
        {
            toast.warning('Mật khẩu mới phải khác mật khẩu hiện tại!');
            return;
        }

        setSubmitting(true);
        try
        {
            await AuthService.changePassword(currentPassword, newPassword);
            toast.success('Đổi mật khẩu thành công! 🔒');
            handleClose();
        } catch (err)
        {
            const msg = err.response?.data?.message || err.response?.data?.detail || 'Có lỗi xảy ra, vui lòng thử lại.';
            toast.error(msg);
        } finally
        {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = 'w-full border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition placeholder:text-gray-400';

    return (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'
            onClick={handleClose}
            onWheel={e => e.stopPropagation()}>
            <div className='bg-white dark:bg-gray-900 w-full max-w-md rounded-lg shadow-2xl overflow-hidden'
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-gray-800 dark:to-gray-800'>
                    <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                        <i className='bx bx-lock-alt text-rose-500'></i>
                        Đổi mật khẩu
                    </h2>
                    <button onClick={handleClose}
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer'>
                        <i className='bx bx-x text-xl text-gray-500'></i>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                    {/* Current Password */}
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Mật khẩu hiện tại</label>
                        <div className='relative'>
                            <i className='bx bx-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'></i>
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                className={inputClass}
                                placeholder='Nhập mật khẩu hiện tại'
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                disabled={submitting}
                                autoFocus
                            />
                            <button type='button' onClick={() => setShowCurrent(!showCurrent)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer'>
                                <i className={`bx ${showCurrent ? 'bx-show' : 'bx-hide'}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Mật khẩu mới</label>
                        <div className='relative'>
                            <i className='bx bx-key absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'></i>
                            <input
                                type={showNew ? 'text' : 'password'}
                                className={inputClass}
                                placeholder='Nhập mật khẩu mới (tối thiểu 6 ký tự)'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={submitting}
                            />
                            <button type='button' onClick={() => setShowNew(!showNew)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer'>
                                <i className={`bx ${showNew ? 'bx-show' : 'bx-hide'}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Xác nhận mật khẩu mới</label>
                        <div className='relative'>
                            <i className='bx bx-check-shield absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'></i>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                className={inputClass}
                                placeholder='Nhập lại mật khẩu mới'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={submitting}
                            />
                            <button type='button' onClick={() => setShowConfirm(!showConfirm)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer'>
                                <i className={`bx ${showConfirm ? 'bx-show' : 'bx-hide'}`}></i>
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
                                <i className='bx bx-error-circle'></i> Mật khẩu không khớp
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className='flex justify-end gap-3 pt-2'>
                        <button type='button' onClick={handleClose}
                            className='px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 transition cursor-pointer'>
                            Huỷ
                        </button>
                        <button type='submit' disabled={submitting}
                            className='px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5'>
                            {submitting
                                ? <><i className='bx bx-loader-alt animate-spin'></i> Đang xử lý...</>
                                : <><i className='bx bx-check'></i> Đổi mật khẩu</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
