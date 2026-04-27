"use client";

import React, { useState, useEffect, useCallback } from 'react';
import FlashSaleService from '@/services/FlashSaleService';
import { toast } from 'react-toastify';
import CreateFlashSaleModal from './CreateFlashSaleModal';

const FlashSales = () =>
{
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingFlashSale, setEditingFlashSale] = useState(null);

    const fetchFlashSales = useCallback(async () =>
    {
        try
        {
            setLoading(true);
            const data = await FlashSaleService.getAllFlashSales();
            setFlashSales(Array.isArray(data) ? data : []);
        } catch (error)
        {
            toast.error('Lỗi khi tải danh sách Flash Sale');
        } finally
        {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFlashSales(); }, [fetchFlashSales]);

    const handleDelete = async (id) =>
    {
        if (!window.confirm('Bạn có chắc muốn xóa Flash Sale này?')) return;
        try
        {
            await FlashSaleService.deleteFlashSale(id);
            toast.success('Xóa Flash Sale thành công');
            fetchFlashSales();
        } catch
        {
            toast.error('Lỗi khi xóa Flash Sale');
        }
    };

    const handleToggleActive = async (flashSale) =>
    {
        try
        {
            await FlashSaleService.updateFlashSale(flashSale.id, {
                ...flashSale,
                isActive: !flashSale.isActive
            });
            toast.success(flashSale.isActive ? 'Đã tắt Flash Sale' : 'Đã bật Flash Sale');
            fetchFlashSales();
        } catch
        {
            toast.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const getStatus = (fs) =>
    {
        const now = new Date();
        const start = new Date(fs.startTime);
        const end = new Date(fs.endTime);
        if (!fs.isActive) return { text: 'Tắt', color: 'bg-gray-100 text-gray-600' };
        if (now < start) return { text: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-700' };
        if (now >= start && now < end) return { text: 'Đang diễn ra', color: 'bg-green-100 text-green-700' };
        return { text: 'Đã kết thúc', color: 'bg-red-100 text-red-600' };
    };

    const formatDate = (dateStr) =>
    {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <i className='bx bxs-bolt text-amber-500'></i>
                        Flash Sale
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý chương trình Flash Sale
                    </p>
                </div>
                <button
                    onClick={() => { setEditingFlashSale(null); setShowCreateModal(true); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                >
                    <i className='bx bx-plus text-lg'></i>
                    Tạo Flash Sale
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            ) : flashSales.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <i className='bx bxs-bolt text-5xl text-gray-300 dark:text-gray-600 mb-3 block'></i>
                    <p className="text-gray-500 dark:text-gray-400">Chưa có chương trình Flash Sale nào</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Tên chương trình</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Thời gian</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Sản phẩm</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Trạng thái</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {flashSales.map((fs) =>
                                {
                                    const status = getStatus(fs);
                                    const items = fs.items?.$values || fs.items || [];
                                    return (
                                        <tr key={fs.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800 dark:text-white">{fs.title}</div>
                                                {fs.description && (
                                                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{fs.description}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                <div>{formatDate(fs.startTime)}</div>
                                                <div className="text-gray-400">→ {formatDate(fs.endTime)}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    <i className='bx bx-package'></i>
                                                    {items.length}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => handleToggleActive(fs)}
                                                        className={`p-1.5 rounded-lg transition-colors ${fs.isActive
                                                                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            }`}
                                                        title={fs.isActive ? 'Tắt' : 'Bật'}
                                                    >
                                                        <i className={`bx ${fs.isActive ? 'bx-toggle-right text-xl' : 'bx-toggle-left text-xl'}`}></i>
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingFlashSale(fs); setShowCreateModal(true); }}
                                                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <i className='bx bx-edit text-lg'></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(fs.id)}
                                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <i className='bx bx-trash text-lg'></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <CreateFlashSaleModal
                    flashSale={editingFlashSale}
                    onClose={() => { setShowCreateModal(false); setEditingFlashSale(null); }}
                    onSuccess={() => { setShowCreateModal(false); setEditingFlashSale(null); fetchFlashSales(); }}
                />
            )}
        </div>
    );
};

export default FlashSales;
