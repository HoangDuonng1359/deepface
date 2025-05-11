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
        pass

    @staticmethod
    def create_student(student: StudentCreateRequestEntity):
        pass

    @staticmethod
    def update_student(student_id: int, student: StudentUpdateRequestEntity):
        pass

    @staticmethod
    def delete_student(student_id: int):
        pass