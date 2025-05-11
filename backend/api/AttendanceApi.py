from fastapi import APIRouter

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.post("/")
async def create_attendance():
    """
    Tạo điểm danh
    """
    return {"message": "Create attendance"}

@router.get("/{attendance_id}")
async def get_attendance(attendance_id: int):
    """
    Lấy thông tin điểm danh theo ID
    """
    return {"message": f"Get attendance with ID {attendance_id}"}

@router.put("/{attendance_id}")
async def check_attendance(attendance_id: int):
    """
    Gửi một yêu cầu điểm danh
    """
    return {"message": f"Check attendance with ID {attendance_id}"}

