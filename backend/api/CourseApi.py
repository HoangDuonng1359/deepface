from fastapi import APIRouter

from entities.CourseEntity import (
    CourseEntity, 
    CourseCreateRequestEntity, 
    CourseUpdateRequestEntity 
)

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("/")
async def get_all_courses():
    """
    Lấy tất cả lớp học
    """
    return {"message": "Get all courses"}

@router.get("/{course_id}")
async def get_course(course_id: int):
    """
    Lấy thông tin lớp học theo ID
    """
    return {"message": f"Get course with ID {course_id}"}

@router.post("/")
async def create_course(course: CourseCreateRequestEntity):
    """
    Tạo lớp học mới
    """
    return {"message": "Create a new course", "course": course}

@router.put("/{course_id}")
async def update_course(course_id: int, course: CourseUpdateRequestEntity):
    """
    Cập nhật thông tin lớp học theo ID
    """
    return {"message": f"Update course with ID {course_id}", "course": course}

@router.delete("/{course_id}")
async def delete_course(course_id: int):
    """
    Xóa lớp học theo ID
    """
    return {"message": f"Delete course with ID {course_id}"}