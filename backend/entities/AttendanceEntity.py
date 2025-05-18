from pydantic import BaseModel, Field


class AttendanceCreateRequestEntity(BaseModel):
    course_id: str = Field(..., example="INT2008-2")
    start: str = Field(..., example="2023-10-01 08:00:00")
    end: str = Field(..., example="2023-10-01 09:00:00")

class AttendanceCheckRequestEntity(BaseModel):
    attendance_id: int = Field(..., example=1)
    image: str = Field(..., example="4AAQSkZJRgABAQEBgAAD...B1Gaso52HBprUGrqx")
