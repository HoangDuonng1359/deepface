from fastapi import APIRouter

from entities.StudentEntity import (
    StudentEntity, 
    StudentCreateRequestEntity, 
    StudentUpdateRequestEntity 
)

router = APIRouter(prefix="/api/students", tags=["students"])

@router.get("/")
async def get_students():
    """
    Lấy tất cả sinh viên
    """
    return {"message": "Get all students"}

@router.get("/{student_id}")
async def get_student(student_id: int):
    """
    Lấy thông tin sinh viên theo ID
    """
    return {"message": f"Get student with ID {student_id}"}

@router.post("/")
async def create_student(student: StudentCreateRequestEntity):
    """
    Tạo sinh viên mới
    """
    return {"message": "Create a new student", "student": student}

@router.put("/{student_id}")
async def update_student(student_id: int, student: StudentUpdateRequestEntity):
    """
    Cập nhật thông tin sinh viên theo ID
    """
    return {"message": f"Update student with ID {student_id}", "student": student}

@router.delete("/{student_id}")
async def delete_student(student_id: int):
    """
    Xóa sinh viên theo ID
    """
    return {"message": f"Delete student with ID {student_id}"}