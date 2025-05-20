import Header from '../components/Header';
import { API_ENDPOINTS } from "../constants/api";
import { useParams } from 'react-router-dom';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Spin, notification } from 'antd';
import { CameraOutlined, LoadingOutlined, StopOutlined } from '@ant-design/icons';
import { Course } from '../interface/Course';
import * as faceapi from 'face-api.js';

interface PredictionResult {
  age: number;
  name: string;
}

const AttendancePage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
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
      }, 500000);
    } else if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [isCapturing]);

const { courseId } = useParams();
const [course, setCourse] = useState<Course>();

useEffect(() => {
    const fetchCoursesById = async () => {
      if (!courseId) return;
      try {
        const res = await fetch(API_ENDPOINTS.COURSE.GET_BY_ID(courseId));
        const result = await res.json();
        setCourse(result.data);
      } catch (error) {
        console.log("lỗi lấy thông tin lớp học", error);
      }
    };
    fetchCoursesById();
}, []);

    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        setModelsLoaded(true);
        console.log('Models loaded');
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
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

   // Nhận diện khuôn mặt
  const detectFaces = async () => {
  if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  // Thiết lập kích thước logic của canvas (pixel thật)
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Kích thước hiển thị thật trên màn hình (do CSS)
  const displaySize = canvas.getBoundingClientRect();

  // Resize canvas context theo displaySize để khớp với mặt người
  faceapi.matchDimensions(canvas, {
    width: displaySize.width,
    height: displaySize.height,
  });

  // Lặp nhận diện mỗi 100ms
  const interval = setInterval(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // Resize kết quả theo kích thước hiển thị thật
    const resizedDetections = faceapi.resizeResults(detections, {
      width: displaySize.width,
      height: displaySize.height,
    });

    // Làm sạch canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ các kết quả
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);

  // Trả về cleanup function để clear interval khi cần
  return () => clearInterval(interval);
};



  // Load models khi component được mount
  useEffect(() => {
    loadModels();
    
    return () => {
      stopCamera();
    };
  }, []);

    // Bắt đầu nhận diện khi video đã sẵn sàng và model đã tải xong
  useEffect(() => {
    if (modelsLoaded) {
      startCamera();
    }
  }, [modelsLoaded]);

  // Bắt đầu phát hiện khuôn mặt khi video đang phát
  const handleVideoPlay = () => {
    detectFaces();
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
          <div className="text-center text-blue-700 text-xl font-bold mb-4">
            Hãy đưa khuôn mặt vào
          </div>
          <div className="relative flex-1 flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden ">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onPlay={handleVideoPlay}
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef}  className="absolute top-0 left-0 w-full h-full pointer-events-none"/>
          </div>
          
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
        
        <div className="flex flex-col w-1/2 h-full mx-auto gap-6 px-4">
          {/* Thông tin khoá học */}
          <div className="p-6 bg-white shadow-md rounded-lg w-full">
            {course ? (
              <>
                <h2 className="text-2xl font-semibold text-center mb-6 text-blue-700">
                  {course.course_name}
                </h2>

                <div className="space-y-4 text-base">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Mã lớp:</span>
                    <span>{course.course_id}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Giảng viên:</span>
                    <span>{course.teacher_name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Số sinh viên:</span>
                    <span>{course.numStudent}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">Đang tải dữ liệu khoá học...</p>
            )}
          </div>

          {/* Kết quả điểm danh */}
          <div className="flex flex-col bg-white rounded-lg shadow p-6 w-full h-full">
            <div className="text-center text-blue-700 text-2xl font-bold mb-6">
              Kết quả điểm danh
            </div>
            <div className="flex items-center justify-center h-full min-h-[120px]">
              {loading ? (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                  tip="Đang xử lý..."
                />
              ) : predictionResult ? (
                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold text-blue-600">
                    Tên: Hoàng Văn Dương
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    {predictionResult.age} tuổi
                  </div>
                  <div className="mt-2 text-gray-600 text-sm">
                    Cập nhật lần cuối: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  Chưa có dữ liệu. Đang chờ kết quả từ camera...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;