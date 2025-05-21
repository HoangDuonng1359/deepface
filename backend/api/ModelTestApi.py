from fastapi import APIRouter
from pydantic import BaseModel, Field

from drivers.AIDriver import AIDriver

class AddStudentRequest(BaseModel):
    student_id: str = Field(..., description="Student ID", example="23020326")
    images: list[str] = Field(..., description="List of base64 images", example=["image1"])

class FindStudentRequest(BaseModel):
    image: str = Field(..., description="Base64 image", example="base64_image_string")

router = APIRouter(prefix="/api/model_test", tags=["Model Test"])


@router.post("/")
async def add_student(request: AddStudentRequest):
    model = AIDriver([])
    model.add_student(request.student_id, request.images)
    return {"message": "Student added successfully."}

@router.post("/find")
async def find_student(request: FindStudentRequest):
    model = AIDriver([])
    student_id = model.find(request.image)
    return {"student_id": student_id}
