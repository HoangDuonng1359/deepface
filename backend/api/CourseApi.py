from fastapi import APIRouter
from pydantic import BaseModel

from entities.CourseEntity import (
    CourseCreateRequestEntity, 
    CourseUpdateRequestEntity 
)

from services.CourseService import CourseService
from services.StudentService import StudentService

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("/")
async def get_all_courses():
    """
    Lấy tất cả lớp học
    """
    all_courses = CourseService.get_all_courses()
    return {
        "success": True,
        "message": "Lấy danh sách lớp học thành công",
        "data": all_courses
    }


@router.get("/{course_id}")
async def get_course_by_id(course_id: str):
    """
    Lấy thông tin lớp học theo ID
    """
    course = CourseService.get_course_by_id(course_id)
    if course is None:
        return {
            "success": False,
            "message": f"Không tìm thấy lớp có mã {course_id}",
            "data": None
        }

    return {
        "success": True,
        "message": "Lấy thông tin lớp học thành công",
        "data": course
    }

@router.get("/{course_id}/attendances")
async def get_attendances_by_course_id(course_id: str):
    """
        Lấy lịch sử điểm danh của một lớp học
    """
    
    course = CourseService.get_course_by_id(course_id)
    if course is None:
        return {
            "success": False,
            "message": f"Không tìm thấy lớp có mã {course_id}",
            "data": None
        }
    
    attendances = CourseService.get_attendances_by_course_id(course_id)

    return {
        "success": True,
        "message": "Lấy lịch sử điểm danh thành công",
        "data": attendances
    }

@router.get("/{course_id}/students")
async def get_students_by_course_id(course_id: str):
    """
    Lấy danh sách sinh viên trong một lớp học
    """
    course = CourseService.get_course_by_id(course_id)
    if course is None:
        return {
            "success": False,
            "message": f"Không tìm thấy lớp có mã {course_id}",
            "data": None
        }

    students = CourseService.get_students_by_course_id(course_id)
    return {
        "success": True,
        "message": "Lấy danh sách sinh viên thành công",
        "data": students
    }

@router.post("/")
async def create_course(new_course: CourseCreateRequestEntity):
    """
    Tạo lớp học mới
    """

    # Kiểm tra xem lớp học đã tồn tại hay chưa
    course = CourseService.get_course_by_id(new_course.course_id)
    if course is not None:
        return {
            "success": False,
            "message": "Lớp học đã tồn tại",
            "data": course
        }
    # Kiểm tra xem sinh viên đã tồn tại hay chưa
    for student_id in new_course.students:
        student_in_course = StudentService.get_student_by_id(student_id)
        if student_in_course is None:
            return {
                "success": False,
                "message": f"Sinh viên có mã {student_id} không tồn tại",
                "data": None
            }

    # Tạo lớp học mới
    CourseService.create_course(
        new_course.course_id, 
        new_course.course_name, 
        new_course.teacher_name, 
        new_course.students
    )

    course = CourseService.get_course_by_id(new_course.course_id)

    if course is not None:
        return {
            "success": True,
            "message": "Tạo lớp học thành công",
            "data": course
        }

    return {
        "success": False,
        "message": "Tạo lớp học không thành công",
        "data": None
    }

@router.put("/{course_id}")
async def update_course(course_id: str, new_course: CourseUpdateRequestEntity):
    """
    Cập nhật thông tin lớp học theo ID
    """
    course = CourseService.get_course_by_id(course_id)
    if course is None:
        return {
            "success": False,
            "message": "Lớp học không tồn tại",
            "data": None
        }

    CourseService.update_course(
        course_id,
        new_course.course_name,
        new_course.teacher_name,
        new_course.students
    )
    course = CourseService.get_course_by_id(course_id)
    return {
        "success": True,
        "message": "Cập nhật lớp học thành công",
        "data": course
    }

@router.delete("/{course_id}")
async def delete_course(course_id: str):
    """
    Xóa lớp học theo ID
    """
    course = CourseService.get_course_by_id(course_id)
    if course is None:
        return {
            "success": False,
            "message": "Lớp học không tồn tại",
            "data": None
        }

    CourseService.delete_course(course_id)
    return {
        "success": True,
        "message": "Xóa lớp học thành công",
        "data": None
    }
