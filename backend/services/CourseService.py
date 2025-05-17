from drivers.DatabaseDriver import DatabaseConnector
from entities.CourseEntity import (
    CourseEntity,
    CourseCreateRequestEntity,
    CourseUpdateRequestEntity,
)

db = DatabaseConnector()

class CourseService:

    @staticmethod
    def get_all_courses():
        """
        Lấy danh sách tất cả lớp học
        """
        sql = "SELECT * FROM courses"
        params = ()
        all_courses = db.query_get(sql, params)
        
        return all_courses

    @staticmethod
    def get_course_by_id(course_id: str):
        """
        Lấy thông tin lớp học theo ID
        """
        sql = "SELECT * FROM courses WHERE course_id = %s"
        params = (course_id,)
        course = db.query_get(sql, params, limit=1)
        return course
    
    @staticmethod
    def get_students_by_course_id(course_id: str):
        """
        Lấy danh sách sinh viên theo ID lớp học
        """
        
        sql = """
            Điền lệnh SQL vào đây
        """
        params = (course_id,)
        students = db.query_get(sql, params)
        return students

    @staticmethod
    def create_course(course_id: str, course_name: str, teacher_name: str, students: list[str]):
        """
        Tạo lớp học mới
        """

        # Tạo lớp học mới
        sql = "INSERT INTO courses (course_id, course_name, teacher_name) VALUES (%s, %s, %s)"
        params = (course_id, course_name, teacher_name)
        db.query_set(sql, params)

        # Thêm sinh viên vào lớp học
        sql = "INSERT INTO student_course (course_id, student_id) VALUES (%s, %s)"
        for student_id in students:
            params = (course_id, student_id)
            db.query_set(sql, params)


    @staticmethod
    def update_course(course_id: str, course_name: str, teacher_name: str, students: list[str]):
        """
        Cập nhật thông tin lớp học theo ID
        """
        
        # Cập nhật thông tin course
    

        # Xóa danh sách sinh viên cũ
        
        
        # Thêm danh sách viên đã cập nhật
        
        

    @staticmethod
    def delete_course(course_id: str):
        """
        Xóa lớp học theo ID
        """
        # Xóa sinh viên trong lớp học
        sql = "DELETE FROM student_course WHERE course_id = %s"
        params = (course_id,)
        db.query_set(sql, params)

        # Xóa lớp học
        sql = "DELETE FROM courses WHERE course_id = %s"
        params = (course_id,)
        db.query_set(sql, params)
