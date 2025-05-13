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
        if all_courses is None:
            return "Không có lớp học nào"
        return all_courses

    @staticmethod
    def get_course_by_id(course_id: str):
        """
        Lấy thông tin lớp học theo ID
        """
        sql = "SELECT * FROM courses WHERE course_id = %s"
        params = (course_id,)
        course = db.query_get(sql, params)

        if course is None:
            return {
                "result": 0,
                "message": "Không có lớp học nào với ID này",
            }
        return course

    @staticmethod
    def create_course(course: CourseCreateRequestEntity):
        """
        Tạo lớp học mới
        """
        sql = "INSERT INTO courses (course_id, course_name, teacher_name) VALUES (%s, %s, %s)"
        params = (course.course_id, course.course_name, course.teacher_name)
        course_id = db.query_set(sql, params)
        return {"message": "Create a new course", "courseId": course_id}

    @staticmethod
    def update_course(course_id: str, course: CourseUpdateRequestEntity):
        """
        Cập nhật thông tin lớp học theo ID
        """
        sql = "UPDATE courses SET course_name = %s, teacher_name = %s WHERE course_id = %s"
        params = (course.course_name, course.teacher_name, course_id)
        db.query_set(sql, params)

        return {"message": "Update course successfully", "courseId": course_id}


    @staticmethod
    def delete_course(course_id: str):
        """
        Xóa lớp học theo ID
        """
        sql = "DELETE FROM courses WHERE course_id = %s"
        params = (course_id,)
        db.query_set(sql, params)
        return {"message": f"Delete course with ID {course_id}"}
