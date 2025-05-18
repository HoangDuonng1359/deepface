import React from 'react';
import { Layout, Typography, Avatar, Space, Badge } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // ✅ import đúng

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  const navigate = useNavigate(); // ✅ gọi đúng vị trí, bên trong function component

  const goToHome = () => {
    navigate('/'); // chuyển hướng về homepage
  };

  return (
    <AntHeader className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 px-6">
      <div 
        className="flex items-center cursor-pointer" 
        onClick={goToHome}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white mr-4">
          <span className="text-blue-600 font-bold text-xl">A</span>
        </div>
        <Title level={3} className="text-white m-0">
          Appname
        </Title>
      </div>

      <Space size={16}>
        <Badge count={3} size="small">
          <BellOutlined className="text-white text-xl cursor-pointer" />
        </Badge>
        <Avatar 
          icon={<UserOutlined />} 
          className="bg-blue-300 cursor-pointer"
        />
      </Space>
    </AntHeader>
  );
};

export default Header;
