"use client";

import React, { useContext } from 'react';
import { Breadcrumb, Card, Row, Col, Typography } from 'antd';
import { ThemeContext } from '@/contexts/ThemeContext';
import AnalyticOverview from '../AnalyticOverview/AnalyticOverview';
import AnalyticChart from '../AnalyticChart/AnalyticChart';

const { Title } = Typography;

const RightBodyContent = () => {
  const { themeColors } = useContext(ThemeContext);

  return (
    <Card
      style={{
        height: '100%',
        padding: '24px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <div style={{fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear}}>
          Dashboard
        </div>
        <Breadcrumb
          items={[
            { title: 'Home' },
            { title: 'Dashboard' }
          ]}
          style={{ marginTop: '8px' }}
        />
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <AnalyticOverview />
        </Col>
        <Col span={24}>
          <AnalyticChart />
        </Col>
      </Row>
    </Card>
  );
};

export default RightBodyContent;