from pydantic import BaseModel, Field

class StudentCreateRequestEntity(BaseModel):
    student_id: str = Field(..., description="Mã sinh viên", example="23020001")
    student_name: str = Field(..., description="Tên sinh viên", example="Nguyen Van A")
    images: list[str] = Field(..., description="Danh sách hình ảnh sinh viên", example=["base64_image_string_1", "base64_image_string_2"])

class StudentUpdateRequestEntity(BaseModel):
    student_name: str = Field(..., description="Tên sinh viên", example="Nguyen Van B")
    images: list[str] = Field(..., description="Danh sách hình ảnh sinh viên", example=["base64_image_string_3", "base64_image_string_4"])

class StudentImageEntity(BaseModel):
    image_id: str = Field(..., description="Mã ảnh sinh viên", example="1")
    student_id: str = Field(..., description="Mã sinh viên", example="23020001")
    base64_image: str = Field(..., description="Hình ảnh sinh viên", example="base64_image_string")
