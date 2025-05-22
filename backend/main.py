from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api import CourseApi, StudentApi, AttendanceApi, ModelTestApi

app = FastAPI(
    title="Deepface API",
    description="API for Deepface",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route
app.include_router(CourseApi.router)
app.include_router(StudentApi.router)
app.include_router(AttendanceApi.router)
app.include_router(ModelTestApi.router)
