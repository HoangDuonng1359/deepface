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
    Tạo điểm danh
    """
    attendance = AttendanceService.create_attendance(attendance)
    return ResponseEntity(
        success=True,
        message="Tạo ca điểm danh thành công",
        data=attendance
    )

@router.get("/{attendance_id}")
async def get_attendance(attendance_id: int):
    """
    Lấy thông tin điểm danh theo ID
    """
    attendance = AttendanceService.get_attendance_by_id(attendance_id)
    if attendance is None:
        return ResponseEntity(
            success=False,
            message="Ca điểm danh không tồn tại",
            data=None
        )
    
    return ResponseEntity(
        success=True,
        message="Lấy thông tin ca điểm danh thành công",
        data=attendance
    )

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

