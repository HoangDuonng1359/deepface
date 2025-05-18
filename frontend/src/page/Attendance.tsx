import Header from '../components/Header';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Spin, notification } from 'antd';
import { CameraOutlined, LoadingOutlined, StopOutlined } from '@ant-design/icons';

// Interface cho kết quả từ API
interface PredictionResult {
  age: number;
  name: string;
  // Có thể thêm các trường khác nếu API trả về thêm thông tin
}

const AttendancePage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Khởi động camera khi component được mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Bắt đầu chụp ảnh mỗi 5 giây khi isCapturing thay đổi
  useEffect(() => {
    if (isCapturing) {
      captureIntervalRef.current = setInterval(() => {
        captureImage();
      }, 5000);
    } else if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [isCapturing]);

  // Khởi động camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsCapturing(true);
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi Camera',
        description: 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.',
      });
      console.error('Error accessing camera:', error);
    }
  };

  // Dừng camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  // Chụp ảnh từ camera
 const captureImage = () => {
  if (loading) return; // Đang gửi thì không gửi tiếp

  if (videoRef.current && canvasRef.current && stream) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Image = canvas.toDataURL('image/jpeg');

      sendImageToServer(base64Image);
    }
  }
};

  // Gửi ảnh lên server để dự đoán tuổi
 const sendImageToServer = async (base64Image: string) => {
  setLoading(true);
  try {
    // Cắt bỏ tiền tố 'data:image/jpeg;base64,...'
    const pureBase64 = base64Image.split(',')[1];

    const response = await fetch('http://localhost:5000/predict_age', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: pureBase64 }), // Gửi base64 thuần
    });

    if (response.ok) {
      const data = await response.json();
      setPredictionResult(data);
    } else {
      throw new Error('Failed to get prediction');
    }
  } catch (error) {
    console.error('Error sending image to server:', error);
    notification.error({
      message: 'Lỗi Dự Đoán',
      description: 'Không thể lấy kết quả dự đoán từ server.',
    });
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header></Header>
      <div className="flex flex-1 p-4">
        <div className="flex flex-col w-1/2 bg-white rounded-lg shadow mr-4 p-4">
          <div className="text-center text-blue-500 text-xl font-bold mb-4">
            Hãy đưa khuôn mặt vào
          </div>
          <div className="relative flex-1 flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div>
            <Button onClick={stopCamera} icon = {<StopOutlined/>}>Dừng</Button>
            <Button 
                type="primary" 
                icon={<CameraOutlined />} 
                onClick={startCamera}
                className="absolute"
              >
                Bật Camera
              </Button>
          </div>
        </div>
        
        <div className="flex flex-col w-1/2 bg-white rounded-lg shadow p-4">
          <div className="text-center text-black text-xl font-bold mb-4">
            Kết quả điểm danh
          </div>
          <div className="flex-1 flex items-center justify-center">
            {loading ? (
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
                tip="Đang xử lý..."
              />
            ) : predictionResult ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600" >Tên: Hoàng Văn Dương</div>
                <div className="text-4xl font-bold text-blue-600">
                  {predictionResult.age} tuổi
                </div>
                <div className="mt-4 text-gray-600">
                  Cập nhật lần cuối: {new Date().toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                Chưa có dữ liệu. Đang chờ kết quả từ camera...
              </div>
            )}
          </div>
        </div>
        
      </div>
      
    
    </div>
  );
};

export default AttendancePage;