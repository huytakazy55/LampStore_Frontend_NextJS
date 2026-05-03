"use client";

import React from 'react';
import { useLocation } from '@/lib/router-compat';
import Category from '../Category-manage/Category';
import RightBodyContent from './RightBodyContent';
import Users from '../Users-manage/Users';
import Products from '../Products-manage/Products';
import Tags from '../Tags-manage/Tags';
import Banners from '../Banner-manage/Banners';
import FlashSales from '../FlashSale-manage/FlashSales';
import AdminChatDashboard from '../Chat-manage/AdminChatDashboard';
import Settings from '../Settings-manage/Settings';
import Roles from '../Roles-manage/Roles';
import NewsManage from '../News-manage/NewsManage';
import OrdersManage from '../Orders-manage/OrdersManage';
import DeliveryManage from '../Delivery-manage/DeliveryManage';
import AnalyticsPage from '../Analytics-manage/AnalyticsPage';

const RightBody = () => {
  const location = useLocation();

  const renderContent = () => {
    if (location.pathname === '/admin') {
      return <RightBodyContent />;
    }
    else if (location.pathname === '/admin/analytics') {
      return <AnalyticsPage />;
    }
    else if (location.pathname === '/admin/category') {
      return <Category />;
    }
    else if (location.pathname === '/admin/tags') {
      return <Tags />;
    }
    else if (location.pathname === '/admin/banners') {
      return <Banners />;
    }
    else if (location.pathname === '/admin/news') {
      return <NewsManage />;
    }
    else if (location.pathname === '/admin/flashsales') {
      return <FlashSales />
    }
    else if (location.pathname === '/admin/users') {
      return <Users />
    }
    else if (location.pathname === '/admin/roles') {
      return <Roles />
    }
    else if (location.pathname === '/admin/products') {
      return <Products />
    }
    else if (location.pathname === '/admin/chat') {
      return <AdminChatDashboard />
    }
    else if (location.pathname === '/admin/settings') {
      return <Settings />
    }
    else if (location.pathname === '/admin/orders') {
      return <OrdersManage />
    }
    else if (location.pathname === '/admin/delivery') {
      return <DeliveryManage />
    }
    return null;
  };

  return (
    <div className='flex-1 admin-scroll-container bg-gray-100 dark:bg-gray-900'>
      <div key={location.pathname} className='relative page-enter'>
        {renderContent()}
      </div>
    </div>
  );
};

export default RightBody;