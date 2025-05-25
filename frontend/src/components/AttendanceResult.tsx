import { Spin } from "antd";
import { PredictionResult } from "../page/Attendance"
import { AlertTwoTone, BugTwoTone, CheckCircleFilled, FireTwoTone, FrownTwoTone, LoadingOutlined, MehTwoTone, SmileTwoTone, ThunderboltTwoTone } from "@ant-design/icons";
import { JSX } from "react";


interface AttendanceResultProps {
    predictionResult : PredictionResult | null;
    loading : boolean;
    imageBase64: string;
}

export const AttendanceResult: React.FC<AttendanceResultProps> = ({ predictionResult, loading, imageBase64 }) => {
    const emotionMap: Record<
  string,
  { label: string; icon: JSX.Element; color: string }
> = {
  happy: {
    label: 'Vui vẻ',
    icon: <SmileTwoTone twoToneColor="#FFD700" className="animate-bounce" />,
    color: 'text-yellow-500',
  },
  neutral: {
    label: 'Bình thường',
    icon: <MehTwoTone twoToneColor="#8c8c8c" className="animate-pulse" />,
    color: 'text-gray-500',
  },
  sad: {
    label: 'Buồn',
    icon: <FrownTwoTone twoToneColor="#1890ff" className="animate-bounce" />,
    color: 'text-blue-500',
  },
  surprise: {
    label: 'Ngạc nhiên',
    icon: <ThunderboltTwoTone twoToneColor="#eb2f96" className="animate-bounce" />,
    color: 'text-pink-500',
  },
  angry: {
    label: 'Tức giận',
    icon: <FireTwoTone twoToneColor="#ff4d4f" className="animate-pulse" />,
    color: 'text-red-600',
  },
  disgust: {
    label: 'Ghê tởm',
    icon: <BugTwoTone twoToneColor="#52c41a" className="animate-spin" />,
    color: 'text-green-700',
  },
  fear: {
    label: 'Sợ hãi',
    icon: <AlertTwoTone twoToneColor="#722ed1" className="animate-pulse" />,
    color: 'text-purple-600',
  },
};
    return (
        <div className="flex flex-col bg-white rounded-lg shadow p-3 w-full h-full">
            <div className="text-center text-blue-700 text-2xl font-bold mb-5">
              Kết quả điểm danh
            </div>
            <div className="flex items-center justify-center h-full min-h-[120px]">
              {loading ? (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                  tip="Đang xử lý..."
                />
              ) : predictionResult && predictionResult.data ? (
                <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-blue-200 flex flex-col items-center p-5 gap-5">
                  {/* Hàng đầu tiên: Icon và chữ thành công */}
                  <div className="flex flex-col items-center justify-center w-full mb-1">
                    <div className="bg-green-100 rounded-full p-3 shadow mb-1">
                      <CheckCircleFilled style={{ fontSize: 48, color: '#22c55e' }} />
                    </div>
                    <div className="text-lg font-bold text-green-700 tracking-wide">{predictionResult.message}</div>
                  </div>
                  {/* Hàng thứ hai: 2 cột */}
                  <div className="flex flex-row w-full gap-8">
                    {/* Cột trái: Ảnh, giờ vào, tâm trạng */}
                    <div className="flex flex-col items-center flex-shrink-0 w-44">
                      <img
                        src={imageBase64}
                        alt="Khuôn mặt nhận diện"
                        className="rounded-2xl border border-gray-300 shadow w-28 h-28 object-cover mb-4"
                        style={{ maxWidth: 112, maxHeight: 112 }}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center text-base font-medium text-blue-700">
                            <span>
                              {predictionResult.data.time_in
                                ? new Date(predictionResult.data.time_in).toLocaleTimeString('vi-VN', {
                                    hour12: false,
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : ''}
                          </span>
                        </div>
                        <div className={`flex items-center text-base font-medium gap-2 ${emotionMap[predictionResult.data.emotion]?.color || "text-gray-700"}`}>
                          {emotionMap[predictionResult.data.emotion]?.icon}
                          <span>{emotionMap[predictionResult.data.emotion]?.label || "Không xác định"}</span>
                        </div>
                      </div>
                    </div>
                    {/* Cột phải: Thông tin còn lại */}
                    <div className="flex flex-col flex-1 items-start gap-3 justify-center">
                      <div className="text-xl font-bold text-blue-900">{predictionResult.data.student_name}</div>
                      <div className="text-base font-medium text-gray-600">
                        Mã sinh viên: <span className="font-semibold text-blue-700">{predictionResult.data.student_id}</span>
                      </div>
                      <div className="flex items-center text-base mt-2">
                        <span className="font-semibold text-gray-600">Trạng thái:</span>
                        <span className={`ml-2 font-semibold ${
                          predictionResult.data.status === 'early'
                            ? 'text-green-600'
                            : predictionResult.data.status === 'late'
                            ? 'text-yellow-600'
                            : 'text-gray-500'
                        }`}>
                          {predictionResult.data.status === 'early' && 'Đúng giờ'}
                          {predictionResult.data.status === 'late' && 'Đi muộn'}
                          {(predictionResult.data.status === null || predictionResult.data.status === 'absent') && 'Chưa điểm danh'}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs mt-2">
                        Cập nhật: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  <div>Chưa có dữ liệu. Đang chờ kết quả từ camera...</div>
                  <div>{predictionResult?.message}</div>
                  {imageBase64 && (
                    <img
                      src={imageBase64}
                      alt="Khuôn mặt nhận diện"
                      className="rounded-lg border border-gray-300 shadow w-24 h-24 object-cover mx-auto mt-2"
                      style={{ maxWidth: 96, maxHeight: 96 }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
    )
}