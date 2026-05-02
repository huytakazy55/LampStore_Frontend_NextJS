"use client";

/**
 * ModalHeader - Custom header dùng chung cho tất cả popup admin
 * Props:
 *   icon    - emoji hoặc React node
 *   title   - tiêu đề chính
 *   subtitle - mô tả nhỏ bên dưới (tuỳ chọn)
 */
const ModalHeader = ({ icon, title }) => (
  <div style={{
    padding: '20px 24px 16px',
    borderBottom: '1.5px solid #e5e7eb',
    background: 'linear-gradient(135deg, #f7f9ff 0%, #eff3fc 100%)',
    borderRadius: '4px 4px 0 0',
    margin: '-20px -24px 0',
  }}>
    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a2340' }}>
      {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
      {title}
    </div>
  </div>
);

/**
 * ModalFooter - Footer với border-top dùng chung cho popup
 */
const ModalFooter = ({ children }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 16,
    borderTop: '1px solid #f0f2f5',
    marginTop: 8,
  }}>
    {children}
  </div>
);

export { ModalHeader, ModalFooter };
