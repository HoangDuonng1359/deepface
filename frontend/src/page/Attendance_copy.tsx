import Header from '../components/Header';
import { API_ENDPOINTS } from "../constants/api";
import { useParams } from 'react-router-dom';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Spin, notification } from 'antd';
import { CameraOutlined, LoadingOutlined, StopOutlined } from '@ant-design/icons';
import { Course, Student } from '../interface/Course';
import * as faceapi from 'face-api.js';

interface PredictionResult {
  id: number;
  name: string;
}

const Test: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
 // const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

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

  // Khai báo biến và cấu trúc để quản lý quá trình gửi ảnh
interface FaceTrack {
  id: string;             // ID duy nhất cho mỗi khuôn mặt
  box: faceapi.Box;       // Vị trí hiện tại
  lastSentAt: number;     // Thời gian lần cuối gửi ảnh
  faceData?: string;      // Dữ liệu ảnh base64 chờ gửi
  confidence: number;     // Độ tin cậy của nhận diện
}

// Cấu hình cho chiến lược gửi ảnh
const FACE_CONFIG = {
  MIN_SEND_INTERVAL: 2000,      // Thời gian tối thiểu giữa các lần gửi ảnh (ms)
  FACE_MATCH_THRESHOLD: 0.6,    // Ngưỡng để xác định cùng một khuôn mặt
  CONFIDENCE_THRESHOLD: 0.85,   // Ngưỡng độ tin cậy để gửi một khuôn mặt
  MAX_TRACKING_TIME: 30000,     // Thời gian tối đa theo dõi một khuôn mặt (ms)
  MAX_DISTANCE_CHANGE: 50,      // Khoảng cách tối đa để xem là cùng mặt (px)
  REQUEST_RETRY_LIMIT: 3,       // Số lần thử lại nếu request thất bại
  BATCH_SIZE: 1,                // Số lượng ảnh gửi trong một request (1 = không batch)
  USE_QUALITY_FILTER: true,     // Lọc ảnh chất lượng thấp
};

// Quản lý các khuôn mặt đang được theo dõi
const trackedFaces: FaceTrack[] = [];
let lastDetectionTime = 0;
let requestQueue: { faceData: string, retries: number }[] = [];
let isProcessingQueue = false;

// Hàm tạo ID duy nhất cho mỗi khuôn mặt
const generateFaceId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Tính khoảng cách giữa hai box nhận diện
const calculateDistance = (box1: faceapi.Box, box2: faceapi.Box): number => {
  const centerX1 = box1.x + box1.width / 2;
  const centerY1 = box1.y + box1.height / 2;
  const centerX2 = box2.x + box2.width / 2;
  const centerY2 = box2.y + box2.height / 2;
  
  return Math.sqrt(
    Math.pow(centerX1 - centerX2, 2) + 
    Math.pow(centerY1 - centerY2, 2)
  );
};

// Kiểm tra chất lượng ảnh khuôn mặt
const checkFaceQuality = (detection: faceapi.FaceDetection): boolean => {
  // Hãy thực hiện các kiểm tra bổ sung ở đây nếu cần
  return detection.score > FACE_CONFIG.CONFIDENCE_THRESHOLD;
};

// Xử lý hàng đợi gửi ảnh
const processQueue = async () => {
  if (requestQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }
  
  isProcessingQueue = true;
  const item = requestQueue.shift();
  
  if (!item) {
    isProcessingQueue = false;
    return;
  }
  
  try {
    // Thay thế phần này bằng API call thực tế của bạn
    await fetch('/api/upload-face', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: item.faceData }),
    });
    
    // Xử lý tiếp tục hàng đợi
    setTimeout(processQueue, 100);
  } catch (error) {
    console.error('Failed to send face data:', error);
    
    // Thử lại nếu chưa vượt quá giới hạn
    if (item.retries < FACE_CONFIG.REQUEST_RETRY_LIMIT) {
      requestQueue.push({
        faceData: item.faceData,
        retries: item.retries + 1
      });
    }
    
    // Tiếp tục xử lý hàng đợi sau 1 giây
    setTimeout(processQueue, 1000);
  }
};

// Nhận diện và theo dõi khuôn mặt
const detectFaces = async () => {
  if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;
  
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) return;
  
  // Thiết lập kích thước canvas
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Kích thước hiển thị thật trên màn hình
  const displaySize = canvas.getBoundingClientRect();
  
  // Resize canvas context
  faceapi.matchDimensions(canvas, {
    width: displaySize.width,
    height: displaySize.height,
  });
  
  // Lặp nhận diện (giảm xuống 200ms thay vì 100ms)
  const interval = setInterval(async () => {
    const now = Date.now();
    
    // Chạy mỗi 200ms để giảm tải CPU
    if (now - lastDetectionTime < 200) {
      return;
    }
    
    lastDetectionTime = now;
    
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    
    const resizedDetections = faceapi.resizeResults(detections, {
      width: displaySize.width,
      height: displaySize.height,
    });
    
    // Vẽ kết quả lên canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    
    // Cập nhật theo dõi khuôn mặt
    updateFaceTracking(resizedDetections, video);
    
  }, 100);
  
  // Trả về cleanup function
  return () => clearInterval(interval);
};

