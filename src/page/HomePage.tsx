import React, { useState } from 'react';
import { 
  Layout, 
  Menu, 
  Button, 
  Card, 
  Typography, 
  Row, 
  Col, 
  Modal, 
  Spin, 
  message, 
  Dropdown, 
  Space
} from 'antd';
import {
  UserOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  DashboardOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface ClassInfo {
  id: string;
  name: string;
  time: string;
  students: number;
}

const HomePage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentClass, setCurrentClass] = useState<ClassInfo | null>(null);
  
  // Mock data cho các lớp học
  const classes: ClassInfo[] = [
    { id: '1', name: 'Lớp Công nghệ phần mềm', time: '7:30 - 9:30', students: 35 },
    { id: '2', name: 'Lớp Trí tuệ nhân tạo', time: '9:45 - 11:45', students: 28 },
    { id: '3', name: 'Lớp Phát triển ứng dụng Web', time: '13:00 - 15:00', students: 40 },
    { id: '4', name: 'Lớp Mạng máy tính', time: '15:15 - 17:15', students: 32 },
  ];

  // Khai báo ref cho video element
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const openCamera = async (classInfo: ClassInfo) => {
    setCurrentClass(classInfo);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setCameraModalVisible(true);
    } catch (error) {
      message.error('Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera.');
      console.error('Error accessing camera:', error);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraModalVisible(false);
    setRecognizing(false);
    setCurrentClass(null);
  };

  const startRecognition = () => {
    setRecognizing(true);
    // Giả lập gọi API nhận diện khuôn mặt
    setTimeout(() => {
      message.success('Đã nhận diện thành công 28/35 sinh viên!');
      setRecognizing(false);
    }, 3000);
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: 'Thông tin cá nhân',
    },
    {
      key: '2',
      label: 'Cài đặt tài khoản',
    },
    {
      key: '3',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} 
        className="bg-indigo-700 text-white"
        style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
      >
        <div className="p-4 flex items-center justify-center">
          <div className="text-xl font-bold text-white">
            {!collapsed ? 'FaceAttendance' : 'FA'}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          className="bg-indigo-700 text-white"
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: 'Trang chủ',
            },
            {
              key: '2',
              icon: <VideoCameraOutlined />,
              label: 'Điểm danh',
            },
            {
              key: '3',
              icon: <UserOutlined />,
              label: 'Sinh viên',
            },
            {
              key: '4',
              icon: <FileTextOutlined />,
              label: 'Báo cáo',
            },
            {
              key: '5',
              icon: <SettingOutlined />,
              label: 'Cài đặt',
            },
          ]}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header className="p-0 bg-white flex items-center justify-between shadow-sm">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="w-16 h-16"
          />
          <div className="flex items-center justify-end mr-8 gap-6 ml-auto">
            <Button type="text" icon={<BellOutlined />} className="text-lg" />
            <Dropdown menu={{ items }} placement="bottomRight">
                <a onClick={e => e.preventDefault()}>
                <Space className="cursor-pointer">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <UserOutlined />
                    </div>
                    <span className="text-gray-700">Giảng viên</span>
                    <DownOutlined />
                </Space>
                </a>
                </Dropdown>
            </div>
        </Header>
        <Content className="m-6 p-6 bg-white rounded-lg">
          <div className="mb-6">
            <Title level={3} className="mb-1">Xin chào, Giảng viên!</Title>
            <Text type="secondary">Chào mừng bạn đến với hệ thống điểm danh khuôn mặt</Text>
          </div>
          
          <div className="mb-8">
            <Title level={4} className="mb-4">Các lớp học hôm nay</Title>
            <Row gutter={[16, 16]}>
              {classes.map((classInfo) => (
                <Col xs={24} sm={12} md={8} lg={6} key={classInfo.id}>
                  <Card 
                    hoverable 
                    className="h-full border-indigo-100 hover:border-indigo-300 transition-all"
                    actions={[
                      <Button 
                        type="primary" 
                        icon={<VideoCameraOutlined />}
                        onClick={() => openCamera(classInfo)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Bắt đầu điểm danh
                      </Button>
                    ]}
                  >
                    <div className="mb-4">
                      <Text className="text-lg font-medium block">{classInfo.name}</Text>
                      <Text type="secondary" className="block">{classInfo.time}</Text>
                    </div>
                    <div className="flex justify-between items-center">
                      <Text>Số sinh viên:</Text>
                      <Text strong>{classInfo.students}</Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
          
          <div>
            <Title level={4} className="mb-4">Thống kê nhanh</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-white opacity-80 block">Tổng số lớp</Text>
                      <Text className="text-white text-2xl font-bold block">12</Text>
                    </div>
                    <FileTextOutlined className="text-3xl opacity-80" />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-white opacity-80 block">Tổng số sinh viên</Text>
                      <Text className="text-white text-2xl font-bold block">248</Text>
                    </div>
                    <UserOutlined className="text-3xl opacity-80" />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-white opacity-80 block">Tỷ lệ tham gia</Text>
                      <Text className="text-white text-2xl font-bold block">92%</Text>
                    </div>
                    <DashboardOutlined className="text-3xl opacity-80" />
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>

      <Modal
        title={currentClass ? `Điểm danh: ${currentClass.name}` : 'Điểm danh'}
        open={cameraModalVisible}
        onCancel={closeCamera}
        width={800}
        footer={[
          <Button key="back" onClick={closeCamera}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={recognizing}
            onClick={startRecognition}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {recognizing ? 'Đang nhận diện...' : 'Bắt đầu nhận diện'}
          </Button>,
        ]}
      >
        <div className="flex flex-col items-center">
          <div className="rounded-lg overflow-hidden border-2 border-gray-200 mb-4 w-full max-w-2xl relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover bg-gray-100"
            />
            {recognizing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Spin size="large" />
                <Text className="text-white ml-2">Đang nhận diện khuôn mặt...</Text>
              </div>
            )}
          </div>
          
          <div className="w-full max-w-2xl">
            <Text type="secondary">
              {currentClass && `Lớp: ${currentClass.name} | Thời gian: ${currentClass.time} | Sĩ số: ${currentClass.students} sinh viên`}
            </Text>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default HomePage;