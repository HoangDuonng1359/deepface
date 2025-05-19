from pydantic import BaseModel, Field

class StudentCreateRequestEntity(BaseModel):
    student_id: str = Field(..., description="Mã sinh viên", example="23020001")
    student_name: str = Field(..., description="Tên sinh viên", example="Nguyen Van A")
    cohort : str = Field(..., description="Lớp khóa học", example="K68-IT1")
    images: list[str] = Field(..., description="Danh sách hình ảnh sinh viên", example=["base64_image_string_1", "base64_image_string_2"])

class StudentUpdateRequestEntity(BaseModel):
    student_name: str = Field(..., description="Tên sinh viên", example="Nguyen Van B")
    cohort : str = Field(..., description="Lớp khóa học", example="K68-IT1")
    images: list[str] = Field(..., description="Danh sách hình ảnh sinh viên", example=["base64_image_string_3", "base64_image_string_4"])
