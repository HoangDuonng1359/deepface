from pydantic import BaseModel, Field

class StudentEntity(BaseModel):
    id: str
    name: str

class StudentCreateRequestEntity(BaseModel):
    pass

class StudentUpdateRequestEntity(BaseModel):
    pass

