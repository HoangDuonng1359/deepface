from pydantic import BaseModel

class ResponseEntity(BaseModel):
    success: bool
    message: str
    data: BaseModel | None = None