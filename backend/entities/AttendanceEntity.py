from pydantic import BaseModel, Field


class AttendanceCreateRequestEntity(BaseModel):
    course_id: str = Field(..., example="INT2208-2")
    late_time: str = Field(..., example="2025-05-19 08:30:00")

class AttendanceCheckRequestEntity(BaseModel):
    # attendance_id: int = Field(..., example=1)
    emotion : str = Field(..., example="happy")
    image: str = Field(..., example="4AAQSkZJRgABAQEBgAAD...B1Gaso52HBprUGrqx")
