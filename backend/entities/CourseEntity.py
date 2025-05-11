from pydantic import BaseModel, Field

class CourseEntity(BaseModel):
    id : str
    name : str
    teacher: str

class CourseCreateRequestEntity(BaseModel):
    id : str = Field(..., example="INT2008_1")
    name : str = Field(..., example="Công nghệ phần mềm")
    teacher: str = Field(..., example="Phạm Ngọc Hùng")

class CourseUpdateRequestEntity(BaseModel):
    name : str = Field(..., example="Công nghệ phần mềm")
    teacher: str = Field(..., example="Nguyễn Đức Anh")

