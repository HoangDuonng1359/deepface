import React from 'react';
import { Layout, Typography} from 'antd';
import { useNavigate } from 'react-router-dom';
const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/'); // chuyển hướng về homepage
  };

  return (
    <AntHeader
      className="flex items-center justify-between bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-700 px-8"
      style={{
        top: 0,
        left: 0,
        width: '100vw',
        height: 64,
        zIndex: 100,
        boxShadow: '0 2px 8px #e0e7ef',
        padding: 0,
      }}
    >
      <div className="flex items-center cursor-pointer select-none" onClick={goToHome}>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg mr-4 border-2 border-blue-200">
          <img src="/logo_uet.webp" alt="Logo UET" className="w-10 h-10 object-contain" />
        </div>
        <Title
          level={3}
          style={{
            color: 'white',
            margin: 0,
            letterSpacing: 1,
            fontWeight: 650,
            textShadow: '0 2px 8px #1e293b44',
          }}
          className="tracking-wide"
        >
          Trường Đại Học Công Nghệ
        </Title>
      </div>
      
    </AntHeader>
  );
};

export default Header;

