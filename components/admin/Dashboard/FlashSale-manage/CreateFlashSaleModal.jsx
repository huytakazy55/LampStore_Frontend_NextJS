"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import FlashSaleService from '@/services/FlashSaleService';
import axiosInstance from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { resolveImagePath } from '@/lib/imageUtils';

const CreateFlashSaleModal = ({ flashSale, onClose, onSuccess }) => {
    const isEditing = !!flashSale;
    const [form, setForm] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        isActive: true
    });
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load products for picker
    const fetchProducts = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/api/Products');
            const data = res.data.$values || res.data || [];
            setProducts(data);
        } catch { }
    }, []);

    useEffect(() => {
        fetchProducts();
        if (isEditing && flashSale) {
            setForm({
                title: flashSale.title || '',
                description: flashSale.description || '',
                startTime: toDateTimeLocal(flashSale.startTime),
                endTime: toDateTimeLocal(flashSale.endTime),
                isActive: flashSale.isActive
            });
            const existingItems = flashSale.items?.$values || flashSale.items || [];
            setItems(existingItems.map(it => ({
                id: it.id,
                productId: it.productId,
                productName: it.productName || 'Sản phẩm',
                productImageUrl: it.productImageUrl,
                productOriginalPrice: it.productOriginalPrice,
                discountPercent: it.discountPercent,
                flashSalePrice: it.flashSalePrice,
                stock: it.stock,
                order: it.order || 0
            })));
        }
    }, [flashSale, isEditing, fetchProducts]);

    const toDateTimeLocal = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().slice(0, 16);
    };

    const handleAddProduct = (product) => {
        if (items.some(i => i.productId === product.id)) {
            toast.warn('Sản phẩm đã có trong Flash Sale');
            return;
        }
        const originalPrice = product.minPrice || 0;
        const discount = 20;
        setItems(prev => [...prev, {
            productId: product.id,
            productName: product.name,
            productImageUrl: resolveImagePath(product.images?.$values?.[0]?.imagePath || product.images?.[0]?.imagePath),
            productOriginalPrice: originalPrice,
            discountPercent: discount,
            flashSalePrice: Math.round(originalPrice * (100 - discount) / 100),
            stock: 10,
            order: prev.length
        }]);
        setShowProductPicker(false);
        setSearchTerm('');
    };

    const handleItemChange = (index, field, value) => {
        setItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            // Auto-calculate flash sale price when discount changes
            if (field === 'discountPercent') {
                const orig = updated[index].productOriginalPrice || 0;
                updated[index].flashSalePrice = Math.round(orig * (100 - Number(value)) / 100);
            }
            return updated;
        });
    };

    const handleRemoveItem = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.startTime || !form.endTime) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (new Date(form.endTime) <= new Date(form.startTime)) {
            toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
            return;
        }
        setSaving(true);
        try {
            if (isEditing) {
                // Update flash sale info
                await FlashSaleService.updateFlashSale(flashSale.id, {
                    id: flashSale.id,
                    ...form,
                    startTime: new Date(form.startTime).toISOString(),
                    endTime: new Date(form.endTime).toISOString()
                });

                // Sync items: remove old items not in new list, add new items
                const existingItems = flashSale.items?.$values || flashSale.items || [];
                const existingIds = existingItems.map(i => i.id);
                const newItemIds = items.filter(i => i.id).map(i => i.id);

                // Delete removed items
                for (const oldId of existingIds) {
                    if (!newItemIds.includes(oldId)) {
                        await FlashSaleService.removeItem(flashSale.id, oldId);
                    }
                }
                // Add new items (no id = new)
                for (const item of items) {
                    if (!item.id) {
                        await FlashSaleService.addItem(flashSale.id, {
                            productId: item.productId,
                            discountPercent: Number(item.discountPercent),
                            flashSalePrice: Number(item.flashSalePrice),
                            stock: Number(item.stock),
                            order: Number(item.order)
                        });
                    }
                }

                toast.success('Cập nhật Flash Sale thành công!');
            } else {
                // Create flash sale
                const created = await FlashSaleService.createFlashSale({
                    title: form.title,
                    description: form.description,
                    startTime: new Date(form.startTime).toISOString(),
                    endTime: new Date(form.endTime).toISOString(),
                    isActive: form.isActive
                });
                const fsId = created.id;

                // Add items
                for (const item of items) {
                    await FlashSaleService.addItem(fsId, {
                        productId: item.productId,
                        discountPercent: Number(item.discountPercent),
                        flashSalePrice: Number(item.flashSalePrice),
                        stock: Number(item.stock),
                        order: Number(item.order)
                    });
                }
                toast.success('Tạo Flash Sale thành công!');
            }
            onSuccess();
        } catch (error) {
            toast.error('Lỗi: ' + (error?.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                        <i className='bx bxs-bolt'></i>
                        {isEditing ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">
                        <i className='bx bx-x'></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-130px)]">
                    <div className="p-6 space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Tên chương trình <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                                placeholder="VD: Flash Sale Cuối Tuần"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Mô tả
                            </label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm resize-none"
                                rows={2}
                                placeholder="Mô tả chương trình..."
                            />
                        </div>

                        {/* Time Range */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Bắt đầu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.startTime}
                                    onChange={e => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Kết thúc <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.endTime}
                                    onChange={e => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Products Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sản phẩm Flash Sale ({items.length})
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowProductPicker(!showProductPicker)}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                >
                                    <i className='bx bx-plus'></i> Thêm sản phẩm
                                </button>
                            </div>

                            {/* Product Picker */}
                            {showProductPicker && (
                                <div className="mb-4 border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm mb-2"
                                        placeholder="Tìm sản phẩm..."
                                        autoFocus
                                    />
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {filteredProducts.slice(0, 20).map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => handleAddProduct(p)}
                                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-white dark:hover:bg-gray-600 rounded cursor-pointer text-sm"
                                            >
                                                {(p.images?.$values?.[0]?.imagePath || p.images?.[0]?.imagePath) && (
                                                    <img
                                                        src={resolveImagePath(p.images?.$values?.[0]?.imagePath || p.images?.[0]?.imagePath)}
                                                        alt=""
                                                        className="w-8 h-8 rounded object-cover"
                                                    />
                                                )}
                                                <span className="flex-1 text-gray-700 dark:text-gray-200 truncate">{p.name}</span>
                                                <span className="text-xs text-gray-400">{formatPrice(p.minPrice)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Items List */}
                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                        {item.productImageUrl && (
                                            <img
                                                src={resolveImagePath(item.productImageUrl)}
                                                alt=""
                                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                                {item.productName}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Giá gốc: {formatPrice(item.productOriginalPrice)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400">Giảm %</label>
                                                <input
                                                    type="number"
                                                    min="1" max="90"
                                                    value={item.discountPercent}
                                                    onChange={e => handleItemChange(index, 'discountPercent', e.target.value)}
                                                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-center bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400">SL</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.stock}
                                                    onChange={e => handleItemChange(index, 'stock', e.target.value)}
                                                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-center bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div className="text-xs font-semibold text-red-600">
                                                {formatPrice(item.flashSalePrice)}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-1 text-red-400 hover:text-red-600"
                                            >
                                                <i className='bx bx-x text-lg'></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                            {isEditing ? 'Cập nhật' : 'Tạo Flash Sale'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default CreateFlashSaleModal;
