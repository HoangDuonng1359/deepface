from fastapi import APIRouter

from entities.StudentEntity import (
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
    return {
        "success": True,
        "message": "Lấy danh sách sinh viên thành công",
        "data": all_students
    }


@router.get("/{student_id}")
async def get_student(student_id: int):
    """
    Lấy thông tin sinh viên theo ID
    """
    student = StudentService.get_student_by_id(student_id)
    if student is None:
        return {
            "success": False,
            "message": "Sinh viên không tồn tại",
            "data": None
        }

    return {
        "success": True,
        "message": "Lấy thông tin sinh viên thành công",
        "data": student
    }

@router.post("/")
async def create_student(new_student: StudentCreateRequestEntity):
    """
    Tạo sinh viên mới
    """

    student = StudentService.get_student_by_id(new_student.student_id)
    if student is not None:
        return {
            "success": False,
            "message": "Sinh viên đã tồn tại",
            "data": student
        }

    student = StudentService.create_student(
        new_student.student_id,
        new_student.student_name,
        new_student.images
    )

    return {
        "success": True,
        "message": "Tạo sinh viên thành công",
        "data": student
    }


@router.put("/{student_id}")
async def update_student(student_id: int, student: StudentUpdateRequestEntity):
    """
    Cập nhật thông tin sinh viên theo ID
    """
    StudentService.update_student(
        student_id, 
        student.student_name, 
        student.images
    )
    
    return {
        "success": True,
        "message": "Cập nhật sinh viên thành công",
        "data": StudentService.get_student_by_id(student_id)
    }
    


@router.delete("/{student_id}")
async def delete_student(student_id: int):
    """
    Xóa sinh viên theo ID
    """
    StudentService.delete_student(student_id)
    student = StudentService.get_student_by_id(student_id)
    
    if student is not None:
        return {
            "success": False,
            "message": "Xóa sinh viên không thành công",
            "data": student
        }

    return {
        "success": True,
        "message": "Xóa sinh viên thành công",
        "data": None
    }
