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
    return ResponseEntity(
        success=True,
        message="Lấy danh sách lớp học thành công",
        data=all_courses
    )


@router.get("/{course_id}")
async def get_course(course_id: str):
    """
    Lấy thông tin lớp học theo ID
    """
    course = CourseService.get_course_by_id(course_id)
    if course is None:
        return ResponseEntity(
            success=False,
            message="Lớp học không tồn tại",
            data=None
        )
    
    return ResponseEntity(
        success=True,
        message="Lấy thông tin lớp học thành công",
        data=course
    )

@router.post("/")
async def create_course(course: CourseCreateRequestEntity):
    """
    Tạo lớp học mới
    """
    course = CourseService.get_course_by_id(course.course_id)
    if course is not None:
        return ResponseEntity(
            success=False,
            message="Lớp học đã tồn tại",
            data=course
        )

    course = CourseService.create_course(course)
    return ResponseEntity(
        success=True,
        message="Tạo lớp học thành công",
        data=course
    )

@router.put("/{course_id}")
async def update_course(course_id: str, course: CourseUpdateRequestEntity):
    """
    Cập nhật thông tin lớp học theo ID
    """
    course = CourseService.get_course_by_id(course_id)
    if course is None:
        return ResponseEntity(
            success=False,
            message="Lớp học không tồn tại",
            data=None
        )

    course = CourseService.update_course(course_id, course)
    return ResponseEntity(
        success=True,
        message="Cập nhật lớp học thành công",
        data=course
    )

@router.delete("/{course_id}")
async def delete_course(course_id: str):
    """
    Xóa lớp học theo ID
    """
    course = CourseService.get_course_by_id(course_id)
    if course is None:
        return ResponseEntity(
            success=False,
            message="Lớp học không tồn tại",
            data=None
        )

    CourseService.delete_course(course_id)
    return ResponseEntity(
        success=True,
        message="Xóa lớp học thành công",
        data=None
    )
