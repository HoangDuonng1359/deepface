from pydantic import BaseModel, Field

class StudentEntity(BaseModel):
    id: str
    name: str

class StudentCreateRequestEntity(BaseModel):
    id: str = Field(..., description="Mã sinh viên", example="23020001")
    name: str = Field(..., description="Tên sinh viên", example="Nguyen Van A")

class StudentUpdateRequestEntity(BaseModel):
    name: str = Field(..., description="Tên sinh viên", example="Nguyen Van B")

