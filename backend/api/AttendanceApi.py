from fastapi import APIRouter
from entities.AttendanceEntity import (
    AttendanceCreateRequestEntity, 
    AttendanceCheckRequestEntity 
)
from services.AttendanceService import AttendanceService

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.post("/")
async def create_attendance(attendance: AttendanceCreateRequestEntity):
    """
    Tạo ca điểm danh mới, và trả về thông tin ca điểm danh đã tạo
    """
    attendance_id = AttendanceService.create_attendance(attendance.course_id)

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
async def get_attendance(attendance_id: int):
    """
    Lấy thông tin ca điểm danh theo ID
    """
    pass

@router.put("/{attendance_id}")
async def check_attendance(attendance_id: int, request: AttendanceCheckRequestEntity):
    """
    Gửi một yêu cầu điểm danh
    """

    # Thực hiện điểm danh bằng hình ảnh
    result = AttendanceService.check_attendance(attendance_id, request.image)

    return {
        "success" : True,
        "message" : "Điểm danh thành công",
        "data" : {
            "student_id" : "123456",
            "name" : "Nguyễn Văn A",
            "status" : "late",
            "time_in" : "2023-10-01T08:00:00Z",
        }

    }

