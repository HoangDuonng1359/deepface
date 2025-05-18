from fastapi import FastAPI
from pydantic import BaseModel

from api import CourseApi, StudentApi, AttendanceApi


app = FastAPI(
    title="Deepface API",
    description="API for Deepface",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.include_router(CourseApi.router)
app.include_router(StudentApi.router)
app.include_router(AttendanceApi.router)

