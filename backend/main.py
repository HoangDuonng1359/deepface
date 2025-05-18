from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api import CourseApi, StudentApi, AttendanceApi

app = FastAPI(
    title="Deepface API",
    description="API for Deepface",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ✅ Thêm đoạn này để cho phép frontend truy cập API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # có thể thay "*" bằng ["http://frontend_admin"] nếu cần bảo mật hơn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route
app.include_router(CourseApi.router)
app.include_router(StudentApi.router)
app.include_router(AttendanceApi.router)
