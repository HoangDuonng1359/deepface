import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/attendance")

@router.post("/")
async def create_attendance():
    return {"message": "Attendance created"}

@router.get("/{attendance_id}")
async def get_attendance(attendance_id: int):
    return {"message": f"Details of attendance {attendance_id}"}

@router.put("/{attendance_id}")
async def check_attendance(attendance_id: int):
    return {"message": f"Attendance {attendance_id} checked"}
