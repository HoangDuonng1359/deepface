from pydantic import BaseModel, Field

class StudentEntity(BaseModel):
    id: str
    name: str

class StudentCreateRequestEntity(BaseModel):
    id: str = Field(..., description="Mã sinh viên", example="23020001")
    name: str = Field(..., description="Tên sinh viên", example="Nguyen Van A")

class StudentUpdateRequestEntity(BaseModel):
    name: str = Field(..., description="Tên sinh viên", example="Nguyen Van B")

class StudentImageEntity(BaseModel):
    image_id: str = Field(..., description="Mã ảnh sinh viên", example="1")
    student_id: str = Field(..., description="Mã sinh viên", example="23020001")
    base64_image: str = Field(..., description="Hình ảnh sinh viên", example="base64_image_string")
