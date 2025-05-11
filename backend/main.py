from fastapi import FastAPI
from pydantic import BaseModel

from api import CourseApi, StudentApi, AttendanceApi


app = FastAPI()
app.include_router(CourseApi.router)
app.include_router(StudentApi.router)
app.include_router(AttendanceApi.router)

