"use client";

import React, { useContext } from 'react';
import { Breadcrumb } from 'antd';
import { ThemeContext } from '@/contexts/ThemeContext';

const AdminPageHeader = ({ title, breadcrumbItems, description, actions }) => {
  const { themeColors } = useContext(ThemeContext);

  const defaultItems = [
    { title: 'Trang chủ' },
    { title: title }
  ];

  return (
    <div className="admin-title-bar admin-page-header">
      <div className="admin-page-header-main">
        <h1 className="admin-page-title" style={{ color: themeColors.StartColorLinear }}>
          {title}
        </h1>
        {description && (
          <p className="admin-page-description">
            {description}
          </p>
        )}
        <Breadcrumb
          items={breadcrumbItems || defaultItems}
          className="admin-page-breadcrumb"
        />
      </div>
      {actions && (
        <div className="admin-page-header-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
