from drivers.DatabaseDriver import DatabaseConnector
from entities.StudentEntity import (
    StudentEntity,
    StudentCreateRequestEntity,
    StudentUpdateRequestEntity,
)

db = DatabaseConnector()

class StudentService:

    @staticmethod
    def get_all_students():
        """
        Lấy danh sách tất cả sinh viên
        """

        sql = "SELECT * FROM students"
        params = ()
        all_students = db.query_get(sql, params)

        return all_students

    @staticmethod
    def get_student_by_id(student_id: int):
        """
        Lấy thông tin sinh viên theo ID
        """
        sql = "SELECT * FROM students WHERE id = %s"
        params = (student_id,)
        student = db.query_get(sql, params)

        return student

    @staticmethod
    def create_student(student: StudentCreateRequestEntity):
        """
        Tạo sinh viên mới
        """
        sql = "INSERT INTO students (id, name) VALUES (%s, %s)"
        params = (student.id, student.name)
        student_id = db.query_set(sql, params)
        return {"message": "Create a new student", "studentId": student_id}

    @staticmethod
    def update_student(student_id: int, student: StudentUpdateRequestEntity):
        pass

    @staticmethod
    def delete_student(student_id: int):
        pass