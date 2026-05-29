"use client";

import React from 'react';
import { Row, Col } from 'antd';
import AdminPageHeader from '../shared/AdminPageHeader';
import AnalyticOverview from '../AnalyticOverview/AnalyticOverview';
import AnalyticChart from '../AnalyticChart/AnalyticChart';

const RightBodyContent = () => {
  return (
    <div style={{ padding: '16px' }}>
      <AdminPageHeader
        title="Dashboard"
        breadcrumbItems={[
          { title: 'Home' },
          { title: 'Dashboard' }
        ]}
      />

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <AnalyticOverview />
        </Col>
        <Col span={24}>
          <AnalyticChart />
        </Col>
      </Row>
    </div>
  );
};

export default RightBodyContent;
