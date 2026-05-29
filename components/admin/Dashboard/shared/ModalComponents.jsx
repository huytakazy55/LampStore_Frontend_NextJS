"use client";

/**
 * ModalHeader - Custom header dùng chung cho tất cả popup admin
 * Props:
 *   icon    - emoji hoặc React node
 *   title   - tiêu đề chính
 *   subtitle - mô tả nhỏ bên dưới (tuỳ chọn)
 */
const ModalHeader = ({ icon, title, subtitle }) => (
  <div className="admin-modal-header">
    <div>
      <div className="admin-modal-title">
        {icon && <span className="admin-modal-icon">{icon}</span>}
        {title}
      </div>
      {subtitle && <div className="admin-modal-subtitle">{subtitle}</div>}
    </div>
  </div>
);

/**
 * ModalFooter - Footer với border-top dùng chung cho popup
 */
const ModalFooter = ({ children }) => (
  <div className="admin-modal-footer">
    {children}
  </div>
);

export { ModalHeader, ModalFooter };
