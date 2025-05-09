from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()

@app.get("/api/courses")
async def get_all_courses():
    pass

@app.get("/api/courses/{course_id}")
async def get_course(course_id: int):
    pass

@app.post("/api/courses")
async def create_course(course: BaseModel):
    pass

@app.put("/api/courses/{course_id}")
async def update_course(course_id: int, course: BaseModel):
    pass

@app.delete("/api/courses/{course_id}")
async def delete_course(course_id: int):
    pass

@app.get("/api/students")
async def get_all_students():
    pass

@app.get("/api/students/{student_id}")
async def get_student(student_id: int):
    pass

@app.post("/api/students")
async def create_student(student: BaseModel):
    pass

@app.put("/api/students/{student_id}")
async def update_student(student_id: int, student: BaseModel):
    pass

@app.delete("/api/students/{student_id}")
async def delete_student(student_id: int):
    pass

@app.get("/api/attendance/{attendance_id}")
async def get_attendance(attendance_id: int):
    pass

@app.post("/api/attendance/{course_id}")
async def new_attendance(course_id: int):
    pass

@app.post("/api/attendance/{attention_id}")
async def check_in_attendance(attention_id: int):
    pass



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050)