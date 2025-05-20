import React from 'react';
import { Layout, Typography, Avatar, Space, Badge } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/'); // chuyển hướng về homepage
  };

  return (
    <AntHeader className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 px-6">
      <div className="flex items-center cursor-pointer" onClick={goToHome}>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white mr-4">
          <img src="/logo_uet.webp" alt="Logo UET" className="w-full h-full object-contain" />
        </div>

        <Title level={3}  style={{ color: 'white', margin: 0 }}>
          Trường Đại Học Công Nghệ
        </Title>
      </div>
    </AntHeader>
  );
};

export default Header;

