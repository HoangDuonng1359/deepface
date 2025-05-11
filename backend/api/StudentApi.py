from fastapi import APIRouter

from entities.StudentEntity import (
    StudentEntity, 
    StudentCreateRequestEntity, 
    StudentUpdateRequestEntity 
)

from services.StudentService import StudentService

router = APIRouter(prefix="/api/students", tags=["students"])

@router.get("/")
async def get_all_students():
    """
    Lấy tất cả sinh viên
    """
    all_students = StudentService.get_all_students()
    return all_students

@router.get("/{student_id}")
async def get_student(student_id: int):
    """
    Lấy thông tin sinh viên theo ID
    """
    student = StudentService.get_student_by_id(student_id)
    return student

@router.post("/")
async def create_student(student: StudentCreateRequestEntity):
    """
    Tạo sinh viên mới
    """
    result = StudentService.create_student(student)
    return result

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