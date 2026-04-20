"use client";

import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Tabs, Switch, Slider, Button, Divider, Select, Input, message } from 'antd';
import
  {
    BellOutlined,
    SettingOutlined,
    UserOutlined,
    SoundOutlined,
    NotificationOutlined,
    ExperimentOutlined
  } from '@ant-design/icons';
import { ThemeContext } from '@/contexts/ThemeContext';
import NotificationService from '@/services/NotificationService';

const { Option } = Select;

const Settings = () =>
{
  const { themeColors } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);

  // Notification Settings
  const [audioSettings, setAudioSettings] = useState({
    isEnabled: true,
    volume: 70,
    notificationType: 'all'
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    logLevel: 'info',
    sessionTimeout: 30
  });

  // User Settings
  const [userSettings, setUserSettings] = useState({
    defaultPageSize: 10,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    language: 'vi'
  });

  useEffect(() =>
  {
    loadSettings();
  }, []);

  const loadSettings = () =>
  {
    const audioConfig = NotificationService.getAudioSettings();
    setAudioSettings({
      isEnabled: audioConfig.isEnabled,
      volume: Math.round(audioConfig.volume * 100),
      notificationType: 'all'
    });
    try
    {
      const savedSystemSettings = localStorage.getItem('systemSettings');
      if (savedSystemSettings) setSystemSettings(JSON.parse(savedSystemSettings));
      const savedUserSettings = localStorage.getItem('userSettings');
      if (savedUserSettings) setUserSettings(JSON.parse(savedUserSettings));
    } catch (error)
    {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = (settingsType, settings) =>
  {
    try
    {
      if (settingsType === 'system')
      {
        localStorage.setItem('systemSettings', JSON.stringify(settings));
        message.success('Đã lưu cài đặt hệ thống');
      } else if (settingsType === 'user')
      {
        localStorage.setItem('userSettings', JSON.stringify(settings));
        message.success('Đã lưu cài đặt người dùng');
      }
    } catch (error)
    {
      message.error('Lỗi khi lưu cài đặt');
    }
  };

  const handleAudioToggle = (enabled) =>
  {
    NotificationService.setAudioEnabled(enabled);
    setAudioSettings(prev => ({ ...prev, isEnabled: enabled }));
    message.success(`Đã ${enabled ? 'bật' : 'tắt'} âm thanh thông báo`);
  };

  const handleVolumeChange = (value) =>
  {
    NotificationService.setAudioVolume(value / 100);
    setAudioSettings(prev => ({ ...prev, volume: value }));
  };

  const handleTestNotification = () =>
  {
    NotificationService.addTestNotification();
    message.info('Đã gửi thông báo test');
  };

  const handleTestSound = () =>
  {
    NotificationService.testNotificationSound();
  };

  const handleSystemSettingChange = (key, value) =>
  {
    const newSettings = { ...systemSettings, [key]: value };
    setSystemSettings(newSettings);
    saveSettings('system', newSettings);
  };

  const handleUserSettingChange = (key, value) =>
  {
    const newSettings = { ...userSettings, [key]: value };
    setUserSettings(newSettings);
    saveSettings('user', newSettings);
  };

  const tabItems = [
    {
      key: 'notifications',
      label: <span><BellOutlined /> Thông báo</span>,
      children: (
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title={<span><SoundOutlined style={{ marginRight: 8, color: themeColors.StartColorLinear }} />Cài đặt âm thanh thông báo</span>} style={{ marginBottom: 16 }}>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Bật/Tắt âm thanh thông báo</label>
                    <Switch checked={audioSettings.isEnabled} onChange={handleAudioToggle} checkedChildren="Bật" unCheckedChildren="Tắt" />
                  </div>
                  {audioSettings.isEnabled && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Âm lượng: {audioSettings.volume}%</label>
                      <Slider min={0} max={100} value={audioSettings.volume} onChange={handleVolumeChange} marks={{ 0: '0%', 50: '50%', 100: '100%' }} />
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Loại thông báo</label>
                    <Select value={audioSettings.notificationType} onChange={(value) => setAudioSettings(prev => ({ ...prev, notificationType: value }))} style={{ width: '100%' }}>
                      <Option value="all">Tất cả thông báo</Option>
                      <Option value="chat">Chỉ tin nhắn chat</Option>
                      <Option value="urgent">Chỉ thông báo khẩn cấp</Option>
                      <Option value="none">Không phát âm thanh</Option>
                    </Select>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
                    <h4 style={{ marginBottom: 16 }}>Test thông báo</h4>
                    <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                      <Button type="primary" icon={<ExperimentOutlined />} onClick={handleTestNotification} style={{ background: `linear-gradient(135deg, ${themeColors.StartColorLinear} 0%, ${themeColors.EndColorLinear} 100%)`, border: 'none' }}>Test thông báo hoàn chỉnh</Button>
                      <Button icon={<SoundOutlined />} onClick={handleTestSound} disabled={!audioSettings.isEnabled}>Test chỉ âm thanh</Button>
                    </div>
                    <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                      <p>• Test thông báo sẽ tạo thông báo mẫu trong dropdown</p>
                      <p>• Test âm thanh chỉ phát âm thanh không tạo thông báo</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
            <Card title={<span><NotificationOutlined style={{ marginRight: 8, color: themeColors.StartColorLinear }} />Cài đặt thông báo trình duyệt</span>}>
              <div style={{ marginBottom: 16 }}>
                <p>Cho phép thông báo từ trình duyệt để nhận thông báo ngay cả khi đang sử dụng tab khác.</p>
                <Button onClick={() => NotificationService.requestNotificationPermission()} type="dashed">Yêu cầu quyền thông báo</Button>
              </div>
            </Card>
            <Card title={<span><ExperimentOutlined style={{ marginRight: 8, color: themeColors.StartColorLinear }} />Debug kết nối SignalR</span>} style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ marginBottom: 12 }}>Sử dụng các công cụ dưới đây nếu không nhận được thông báo real-time:</p>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <Button icon={<ExperimentOutlined />} onClick={() => { const debugInfo = NotificationService.debugConnection(); message.info(`Kiểm tra console để xem chi tiết. Connected: ${debugInfo.signalRInitialized && debugInfo.chatServiceConnected}`); }}>Kiểm tra trạng thái</Button>
                  <Button type="primary" danger onClick={async () => { try { message.loading('Đang kết nối lại...', 2); const result = await NotificationService.forceReconnect(); if (result) { message.success('Kết nối lại thành công!'); } else { message.error('Kết nối lại thất bại'); } } catch (error) { message.error('Lỗi khi kết nối lại'); } }}>Kết nối lại SignalR</Button>
                </div>
                <div style={{ fontSize: 12, color: '#666', padding: 8, backgroundColor: '#f9f9f9', borderRadius: 4 }}>
                  <strong>Lưu ý:</strong> Nếu không nhận được thông báo sau khi đăng nhập:
                  <br />• Bấm "Kiểm tra trạng thái" và xem console (F12)
                  <br />• Bấm "Kết nối lại SignalR" để force reconnect
                  <br />• Nếu vẫn lỗi, hãy refresh trang và đăng nhập lại
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'system',
      label: <span><SettingOutlined /> Hệ thống</span>,
      children: (
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title="Sao lưu dữ liệu" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tự động sao lưu</label>
                <Switch checked={systemSettings.autoBackup} onChange={(value) => handleSystemSettingChange('autoBackup', value)} checkedChildren="Bật" unCheckedChildren="Tắt" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tần suất sao lưu</label>
                <Select value={systemSettings.backupFrequency} onChange={(value) => handleSystemSettingChange('backupFrequency', value)} style={{ width: '100%' }} disabled={!systemSettings.autoBackup}>
                  <Option value="hourly">Mỗi giờ</Option>
                  <Option value="daily">Hàng ngày</Option>
                  <Option value="weekly">Hàng tuần</Option>
                  <Option value="monthly">Hàng tháng</Option>
                </Select>
              </div>
            </Card>
            <Card title="Logging">
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mức độ log</label>
                <Select value={systemSettings.logLevel} onChange={(value) => handleSystemSettingChange('logLevel', value)} style={{ width: '100%' }}>
                  <Option value="error">Error only</Option>
                  <Option value="warn">Warning & Error</Option>
                  <Option value="info">Info, Warning & Error</Option>
                  <Option value="debug">Debug (All)</Option>
                </Select>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Bảo mật">
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Thời gian hết hạn phiên (phút)</label>
                <Input type="number" value={systemSettings.sessionTimeout} onChange={(e) => handleSystemSettingChange('sessionTimeout', parseInt(e.target.value))} min={5} max={480} />
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Từ 5 đến 480 phút (8 giờ)</div>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'user',
      label: <span><UserOutlined /> Giao diện</span>,
      children: (
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title="Hiển thị dữ liệu" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Số dòng mỗi trang</label>
                <Select value={userSettings.defaultPageSize} onChange={(value) => handleUserSettingChange('defaultPageSize', value)} style={{ width: '100%' }}>
                  <Option value={5}>5 dòng</Option>
                  <Option value={10}>10 dòng</Option>
                  <Option value={20}>20 dòng</Option>
                  <Option value={50}>50 dòng</Option>
                  <Option value={100}>100 dòng</Option>
                </Select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Định dạng ngày</label>
                <Select value={userSettings.dateFormat} onChange={(value) => handleUserSettingChange('dateFormat', value)} style={{ width: '100%' }}>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  <Option value="DD-MM-YYYY">DD-MM-YYYY</Option>
                </Select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Định dạng giờ</label>
                <Select value={userSettings.timeFormat} onChange={(value) => handleUserSettingChange('timeFormat', value)} style={{ width: '100%' }}>
                  <Option value="24h">24 giờ (14:30)</Option>
                  <Option value="12h">12 giờ (2:30 PM)</Option>
                </Select>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Ngôn ngữ & Khu vực">
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ngôn ngữ giao diện</label>
                <Select value={userSettings.language} onChange={(value) => handleUserSettingChange('language', value)} style={{ width: '100%' }}>
                  <Option value="vi">Tiếng Việt</Option>
                  <Option value="en">English</Option>
                </Select>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div className="admin-title-bar" style={{ background: '#f6f8fc', padding: '24px 24px 16px', marginBottom: 24 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear }}>Cài đặt hệ thống</div>
        <div style={{ marginTop: 8 }}>
          <span style={{ color: '#888' }}>Trang chủ</span>
          <span style={{ margin: '0 8px', color: '#bbb' }}>/</span>
          <span style={{ color: themeColors.StartColorLinear }}>Cài đặt</span>
        </div>
      </div>

      <Card style={{ minHeight: '600px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          style={{ marginBottom: 0 }}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default Settings; 