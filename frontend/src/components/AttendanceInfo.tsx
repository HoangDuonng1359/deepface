import React from "react";
import dayjs from "dayjs";
import { Course } from "../interface/Course";
import { Attendance } from "../interface/Attendance";

interface AttendanceInfoProps {
  course?: Course;
  attendance?: Attendance;
}

const AttendanceInfo: React.FC<AttendanceInfoProps> = ({ course, attendance }) => {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg w-full">
      {course ? (
        <>
          <h2 className="text-2xl font-semibold text-center mb-6 text-blue-700">
            {course.course_name}
          </h2>
          <div className="space-y-4 text-base">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {/* Cột 1: Thông tin khoá học */}
              <div className="flex flex-col gap-2">
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
              {/* Cột 2: Thông tin ca điểm danh */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Mã ca điểm danh:</span>
                  <span>{attendance?.attendance_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Bắt đầu:</span>
                  <span>
                    {attendance?.start_time
                      ? dayjs(attendance.start_time).format('HH:mm DD/MM/YYYY')
                      : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Thời gian kết thúc:</span>
                  <span>
                    {attendance?.end_time
                      ? dayjs(attendance.end_time).format('HH:mm DD/MM/YYYY')
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Đang tải dữ liệu khoá học...</p>
      )}
    </div>
  );
};

export default AttendanceInfo;