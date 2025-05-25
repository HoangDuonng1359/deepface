import Header from '../components/Header';
import Notification from '../components/Notification';
import { API_ENDPOINTS } from "../constants/api";
import { useParams } from 'react-router-dom';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Spin, notification, Modal } from 'antd';
import { CameraOutlined, LoadingOutlined, StopOutlined } from '@ant-design/icons';
import { Course } from '../interface/Course';
import * as faceapi from 'face-api.js';
import { Attendance, StudentsAttendance } from '../interface/Attendance';
import { useNavigate } from 'react-router-dom';
import AttendanceInfo from '../components/AttendanceInfo';
import { AttendanceResult } from '../components/AttendanceResult';
import { ThreeDot } from 'react-loading-indicators';

declare global {
  interface Window {
    latestResizedDetections?: any;
  }
}

export interface PredictionResult {
  success: boolean;
  message: string;
  data: StudentsAttendance;
}

const AttendancePage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sendIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const navigate = useNavigate();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [notify, setNotify] = useState<{ type: "success" | "error"; message: string; description?: string } | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const { attendance_id } = useParams();
  const [course, setCourse] = useState<Course>();
  const [attendance, setAttendance] = useState<Attendance>();
  const [imageBase64, setImageBase64] = useState<string>();
  const [isDetecting, setIsDetecting] = useState(true);

  // Fetch attendance and course info
  useEffect(() => {
    const fetchAttendanceAndCourse = async () => {
      if (!attendance_id) return;
      try {
        const resAttendance = await fetch(API_ENDPOINTS.ATTENDANCE.GET_BY_ID(attendance_id));
        const attendanceResult = await resAttendance.json();
        setAttendance(attendanceResult.data);
        if (attendanceResult.data && attendanceResult.data.course_id) {
          const resCourse = await fetch(API_ENDPOINTS.COURSE.GET_BY_ID(attendanceResult.data.course_id));
          const courseResult = await resCourse.json();
          setCourse(courseResult.data);
        }
      } catch (error) {
        console.log("Lỗi lấy thông tin attendance hoặc course", error);
      }
    };
    fetchAttendanceAndCourse();
  }, [attendance_id]);

  // Load face-api models
  const loadModels = async () => {
    setModelsLoaded(false);
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      setModelsLoaded(true);
    } catch (error) {
      console.error('Error loading models:', error);
      notification.error({
        message: 'Lỗi tải mô hình',
        description: 'Không thể tải mô hình nhận diện khuôn mặt.',
      });
    }
  };

  // Camera control
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
      setNotify({ type: "error", message: "Lỗi không thể truy cập camera", description: String(error) });
      setIsCapturing(false);
      setStream(null);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
    // Cleanup intervals
    if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
    detectIntervalRef.current = null;
    sendIntervalRef.current = null;
    // Clear canvas
    if (canvasRef.current) {
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.width = 0;
      canvasRef.current.height = 0;
    }
    setVideoReady(false);
  };

  // Load models on mount
  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

