from fastapi import FastAPI
from pydantic import BaseModel
from routers import courses, students, attendance
import uvicorn


app = FastAPI()
app.include_router(courses.router)
app.include_router(students.router)
app.include_router(attendance.router)