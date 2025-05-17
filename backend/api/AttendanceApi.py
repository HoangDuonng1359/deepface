from fastapi import APIRouter
from entities.AttendanceEntity import (
    AttendanceEntity, 
    AttendanceCreateRequestEntity, 
    AttendanceUpdateRequestEntity 
)
from entities.ResponseEntity import ResponseEntity
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
    return {
        "attendance_id" : attendance_id,
        "course_id" : "INT2008-2",
        "course_name" : "Công nghệ phần mềm",
        "teacher_name" : "Nguyễn Đức Anh",
        "start" : "2023-10-01 08:00:00",
        "end" : "2023-10-01 09:00:00",
        "students" : [
            {
                "student_id" : "23020001",
                "student_name" : "Nguyễn Văn A",
                "status" : "Đúng giờ"
            },
            {
                "student_id" : "23020002",
                "student_name" : "Nguyễn Văn B",
                "status" : "Muộn"
            },
            {
                "student_id" : "23020003",
                "student_name" : "Nguyễn Văn C",
                "status" : "Vắng"
            }
        ]
    }

@router.put("/{attendance_id}")
async def check_attendance(attendance_id: int):
    """
    Gửi một yêu cầu điểm danh
    """
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

