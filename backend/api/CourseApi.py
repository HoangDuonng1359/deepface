from fastapi import APIRouter

from entities.CourseEntity import (
    CourseEntity, 
    CourseCreateRequestEntity, 
    CourseUpdateRequestEntity 
)

from services.CourseService import CourseService
router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("/")
async def get_all_courses():
    """
    Lấy tất cả lớp học
    """
    result = CourseService.get_all_courses()
    return result

@router.get("/{course_id}")
async def get_course(course_id: str):
    """
    Lấy thông tin lớp học theo ID
    """
    return CourseService.get_course_by_id(course_id)

@router.post("/")
async def create_course(course: CourseCreateRequestEntity):
    """
    Tạo lớp học mới
    """
    newCourse = CourseService.create_course(course)
    return {"message": "Create a new course", "course": newCourse}

@router.put("/{course_id}")
async def update_course(course_id: str, course: CourseUpdateRequestEntity):
    """
    Cập nhật thông tin lớp học theo ID
    """
    return CourseService.update_course(course_id, course)

@router.delete("/{course_id}")
async def delete_course(course_id: str):
    """
    Xóa lớp học theo ID
    """
    return CourseService.delete_course(course_id)
