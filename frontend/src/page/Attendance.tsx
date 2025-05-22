import Header from '../components/Header';
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

// Extend the Window interface to include latestResizedDetections
declare global {
  interface Window {
    latestResizedDetections?: any;
  }
}

interface PredictionResult {
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

  const { attendance_id } = useParams();
  const [course, setCourse] = useState<Course>();
  const [attendance, setAttendance] = useState<Attendance>();
  const [imageBase64, setImageBase64] = useState<string>();

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
      notification.error({
        message: 'Lỗi Camera',
        description: 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.',
      });
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
    }
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
    if (modelsLoaded && isCapturing && stream) {
      // Start detection intervals
      let lastSentBoxes: faceapi.Box[] = [];
      detectIntervalRef.current && clearInterval(detectIntervalRef.current);
      sendIntervalRef.current && clearInterval(sendIntervalRef.current);

      detectIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const displaySize = canvas.getBoundingClientRect();
        faceapi.matchDimensions(canvas, {
          width: displaySize.width,
          height: displaySize.height,
        });

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        // Resize kết quả nhận diện cho đúng kích thước canvas
        const resizedDetections = faceapi.resizeResults(detections, {
          width: canvas.width,
          height: canvas.height,
        });

        // Xóa canvas trước khi vẽ mới
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Vẽ bounding box và landmarks
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        // Vẽ cảm xúc lên canvas
        resizedDetections.forEach((detection: any) => {
          const { x, y, height } = detection.detection.box;
          const expressions = detection.expressions;
          if (expressions) {
            // Tìm cảm xúc lớn nhất
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

        window.latestResizedDetections = resizedDetections;
      }, 100);

      sendIntervalRef.current = setInterval(() => {
        const resizedDetections = window.latestResizedDetections || [];
        const currentBoxes: faceapi.Box[] = (resizedDetections as any[]).map(det => det.detection.box);

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
          // Lấy emotion mạnh nhất tại thời điểm này
          let detectedEmotion = '';
          if (resizedDetections.length > 0 && resizedDetections[0].expressions) {
            const expressions = resizedDetections[0].expressions;
            detectedEmotion = Object.keys(expressions).reduce((a, b) =>
              expressions[a] > expressions[b] ? a : b
            );
          }
          // Gửi toàn bộ frame video cùng emotion
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

      // Cleanup intervals on unmount or when stopCamera is called
      return () => {
        if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
        if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
        detectIntervalRef.current = null;
        sendIntervalRef.current = null;
      };
    }
    // Cleanup if camera is stopped
    return () => {
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
      if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
      detectIntervalRef.current = null;
      sendIntervalRef.current = null;
    };
    // eslint-disable-next-line
  }, [modelsLoaded, isCapturing, stream]);

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
          alert("Kết thúc thành công");
          navigate('/statistics/' + attendance.attendance_id);
        } else {
          alert("Lỗi kết thúc ca điểm danh: " + result.message)
        }
      } catch (e) {
        alert("lỗi" + e);
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
      console.log('Gửi lên:', { emotion, image: pureBase64 });
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
      notification.error({
        message: 'Lỗi Dự Đoán',
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
      <Header />
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
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
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

        <div className="flex flex-col w-1/2 h-full mx-auto gap-6 px-4">
          {/* Thông tin khoá học */}
          <AttendanceInfo course={course} attendance={attendance}></AttendanceInfo>

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
              ) : predictionResult && predictionResult.data ? (
                <div className="text-center space-y-3 p-4 rounded-lg border border-blue-200 bg-blue-50 shadow-sm">
                  <div className="flex items-center justify-center gap-6">
                    {/* Ảnh khuôn mặt bên trái */}
                    <div className="flex-shrink-0 flex justify-center items-center">
                      <img
                        src={imageBase64}
                        alt="Khuôn mặt nhận diện"
                        className="rounded-lg border border-gray-300 shadow w-24 h-24 object-cover"
                        style={{ maxWidth: 96, maxHeight: 96 }}
                      />
                    </div>
                    {/* Thông tin kết quả bên phải */}
                    <div className="flex flex-col items-start space-y-2 text-left">
                      <div className="text-lg font-semibold text-green-700">{predictionResult.message}</div>
                      <div className="text-base font-bold text-blue-800">{predictionResult.data.student_name}</div>
                      <div className="text-sm font-medium text-blue-700">
                        Mã sinh viên: <span className="font-semibold">{predictionResult.data.student_id}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-indigo-600">Tâm trạng:</span>
                        <span className="ml-2 text-indigo-800">{predictionResult.data.emotion}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-600">Vào lúc:</span>
                        <span className="ml-2 text-gray-800">
                          {predictionResult.data.time_in
                            ? new Date(predictionResult.data.time_in).toLocaleString('vi-VN', {
                                hour12: false,
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })
                            : ''}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-600">Trạng thái:</span>
                        <span className="ml-2 text-gray-800">{predictionResult.data.status}</span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        Cập nhật: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  <div>Chưa có dữ liệu. Đang chờ kết quả từ camera...</div>
                  <div>{predictionResult?.message}</div>
                  <img
                        src={imageBase64}
                        alt="Khuôn mặt nhận diện"
                        className="rounded-lg border border-gray-300 shadow w-24 h-24 object-cover"
                        style={{ maxWidth: 96, maxHeight: 96 }}
                      />
                </div>
              )}
            </div>
          </div>
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