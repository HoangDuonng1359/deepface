from fastapi import APIRouter
from pydantic import BaseModel

from entities.CourseEntity import (
    CourseEntity, 
    CourseCreateRequestEntity, 
    CourseUpdateRequestEntity 
)

from entities.ResponseEntity import ResponseEntity
from services.CourseService import CourseService

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
async def get_course(course_id: str):
    """
    Lấy thông tin lớp học theo ID
    """
    course = CourseService.get_course_by_id(course_id)
    if course is None:
        return {
            "success": False,
            "message": "Lớp học không tồn tại",
            "data": None
        }

    return {
        "success": True,
        "message": "Lấy thông tin lớp học thành công",
        "data": course
    }

@router.post("/")
async def create_course(new_course: CourseCreateRequestEntity):
    """
    Tạo lớp học mới
    """
    course = CourseService.get_course_by_id(new_course.course_id)
    if course is not None:
        return {
            "success": False,
            "message": "Lớp học đã tồn tại",
            "data": course
        }

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
async def update_course(course_id: str, course: CourseUpdateRequestEntity):
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

    CourseService.update_course(course_id, course)
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
