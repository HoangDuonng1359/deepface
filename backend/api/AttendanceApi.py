from fastapi import APIRouter
from entities.AttendanceEntity import (
    AttendanceCreateRequestEntity, 
    AttendanceCheckRequestEntity 
)
from services.AttendanceService import AttendanceService
from services.CourseService import CourseService
from datetime import datetime
import pytz

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.post("/")
async def create_attendance(attendance: AttendanceCreateRequestEntity):
    """
    Tạo ca điểm danh mới, và trả về thông tin ca điểm danh đã tạo
    """

    course = CourseService.get_course_by_id(attendance.course_id)
    if course is None:
        return {
            "success": False,
            "message": f"Không tìm thấy khóa học có mã {attendance.course_id}",
            "data": None
        }

    attendance_id = AttendanceService.create_attendance(
        attendance.course_id,
        attendance.late_time,
        attendance.end_time
    )

    if attendance_id is not None:
        return {
            "success": True,
            "message": "Tạo ca điểm danh thành công",
            "data": attendance_id
        }
    
    return {
        "success": False,
        "message": "Tạo ca điểm danh thất bại",
        "data": None
    }

@router.get("/{attendance_id}")
async def get_attendance_by_id(attendance_id: int):
    """Lấy gữ liệu attendance bằng id"""
    attendance = AttendanceService.get_attendance_by_id(attendance_id)
    if attendance is None:
        return {
            "success": False,
            "message": f"Không tìm thấy ca điểm danh có ID {attendance_id}",
            "data": None
        }
    else:
        return{
            "success": True,
            "message": f"Lấy dữ liệu điểm danh thành công",
            "data": attendance
        }


@router.put("/{attendance_id}/end")
async def end_attendance(attendance_id: int):
    """
    Kết thúc ca điểm danh
    """
    # Nếu ca điểm danh không tồn tại
    attendance = AttendanceService.get_attendance_by_id(attendance_id)
    if attendance is None:
        return {
            "success": False,
            "message": f"Không tìm thấy ca điểm danh có ID {attendance_id}",
            "data": None
        }
    
    # Nếu tồn tại thì thực hiện kết thúc
    AttendanceService.end_attendance(attendance_id)

    # Trả về thống kê ca điểm danh
    attendance = AttendanceService.get_attendance_by_id(attendance_id)
    students = AttendanceService.get_students_by_attendance_id(attendance_id)
    punctuation = AttendanceService.punctuality_statistics_by_attendance_id(attendance_id)
    emotion = AttendanceService.emotion_statistics_by_attendance_id(attendance_id)

    attendance['students'] = students
    attendance['punctuation'] = punctuation
    attendance['emotion'] = emotion

    return {
        "success": True,
        "message": "Đã kết thúc ca điểm danh",
        "data": attendance
    }

@router.put("/{attendance_id}")
async def check_attendance(attendance_id: int, request: AttendanceCheckRequestEntity):
    """
    Gửi một yêu cầu điểm danh
    """
    # Tính thời gian tại điểm bắt đầu request
    time_now = datetime.now(pytz.timezone("Asia/Ho_Chi_Minh"))

    # Kiểm tra xem ca điểm danh có tồn tại hay không
    attendance = AttendanceService.get_attendance_by_id(attendance_id)
    if attendance is None:
        return {
            "success": False,
            "message": f"Không tìm thấy ca điểm danh",
            "data": None
        }

    # Gửi yêu cầu nhận diện khuôn mặt
    student_id = AttendanceService.verify_attendance(
        attendance['course_id'], 
        request.image
    )

    if student_id is None:
        return {
            "success": False,
            "message": "Không tìm thấy sinh viên trong ảnh",
            "data": None
        }
    
    # Kiểm tra xem đã điểm danh trước đó hay chưa
    student_attendance = AttendanceService.get_student_by_attendance_id(attendance_id, student_id)
    if student_attendance is not None:
        return {
            "success": True,
            "message": "Đã điểm danh, vui lòng ra chỗ khác",
            "data": student_attendance
        }
    
    # Nếu chưa, tiến hành điểm danh
    AttendanceService.checkin_attendance(
        attendance_id, 
        student_id, 
        request.emotion,
        time_now
    )

    return {
        "success": True,
        "message": "Điểm danh thành công",
        "data": AttendanceService.get_student_by_attendance_id(attendance_id, student_id)
    }

