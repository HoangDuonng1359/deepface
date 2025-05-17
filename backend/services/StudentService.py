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
    def create_student(student_id: str, student_name: str, images: list[str]):
        """
        Tạo sinh viên mới
        """
    
        pass

    @staticmethod
    def update_student(student_id: str, student_name: str, images: list[str]):
        """
        Cập nhật thông tin sinh viên theo ID
        """
        pass

    @staticmethod
    def delete_student(student_id: int):
        """
        Xóa sinh viên theo ID
        """
        pass
    