// Cập nhật theo dõi khuôn mặt
const updateFaceTracking = (detections: faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>[], video: HTMLVideoElement) => {
  const now = Date.now();
  
  // Đánh dấu các khuôn mặt đã được cập nhật
  const updatedFaces = new Set<string>();
  
  // Xử lý khuôn mặt trong khung hình hiện tại
  for (const detection of detections) {
    const { box } = detection.detection;
    let matched = false;
    
    // Kiểm tra chất lượng
    if (FACE_CONFIG.USE_QUALITY_FILTER && !checkFaceQuality(detection.detection)) {
      continue;
    }
    
    // Tìm khuôn mặt đã theo dõi trước đó
    for (const face of trackedFaces) {
      const distance = calculateDistance(face.box, box);
      
      // Nếu khoảng cách nhỏ, có thể là cùng một khuôn mặt
      if (distance < FACE_CONFIG.MAX_DISTANCE_CHANGE) {
        updatedFaces.add(face.id);
        matched = true;
        
        // Cập nhật vị trí mới
        face.box = box;
        face.confidence = detection.detection.score;
        
        // Kiểm tra thời gian để gửi ảnh mới
        const timeSinceLastSent = now - face.lastSentAt;
        if (timeSinceLastSent >= FACE_CONFIG.MIN_SEND_INTERVAL) {
          // Cắt và gửi khuôn mặt
          const { x, y, width, height } = box;
          const faceCanvas = document.createElement("canvas");
          faceCanvas.width = width;
          faceCanvas.height = height;
          const faceCtx = faceCanvas.getContext("2d");
          
          if (faceCtx) {
            // Vẽ khuôn mặt lên canvas tạm thời
            faceCtx.drawImage(video, x, y, width, height, 0, 0, width, height);
            const base64Face = faceCanvas.toDataURL("image/jpeg");
            
            // Gửi khuôn mặt đến server
            sendImageToServer(base64Face);
            face.lastSentAt = now;
          }
        }
        break;
      }
    }
    
    // Nếu chưa theo dõi khuôn mặt này trước đó
    if (!matched) {
      const newFaceId = generateFaceId();
      updatedFaces.add(newFaceId);
      
      // Tạo track mới
      const newFace: FaceTrack = {
        id: newFaceId,
        box: box,
        lastSentAt: now,
        confidence: detection.detection.score,
      };
      
      // Cắt và gửi khuôn mặt mới
      const { x, y, width, height } = box;
      const faceCanvas = document.createElement("canvas");
      faceCanvas.width = width;
      faceCanvas.height = height;
      const faceCtx = faceCanvas.getContext("2d");
      
      if (faceCtx) {
        faceCtx.drawImage(video, x, y, width, height, 0, 0, width, height);
        const base64Face = faceCanvas.toDataURL("image/jpeg");
        
        // Gửi khuôn mặt đến server
        sendImageToServer(base64Face);
        
        // Thêm vào danh sách theo dõi
        trackedFaces.push(newFace);
      }
    }
  }
  
  // Loại bỏ các khuôn mặt không còn trong khung hình hoặc đã theo dõi quá lâu
  const currentTime = Date.now();
  for (let i = trackedFaces.length - 1; i >= 0; i--) {
    const face = trackedFaces[i];
    
    // Nếu không còn trong khung hình hoặc đã theo dõi quá lâu
    if (!updatedFaces.has(face.id) || currentTime - face.lastSentAt > FACE_CONFIG.MAX_TRACKING_TIME) {
      trackedFaces.splice(i, 1);
    }
  }
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
      detectFaces();
    }
  }, [modelsLoaded]);

  // Bắt đầu phát hiện khuôn mặt khi video đang phát
  const handleVideoPlay = () => {
    detectFaces();
  };


const simulatorSendImageToServer = async (base64Image: string) => {
  setLoading(true);

  // Giả lập dữ liệu trả về từ server
  const simulatedStudents = [
    {
      id: 1,
      name: "Nguyễn Văn A",
    },
    {
      id: 2,
      name: "Trần Thị B",
    },
  ];

  // Giả lập độ trễ như khi gọi API (ví dụ: 2 giây)
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * simulatedStudents.length);
    const randomStudent = simulatedStudents[randomIndex];
    console.log("Response:", randomStudent);
    setPredictionResult(randomStudent); // Giữ định dạng là mảng
    setLoading(false);
  }, 2000);
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
                    <span>{course.students?.length ?? 0}</span>
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
                    {predictionResult.name}
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    Mã sinh viên: {predictionResult.id}
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

export default Test;