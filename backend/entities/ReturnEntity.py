from pydantic import BaseModel

class ReturnEntity(BaseModel):
    success: bool
    message: str
    data: BaseModel | None = None