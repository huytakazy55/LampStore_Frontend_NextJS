"use client";

import React from 'react';
import { Modal, Button } from 'antd';

const statusConfig = {
    Pending: { label: 'Chờ xử lý', bg: '#fef3c7', border: '#fcd34d', text: '#b45309', icon: 'bx-time-five' },
    Confirmed: { label: 'Đã xác nhận', bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8', icon: 'bx-check-circle' },
    Shipping: { label: 'Đang giao', bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca', icon: 'bx-package' },
    Completed: { label: 'Hoàn thành', bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', icon: 'bx-check-double' },
    Cancelled: { label: 'Đã hủy', bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', icon: 'bx-x-circle' },
};

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipping', 'Completed'];

const nextActionsMap = {
    Pending: { status: 'Confirmed', label: 'Xác nhận đơn hàng', icon: 'bx-check-circle' },
    Confirmed: { status: 'Shipping', label: 'Chuyển giao hàng', icon: 'bx-package' },
    Shipping: { status: 'Completed', label: 'Hoàn thành giao hàng', icon: 'bx-check-double' },
};

const formatPrice = (price) =>
{
    if (!price && price !== 0) return '0';
    return Number(price).toLocaleString('vi-VN');
};

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const OrderStatusTimeline = ({ currentStatus }) =>
{
    const isCancelled = currentStatus === 'Cancelled';
    const currentIdx = STATUS_STEPS.indexOf(currentStatus);

    if (isCancelled)
    {
        return (
            <div style={{ padding: '16px 20px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: '#ef4444', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                    }}>
                        <i className='bx bx-x'></i>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#b91c1c', fontSize: 14 }}>Đơn hàng đã bị hủy</div>
                        <div style={{ fontSize: 12, color: '#dc2626' }}>Đơn hàng này không thể thay đổi trạng thái</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 18, left: 36, right: 36, height: 3, background: '#e5e7eb', borderRadius: 2, zIndex: 0 }} />
                <div style={{
                    position: 'absolute', top: 18, left: 36, height: 3, borderRadius: 2, zIndex: 1,
                    background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                    width: currentIdx >= 0 ? `${(currentIdx / (STATUS_STEPS.length - 1)) * (100 - (72 / (STATUS_STEPS.length - 1) * 100 / 100))}%` : '0%',
                    transition: 'width 0.5s ease',
                }} />
                {STATUS_STEPS.map((step, idx) =>
                {
                    const config = statusConfig[step];
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, fontWeight: 600, transition: 'all 0.3s',
                                background: isCompleted ? '#10b981' : isCurrent ? config.bg : '#f3f4f6',
                                color: isCompleted ? '#fff' : isCurrent ? config.text : '#d1d5db',
                                border: `2.5px solid ${isCompleted ? '#10b981' : isCurrent ? config.border : '#e5e7eb'}`,
                                boxShadow: isCurrent ? `0 0 0 4px ${config.bg}` : 'none',
                                animation: isCurrent ? 'pulse-ring 2s infinite' : 'none',
                            }}>
                                {isCompleted ? <i className='bx bx-check'></i> : <i className={`bx ${config.icon}`}></i>}
                            </div>
                            <div style={{
                                marginTop: 8, fontSize: 11, fontWeight: isCurrent ? 700 : 500, textAlign: 'center',
                                color: isCompleted ? '#10b981' : isCurrent ? config.text : '#9ca3af',
                            }}>
                                {config.label}
                            </div>
                        </div>
                    );
                })}
            </div>
            <style>{`
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); }
                    70% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
                    100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
                }
            `}</style>
        </div>
    );
};

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

    const nextAction = nextActionsMap[order.status];
    const canCancel = order.status === 'Pending' || order.status === 'Confirmed';

    const handleNextStep = () =>
    {
        if (!nextAction) return;
        Modal.confirm({
            title: 'Xác nhận chuyển trạng thái',
            content: `Chuyển đơn hàng sang "${statusConfig[nextAction.status]?.label}"?`,
            okText: nextAction.label,
            cancelText: 'Đóng',
            onOk: () => onStatusChange(order.id, nextAction.status),
        });
    };

    const handleCancel = () =>
    {
        Modal.confirm({
            title: 'Xác nhận hủy đơn hàng',
            content: 'Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác.',
            okText: 'Hủy đơn',
            okType: 'danger',
            cancelText: 'Đóng',
            onOk: () => onStatusChange(order.id, 'Cancelled'),
        });
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
                borderRadius: '4px 4px 0 0'
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
                {/* Status Timeline */}
                <OrderStatusTimeline currentStatus={order.status} />

                {/* Action buttons */}
                {(nextAction || canCancel) && (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
                        {nextAction && (
                            <Button
                                type="primary"
                                size="middle"
                                onClick={handleNextStep}
                                style={{
                                    background: statusConfig[nextAction.status]?.text,
                                    borderColor: statusConfig[nextAction.status]?.border,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    borderRadius: 8, fontWeight: 600, height: 38,
                                }}
                            >
                                <i className={`bx ${nextAction.icon}`} style={{ fontSize: 16 }}></i>
                                {nextAction.label}
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                danger
                                size="middle"
                                onClick={handleCancel}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    borderRadius: 8, fontWeight: 600, height: 38,
                                }}
                            >
                                <i className='bx bx-x-circle' style={{ fontSize: 16 }}></i>
                                Hủy đơn hàng
                            </Button>
                        )}
                    </div>
                )}

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
                        <span style={{ color: '#111827' }}>{formatPrice(order.totalAmount - (order.shippingFee || 0))}đ</span>
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
                            {formatPrice(order.totalAmount)}đ
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default OrderDetailModal;
