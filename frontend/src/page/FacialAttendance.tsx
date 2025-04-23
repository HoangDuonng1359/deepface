import React, { useState } from "react";
import { Button, Card, Typography, Spin } from "antd";
import { CameraOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const FacialAttendance: React.FC = () => {
  const [cameraOn, setCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<string | null>(null);

  const handleStartCamera = () => {
    setCameraOn(true);
    setAttendanceResult(null);
    // TODO: Implement camera stream using getUserMedia
  };

  const handleCheckAttendance = async () => {
    setIsLoading(true);
    setAttendanceResult(null);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      setAttendanceResult("Nguyễn Văn A đã được điểm danh thành công!");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <Card className="w-full max-w-3xl shadow-2xl rounded-2xl p-6 bg-white">
        <div className="flex flex-col items-center gap-6">
          <Title level={2}>Hệ thống điểm danh bằng khuôn mặt</Title>

          <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center relative">
            {cameraOn ? (
              <div className="text-center text-gray-600">[Stream Camera ở đây]</div>
            ) : (
              <Text className="text-gray-500">Camera chưa được bật</Text>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <Button
              type="primary"
              icon={<CameraOutlined />}
              onClick={handleStartCamera}
              disabled={cameraOn}
              className="rounded-xl h-10 px-6"
            >
              Bật Camera
            </Button>
            <Button
              type="default"
              icon={<CheckCircleOutlined />}
              onClick={handleCheckAttendance}
              disabled={!cameraOn || isLoading}
              className="rounded-xl h-10 px-6"
            >
              Bắt đầu điểm danh
            </Button>
          </div>

          {isLoading && <Spin className="mt-4" size="large" />}

          {attendanceResult && (
            <Text className="mt-4 text-green-600 font-medium text-lg">
              {attendanceResult}
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FacialAttendance;
