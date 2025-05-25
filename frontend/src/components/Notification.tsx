import React from "react";
import { CheckCircleTwoTone, InfoCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

interface NotificationProps {
  type?: "success" | "info" | "error";
  message: string;
  description?: string;
  onClose?: () => void;
}

const iconMap = {
  success: <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 32 }} />,
  info: <InfoCircleTwoTone twoToneColor="#1890ff" style={{ fontSize: 32 }} />,
  error: <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 32 }} />,
};

const bgMap = {
  success: "bg-green-50 border-green-200",
  info: "bg-blue-50 border-blue-200",
  error: "bg-red-50 border-red-200",
};

const Notification: React.FC<NotificationProps> = ({
  type = "info",
  message,
  description,
  onClose,
}) => (
  <div
    className={`flex items-start gap-4 rounded-xl border px-5 py-4 shadow-lg max-w-md mx-auto ${bgMap[type]}`}
    style={{ animation: "fadeInDown 0.5s" }}
  >
    <div className="mt-1">{iconMap[type]}</div>
    <div className="flex-1">
      <div className="font-semibold text-base mb-1">{message}</div>
      {description && <div className="text-gray-600 text-sm">{description}</div>}
    </div>
    {onClose && (
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-700 transition"
        aria-label="Đóng"
      >
        ×
      </button>
    )}
    <style>
      {`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}
    </style>
  </div>
);

export default Notification;