"use client";

import React, { useContext } from 'react';
import { Modal, Button } from 'antd';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ModalHeader } from '../shared/ModalComponents';

const statusConfig = {
    Pending: { label: 'Chờ xử lý', bg: '#fef3c7', border: '#fcd34d', text: '#b45309', icon: 'bx-time-five' },
    Confirmed: { label: 'Đã xác nhận', bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8', icon: 'bx-check-circle' },
    Shipping: { label: 'Đang giao', bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca', icon: 'bx-package' },
    Completed: { label: 'Hoàn thành', bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', icon: 'bx-check-double' },
    Cancelled: { label: 'Đã hủy', bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', icon: 'bx-x-circle' },
    FailedDelivery: { label: 'Khách không nhận', bg: '#fff7ed', border: '#fdba74', text: '#c2410c', icon: 'bx-error-circle' },
    ReturnRequested: { label: 'Yêu cầu hoàn trả', bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce', icon: 'bx-revision' },
    Refunded: { label: 'Đã hoàn tiền', bg: '#fdf2f8', border: '#f9a8d4', text: '#be185d', icon: 'bx-wallet' },
};

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipping', 'Completed'];

const nextActionsMap = {
    Pending: { status: 'Confirmed', label: 'Xác nhận đơn hàng', icon: 'bx-check-circle' },
    Confirmed: { status: 'Shipping', label: 'Chuyển giao hàng', icon: 'bx-package' },
    Shipping: { status: 'Completed', label: 'Hoàn thành giao hàng', icon: 'bx-check-double' },
    ReturnRequested: { status: 'Refunded', label: 'Hoàn tiền', icon: 'bx-wallet' },
};

const formatPrice = (price) =>
{
    if (!price && price !== 0) return '0';
    return Number(price).toLocaleString('vi-VN');
};

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const OrderStatusTimeline = ({ currentStatus }) =>
{
    const isTerminalException = ['Cancelled', 'FailedDelivery', 'ReturnRequested', 'Refunded'].includes(currentStatus);
    const currentIdx = STATUS_STEPS.indexOf(currentStatus);

    if (isTerminalException)
    {
        const config = statusConfig[currentStatus] || statusConfig.Cancelled;
        const descriptions = {
            Cancelled: 'Đơn hàng này không thể thay đổi trạng thái',
            FailedDelivery: 'Đơn hàng giao không thành công vì khách không nhận hàng',
            ReturnRequested: 'Khách đã gửi yêu cầu trả hàng/hoàn tiền, cần admin xử lý',
            Refunded: 'Đơn hàng đã hoàn tất xử lý trả hàng và hoàn tiền',
        };

        return (
            <div style={{ padding: '16px 20px', background: config.bg, borderRadius: 10, border: `1px solid ${config.border}`, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: config.text, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                    }}>
                        <i className={`bx ${config.icon}`}></i>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: config.text, fontSize: 14 }}>{config.label}</div>
                        <div style={{ fontSize: 12, color: config.text }}>{descriptions[currentStatus]}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-status-timeline">
            <div className="order-status-steps">
                {STATUS_STEPS.map((step, idx) =>
                {
                    const config = statusConfig[step];
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isSegmentActive = idx < currentIdx;
                    return (
                        <div key={step} className="order-status-step">
                            {idx < STATUS_STEPS.length - 1 && (
                                <div
                                    className="order-status-segment"
                                    style={{
                                        background: isSegmentActive ? 'linear-gradient(90deg, #10b981, #3b82f6)' : '#e5e7eb'
                                    }}
                                />
                            )}
                            <div className="order-status-node" style={{
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
    const { themeColors } = useContext(ThemeContext);

    if (!order) return null;

    const items = order.orderItems?.$values || order.orderItems || [];
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
    const orderCode = order.id?.substring(0, 8).toUpperCase();
    const themeGradient = `linear-gradient(90deg, ${themeColors.StartColorLinear} 0%, ${themeColors.EndColorLinear} 100%)`;

    const handleNextStep = () =>
    {
        if (!nextAction) return;
        const isRefunding = nextAction.status === 'Refunded';
        Modal.confirm({
            title: isRefunding ? 'Xác nhận hoàn tiền' : 'Xác nhận chuyển trạng thái',
            content: isRefunding
                ? 'Xác nhận đã xử lý trả hàng và hoàn tiền cho khách?'
                : `Chuyển đơn hàng sang "${statusConfig[nextAction.status]?.label}"?`,
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
            width={780}
            closable
            className="order-detail-modal"
            styles={{ body: { padding: 0 }, content: { maxWidth: 'calc(100vw - 32px)' } }}
            centered
        >
            <ModalHeader
                icon={<i className='bx bx-receipt'></i>}
                title="Chi tiết đơn hàng"
                subtitle={orderCode ? `Mã đơn #${orderCode}` : undefined}
            />

            <style jsx global>{`
                .order-detail-modal .admin-modal-header {
                    background: ${themeGradient};
                }

                .order-detail-body {
                    padding: 20px 24px 24px;
                    max-height: calc(85vh - 72px);
                    overflow-y: auto;
                }

                .order-section-title {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    margin: 0 0 10px;
                    color: #374151;
                    font-size: 14px;
                    font-weight: 700;
                }

                .order-section-title i {
                    color: ${themeColors.StartColorLinear};
                    font-size: 17px;
                }

                .order-status-timeline {
                    margin-bottom: 18px;
                    padding: 18px 20px;
                    border: 1px solid #eef2f7;
                    border-radius: 10px;
                    background: #f8fafc;
                }

                .order-status-steps {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    position: relative;
                }

                .order-status-step {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 0;
                }

                .order-status-segment {
                    position: absolute;
                    top: 17px;
                    left: 50%;
                    width: 100%;
                    height: 3px;
                    border-radius: 999px;
                    transform: translateX(18px);
                    z-index: 0;
                }

                .order-status-node,
                .order-status-step > div:last-child {
                    position: relative;
                    z-index: 1;
                }

                .order-info-grid {
                    display: grid;
                    grid-template-columns: 128px minmax(0, 1fr) 128px minmax(0, 1fr);
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    overflow: hidden;
                    background: #fff;
                }

                .order-info-label,
                .order-info-value {
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    padding: 10px 14px;
                    border-right: 1px solid #e5e7eb;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 13px;
                    line-height: 1.35;
                }

                .order-info-label {
                    color: #6b7280;
                    font-weight: 600;
                    background: #f8fafc;
                }

                .order-info-value {
                    color: #111827;
                    font-weight: 500;
                    overflow-wrap: anywhere;
                }

                .order-info-grid > :nth-child(4n) {
                    border-right: 0;
                }

                .order-info-wide-label,
                .order-info-wide-value {
                    border-bottom: 0;
                }

                .order-info-wide-value {
                    grid-column: span 3;
                    border-right: 0;
                }

                @media (max-width: 760px) {
                    .order-detail-body {
                        padding: 16px;
                    }

                    .order-info-grid {
                        grid-template-columns: 112px minmax(0, 1fr);
                    }

                    .order-info-grid > * {
                        border-right: 1px solid #e5e7eb;
                    }

                    .order-info-grid > :nth-child(2n) {
                        border-right: 0;
                    }

                    .order-info-wide-value {
                        grid-column: auto;
                    }
                }
            `}</style>

            {/* Body */}
            <div className="order-detail-body">
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
                                    background: themeGradient,
                                    borderColor: themeColors.StartColorLinear,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    borderRadius: 8, fontWeight: 600, height: 38,
                                }}
                            >
                                <i className={`bx ${nextAction.icon}`} style={{ fontSize: 16 }}></i>
                                {nextAction.label}
                            </Button>
                        )}
                        {order.status === 'Shipping' && (
                            <Button
                                danger
                                size="middle"
                                onClick={() =>
                                {
                                    Modal.confirm({
                                        title: 'Xác nhận khách không nhận hàng',
                                        content: 'Đánh dấu đơn hàng giao không thành công vì khách không nhận hàng?',
                                        okText: 'Khách không nhận',
                                        okType: 'danger',
                                        cancelText: 'Đóng',
                                        onOk: () => onStatusChange(order.id, 'FailedDelivery'),
                                    });
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    borderRadius: 8, fontWeight: 600, height: 38,
                                }}
                            >
                                <i className='bx bx-error-circle' style={{ fontSize: 16 }}></i>
                                Khách không nhận
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
                    <h3 className="order-section-title">
                        <i className='bx bx-user'></i>
                        Thông tin khách hàng
                    </h3>
                    <div className="order-info-grid">
                        <div className="order-info-label">Họ tên</div>
                        <div className="order-info-value">{order.fullName}</div>
                        <div className="order-info-label">Số điện thoại</div>
                        <div className="order-info-value">{order.phone}</div>
                        <div className="order-info-label">Email</div>
                        <div className="order-info-value">{order.email || '—'}</div>
                        <div className="order-info-label">Ngày đặt</div>
                        <div className="order-info-value">{orderDate}</div>
                        <div className="order-info-label order-info-wide-label">Địa chỉ</div>
                        <div className="order-info-value order-info-wide-value">
                            {[order.address, order.ward, order.district, order.city].filter(Boolean).join(', ')}
                        </div>
                        {order.note && (
                            <>
                                <div className="order-info-label order-info-wide-label" style={{ borderTop: '1px solid #e5e7eb' }}>Ghi chú</div>
                                <div className="order-info-value order-info-wide-value" style={{ color: '#d97706', fontStyle: 'italic', borderTop: '1px solid #e5e7eb' }}>
                                    <i className='bx bx-note' style={{ marginRight: 4 }}></i>{order.note}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Product list */}
                <div style={{ marginBottom: 20 }}>
                    <h3 className="order-section-title">
                        <i className='bx bx-cart'></i>
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
                                    <div style={{ padding: '10px 12px', textAlign: 'center', fontSize: 13, color: themeColors.StartColorLinear, fontWeight: 500 }}>
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
                        <span style={{ fontWeight: 700, fontSize: 22, color: themeColors.StartColorLinear }}>
                            {formatPrice(order.totalAmount)}đ
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default OrderDetailModal;
