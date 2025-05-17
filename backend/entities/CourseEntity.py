from pydantic import BaseModel, Field

class CourseCreateRequestEntity(BaseModel):
    course_id : str = Field(..., example="INT2008-1")
    course_name : str = Field(..., example="Công nghệ phần mềm")
    teacher_name: str = Field(..., example="Phạm Ngọc Hùng")
    students: list[str] = Field(..., example=["23020001", "23020015", "23020326"])

class CourseUpdateRequestEntity(BaseModel):
    course_name : str = Field(..., example="Công nghệ phần mềm")
    teacher_name: str = Field(..., example="Nguyễn Đức Anh")
    students: list[str] = Field(..., example=["23020001", "23020015", "23020326"])
