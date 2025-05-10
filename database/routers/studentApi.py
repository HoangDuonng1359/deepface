import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/students")

@router.get("/")
async def get_all_students():
    return {"message": "List of all students"}

@router.get("/{student_id}")
async def get_student(student_id: int):
    return {"message": f"Details of student {student_id}"}

@router.post("/")
async def create_student(student: BaseModel):
    return {"message": "Student created", "student": student}

@router.put("/{student_id}")
async def update_student(student_id: int, student: BaseModel):
    return {"message": f"Student {student_id} updated", "student": student}

@router.delete("/{student_id}")
async def delete_student(student_id: int):
    return {"message": f"Student {student_id} deleted"}