"use client";

import React from 'react';
import { Modal, Select } from 'antd';

const statusConfig = {
    Pending: { label: 'Chờ xử lý', bg: '#fef3c7', border: '#fcd34d', text: '#b45309', icon: 'bx-time-five' },
    Confirmed: { label: 'Đã xác nhận', bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8', icon: 'bx-check-circle' },
    Shipping: { label: 'Đang giao', bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca', icon: 'bx-package' },
    Completed: { label: 'Hoàn thành', bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', icon: 'bx-check-double' },
    Cancelled: { label: 'Đã hủy', bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', icon: 'bx-x-circle' },
};

const formatPrice = (price) =>
{
    if (!price && price !== 0) return '0';
    return Number(price).toLocaleString('vi-VN');
};

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const OrderDetailModal = ({ order, onClose, onStatusChange }) =>
{
    if (!order) return null;

    const items = order.orderItems?.$values || order.orderItems || [];
    const status = statusConfig[order.status] || statusConfig.Pending;
    const orderDate = order.orderDate
        ? new Date(order.orderDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
        : '--';

    const parseOptions = (optStr) =>
    {
        if (!optStr) return null;
        try
        {
            const obj = JSON.parse(optStr);
            return Object.entries(obj).map(([k, v]) => `${k}: ${typeof v === 'object' ? v.value : v}`).join(', ');
        } catch { return optStr; }
    };

    const getImgSrc = (path) =>
    {
        if (!path) return null;
        return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
    };

    return (
        <Modal
            title={null}
            open={true}
            onCancel={onClose}
            footer={null}
            width={720}
            closable={false}
            styles={{ body: { padding: 0 } }}
            centered
        >
            {/* Header with gradient */}
            <div style={{
                background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '8px 8px 0 0'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Chi tiết đơn hàng</span>
                        <span style={{
                            fontSize: 12, fontFamily: 'monospace', background: 'rgba(0,0,0,0.25)', color: '#fcd34d',
                            padding: '2px 10px', borderRadius: 4
                        }}>
                            #{order.id?.substring(0, 8).toUpperCase()}
                        </span>
                    </div>
                </div>
                <button onClick={onClose} style={{
                    background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}>
                    <i className='bx bx-x' style={{ fontSize: 20, color: '#fff' }}></i>
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', maxHeight: 'calc(85vh - 80px)', overflowY: 'auto' }}>
                {/* Status bar */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', background: '#f9fafb', borderRadius: 10, marginBottom: 20, border: '1px solid #f3f4f6'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#6b7280', fontSize: 13 }}>Trạng thái:</span>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: status.bg, color: status.text, border: `1px solid ${status.border}`
                        }}>
                            <i className={`bx ${status.icon}`} style={{ fontSize: 14 }}></i>
                            {status.label}
                        </span>
                    </div>
                    <Select
                        value={order.status}
                        size="small"
                        style={{ width: 160 }}
                        onChange={(val) => onStatusChange(order.id, val)}
                        options={Object.entries(statusConfig).map(([key, val]) => ({
                            value: key,
                            label: (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                    <i className={`bx ${val.icon}`}></i> {val.label}
                                </span>
                            ),
                        }))}
                    />
                </div>

                {/* Customer info - Table layout */}
                <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <i className='bx bx-user' style={{ color: '#e11d48', fontSize: 16 }}></i>
                        Thông tin khách hàng
                    </h3>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 1fr' }}>
                            <div style={{ padding: '10px 12px', background: '#f9fafb', color: '#6b7280', fontSize: 13, fontWeight: 500, borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Họ tên</div>
                            <div style={{ padding: '10px 12px', fontSize: 13, color: '#111827', fontWeight: 500, borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>{order.fullName}</div>
                            <div style={{ padding: '10px 12px', background: '#f9fafb', color: '#6b7280', fontSize: 13, fontWeight: 500, borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Số điện thoại</div>
                            <div style={{ padding: '10px 12px', fontSize: 13, color: '#111827', borderBottom: '1px solid #e5e7eb' }}>{order.phone}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 1fr' }}>
                            <div style={{ padding: '10px 12px', background: '#f9fafb', color: '#6b7280', fontSize: 13, fontWeight: 500, borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Email</div>
                            <div style={{ padding: '10px 12px', fontSize: 13, color: '#111827', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>{order.email || '—'}</div>
                            <div style={{ padding: '10px 12px', background: '#f9fafb', color: '#6b7280', fontSize: 13, fontWeight: 500, borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>Ngày đặt</div>
                            <div style={{ padding: '10px 12px', fontSize: 13, color: '#111827', borderBottom: '1px solid #e5e7eb' }}>{orderDate}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                            <div style={{ padding: '10px 12px', background: '#f9fafb', color: '#6b7280', fontSize: 13, fontWeight: 500, borderRight: '1px solid #e5e7eb' }}>Địa chỉ</div>
                            <div style={{ padding: '10px 12px', fontSize: 13, color: '#111827' }}>
                                {[order.address, order.ward, order.district, order.city].filter(Boolean).join(', ')}
                            </div>
                        </div>
                        {order.note && (
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', borderTop: '1px solid #e5e7eb' }}>
                                <div style={{ padding: '10px 12px', background: '#f9fafb', color: '#6b7280', fontSize: 13, fontWeight: 500, borderRight: '1px solid #e5e7eb' }}>Ghi chú</div>
                                <div style={{ padding: '10px 12px', fontSize: 13, color: '#d97706', fontStyle: 'italic' }}>
                                    <i className='bx bx-note' style={{ marginRight: 4 }}></i>{order.note}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product list */}
                <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <i className='bx bx-cart' style={{ color: '#e11d48', fontSize: 16 }}></i>
                        Danh sách sản phẩm ({items.length})
                    </h3>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                        {/* Table header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 110px 50px 110px',
                            background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
                            fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5
                        }}>
                            <div style={{ padding: '10px 12px' }}>Sản phẩm</div>
                            <div style={{ padding: '10px 12px', textAlign: 'center' }}>Đơn giá</div>
                            <div style={{ padding: '10px 12px', textAlign: 'center' }}>SL</div>
                            <div style={{ padding: '10px 12px', textAlign: 'right' }}>Thành tiền</div>
                        </div>
                        {/* Table rows */}
                        {items.map((item, idx) =>
                        {
                            const optionText = parseOptions(item.selectedOptions);
                            const imgSrc = getImgSrc(item.productImage);
                            return (
                                <div key={item.id || idx} style={{
                                    display: 'grid', gridTemplateColumns: '1fr 110px 50px 110px',
                                    alignItems: 'center',
                                    borderBottom: idx < items.length - 1 ? '1px solid #f3f4f6' : 'none',
                                    transition: 'background 0.15s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                                    <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        {imgSrc && (
                                            <div style={{
                                                width: 44, height: 44, flexShrink: 0, borderRadius: 8, overflow: 'hidden',
                                                border: '1px solid #f3f4f6', background: '#f9fafb'
                                            }}>
                                                <img src={imgSrc} alt={item.productName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }} />
                                            </div>
                                        )}
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.productName}
                                            </div>
                                            {optionText && (
                                                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                                                    Phân loại: {optionText}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ padding: '10px 12px', textAlign: 'center', fontSize: 13, color: '#e11d48', fontWeight: 500 }}>
                                        {formatPrice(item.price)}đ
                                    </div>
                                    <div style={{ padding: '10px 12px', textAlign: 'center', fontSize: 13, color: '#374151' }}>
                                        {item.quantity}
                                    </div>
                                    <div style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#111827' }}>
                                        {formatPrice(item.price * item.quantity)}đ
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary */}
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '16px 20px', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, color: '#6b7280' }}>
                        <span>Tạm tính:</span>
                        <span style={{ color: '#111827' }}>{formatPrice(order.totalAmount)}đ</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, color: '#6b7280' }}>
                        <span>Phí vận chuyển:</span>
                        <span style={{ color: order.shippingFee > 0 ? '#111827' : '#059669', fontWeight: order.shippingFee > 0 ? 400 : 500 }}>
                            {order.shippingFee > 0 ? `${formatPrice(order.shippingFee)}đ` : 'Miễn phí'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 13, color: '#6b7280' }}>
                        <span>Phương thức thanh toán:</span>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                            background: order.paymentMethod === 'cod' ? '#fef3c7' : '#dbeafe',
                            color: order.paymentMethod === 'cod' ? '#b45309' : '#1d4ed8',
                            border: `1px solid ${order.paymentMethod === 'cod' ? '#fcd34d' : '#93c5fd'}`
                        }}>
                            {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : order.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : order.paymentMethod}
                        </span>
                    </div>
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Tổng cộng:</span>
                        <span style={{ fontWeight: 700, fontSize: 22, color: '#e11d48' }}>
                            {formatPrice(order.totalAmount + (order.shippingFee || 0))}đ
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default OrderDetailModal;