useEffect(() => {
  if (modelsLoaded) {
    startCamera();
  }
}, [modelsLoaded]);

  // Start/stop camera and detection based on isCapturing and modelsLoaded
  useEffect(() => {
  if (modelsLoaded && isCapturing && stream && videoReady) {
    let lastSentBoxes: faceapi.Box[] = [];

    // Xóa các interval cũ nếu có
    detectIntervalRef.current && clearInterval(detectIntervalRef.current);
    sendIntervalRef.current && clearInterval(sendIntervalRef.current);

    detectIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Đảm bảo video đã sẵn sàng và có kích thước hợp lệ
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const width = video.videoWidth;
      const height = video.videoHeight;

      canvas.width = width;
      canvas.height = height;

      const size = { width, height };

      faceapi.matchDimensions(canvas, size);

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, size);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      
      resizedDetections.forEach((detection: any) => {
        const { x, y, height } = detection.detection.box;
        const expressions = detection.expressions;
        if (expressions) {
          const maxEmotion = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b
          );
          const maxValue = expressions[maxEmotion];
          ctx.font = "20px Arial";
          ctx.fillStyle = "#1890ff";
          ctx.fillText(
            `${maxEmotion} (${(maxValue * 100).toFixed(0)}%)`,
            x,
            y + height + 24
          );
        }
      });

      if (isDetecting) setIsDetecting(false); 

      window.latestResizedDetections = resizedDetections;
    }, 100);

    sendIntervalRef.current = setInterval(() => {
      const resizedDetections = window.latestResizedDetections || [];
      const currentBoxes: faceapi.Box[] = (resizedDetections as any[]).map(
        (det) => det.detection.box
      );

      const isNewFaceDetected = () => {
        if (lastSentBoxes.length !== currentBoxes.length) return true;
        for (let i = 0; i < currentBoxes.length; i++) {
          const prev = lastSentBoxes[i];
          const curr = currentBoxes[i];
          const dx = Math.abs(prev.x - curr.x);
          const dy = Math.abs(prev.y - curr.y);
          const dw = Math.abs(prev.width - curr.width);
          const dh = Math.abs(prev.height - curr.height);
          if (dx > 20 || dy > 20 || dw > 20 || dh > 20) {
            return true;
          }
        }
        return false;
      };

      if (isNewFaceDetected()) {
        lastSentBoxes = currentBoxes;
        let detectedEmotion = '';
        if (resizedDetections.length > 0 && resizedDetections[0].expressions) {
          const expressions = resizedDetections[0].expressions;
          detectedEmotion = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b
          );
        }

        if (videoRef.current) {
          const video = videoRef.current;
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = video.videoWidth;
          tempCanvas.height = video.videoHeight;
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
            const base64Frame = tempCanvas.toDataURL("image/jpeg");
            setImageBase64(base64Frame);
            sendImageToServer(detectedEmotion, base64Frame);
          }
        }
      }
    }, 2000);

    return () => {
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
      if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
      detectIntervalRef.current = null;
      sendIntervalRef.current = null;
    };
  }

  // Cleanup khi camera tắt
  return () => {
    if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
    detectIntervalRef.current = null;
    sendIntervalRef.current = null;
  };
  // eslint-disable-next-line
}, [modelsLoaded, isCapturing, stream, videoReady]);


  const endAttendance = async () => {
    if (attendance?.attendance_id) {
      try {
        const res = await fetch(API_ENDPOINTS.ATTENDANCE.END_ATTENDANCE(attendance.attendance_id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await res.json();
        if (result.success) {
          setNotify({ type: "success", message: "Kết thúc thành công" });
          setTimeout(() => {
            setNotify(null);
            navigate('/statistics/' + attendance.attendance_id);
          }, 1500);
        } else {
          setNotify({ type: "error", message: "Lỗi kết thúc ca điểm danh", description: result.message });
        }
      } catch (e) {
        setNotify({ type: "error", message: "Lỗi", description: String(e) });
      }
    }
  }

  // Gửi ảnh lên server để dự đoán tuổi
  const sendImageToServer = async (emotion: string, base64Image: string) => {
    if (!attendance?.attendance_id) {
      notification.error({
        message: 'Lỗi điểm danh',
        description: 'Không tìm thấy mã ca điểm danh.',
      });
      return;
    }
    setLoading(true);

    // Cắt bỏ tiền tố 'data:image/jpeg;base64,...'
    const pureBase64 = base64Image.split(',')[1];
    try {
      //console.log('Gửi lên:', { emotion, image: pureBase64 });
      const response = await fetch(API_ENDPOINTS.ATTENDANCE.SEND_ATTENDANCE(attendance.attendance_id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emotion, image: pureBase64 }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setPredictionResult(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get prediction');
      }
    } catch (error) {
      setNotify({
      type: "error",
      message: "Lỗi Dự Đoán",
      description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  

  if (!modelsLoaded) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,255,255,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 64 }} spin />}
          tip="Đang tải mô hình nhận diện khuôn mặt..."
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header/>
      {notify && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <Notification
            type={notify.type}
            message={notify.message}
            description={notify.description}
            onClose={() => setNotify(null)}
          />
        </div>
      )}
      <div className="flex flex-1 p-4">
        <div className="flex flex-col w-1/2 bg-white rounded-lg shadow mr-4 p-4">
          <div className="text-center text-blue-700 text-xl font-bold mb-4">
            Hãy đưa khuôn mặt vào
          </div>
          <div className="w-full h-full relative flex-1 flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden ">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full"
              onLoadedData={() => setVideoReady(true)}
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            {isCapturing ? (
              isDetecting && (
                <div className="absolute inset-0 flex flex-col items-center w-full h-full justify-center bg-white z-10">
                  <img
                    src="/load-loading.gif"
                    alt="Loading"
                    className="mb-4 w-24 h-24 object-contain"
                    style={{ animation: "bounce 1.5s infinite" }}
                  />
                  {/* <Spin
        indicator={<LoadingOutlined style={{ fontSize: 64, color: "#32cd32" }} spin />} 
        size="default"
      /> */}
                  <div className="mb-2 text-2xl font-bold text-blue-600 animate-pulse">
                    Chờ một xíu nhé!!!
                  </div>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center w-full h-full justify-center bg-white z-10">
                <img
                  src="/load-loading.gif"
                  alt="Camera Off"
                  className="mb-4 w-24 h-24 object-contain grayscale"
                  style={{ animation: "bounce 1.5s infinite" }}
                />
                <div className="mb-2 text-2xl font-bold text-red-500 animate-pulse">
                  Camera đang tắt kìa!
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              type={isCapturing ? "default" : "primary"}
              danger={isCapturing}
              icon={isCapturing ? <StopOutlined /> : <CameraOutlined />}
              onClick={isCapturing ? stopCamera : startCamera}
              size="large"
              className={`transition-all duration-200 rounded-lg px-8 py-2 ${isCapturing ? "bg-red-600 text-red-400 hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              style={{ minWidth: 160, fontWeight: 600 }}
            >
              {isCapturing ? "Dừng Camera" : "Bật Camera"}
            </Button>
            <Button
              type="primary"
              size="large"
              className="rounded-lg px-8 py-2 bg-green-600 text-white hover:bg-green-700"
              style={{ minWidth: 160, fontWeight: 600 }}
              onClick={() => setConfirmVisible(true)}
            >
              Kết thúc điểm danh
            </Button>
          </div>
        </div>

        <div className="flex flex-col w-1/2 h-full gap-6 px-4">
          {/* Thông tin khoá học */}
          <AttendanceInfo course={course} attendance={attendance}></AttendanceInfo>

          {/* Kết quả điểm danh */}
            <AttendanceResult predictionResult={predictionResult} loading={loading} imageBase64={imageBase64 || ""}></AttendanceResult>
        </div>
        {/* Modal xác nhận */}
        <Modal
          open={confirmVisible}
          onOk={() => {
            setConfirmVisible(false);
            endAttendance();
          }}
          onCancel={() => setConfirmVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          Bạn có chắc chắn muốn kết thúc điểm danh không?
        </Modal>
      </div>
    </div>
  );
};

export default AttendancePage;