from fastapi import APIRouter

from entities.StudentEntity import (
    StudentEntity, 
    StudentCreateRequestEntity, 
    StudentUpdateRequestEntity 
)
from entities.ResponseEntity import ResponseEntity
from services.StudentService import StudentService

router = APIRouter(prefix="/api/students", tags=["students"])

@router.get("/")
async def get_all_students() -> ResponseEntity:
    """
    Lấy tất cả sinh viên
    """
    
    all_students = StudentService.get_all_students()
    return ResponseEntity(
        result=1,
        message="Lấy danh sách sinh viên thành công",
        data=all_students
    )


@router.get("/{student_id}")
async def get_student(student_id: int) -> ResponseEntity:
    """
    Lấy thông tin sinh viên theo ID
    """
    output = StudentService.get_student_by_id(student_id)
    if output is None:
        return ResponseEntity(
            result=0,
            message="Không có sinh viên nào với ID này",
            data=None
        )

    student = StudentEntity(**output)
    return ResponseEntity(
        result=1,
        message="Lấy thông tin sinh viên thành công",
        data=student
    )


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
    result = StudentService.update_student(student_id, student)
    return {"message": f"Update student with ID {student_id}", "student": student}


@router.delete("/{student_id}")
async def delete_student(student_id: int):
    """
    Xóa sinh viên theo ID
    """
    result = StudentService.delete_student(student_id)
    return {"message": f"Delete student with ID {student_id}"}
