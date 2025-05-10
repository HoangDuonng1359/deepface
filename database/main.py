from fastapi import FastAPI
from pydantic import BaseModel
from database.routers import attendanceApi, courseApi, studentApi
from services.courseService import CourseService
import uvicorn


app = FastAPI()
app.include_router(courseApi.router)
app.include_router(studentApi.router)
app.include_router(attendanceApi.router)