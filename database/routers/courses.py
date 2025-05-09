from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/courses")

@router.get("/")
async def get_all_courses():
    return {"message": "List of all courses"}

@router.get("/{course_id}")
async def get_course(course_id: int):
    return {"message": f"Details of course {course_id}"}

@router.post("/")
async def create_course(course: BaseModel):
    return {"message": "Course created", "course": course}

@router.put("/{course_id}")
async def update_course(course_id: int, course: BaseModel):
    return {"message": f"Course {course_id} updated", "course": course}

@router.delete("/{course_id}")
async def delete_course(course_id: int):
    return {"message": f"Course {course_id} deleted"}