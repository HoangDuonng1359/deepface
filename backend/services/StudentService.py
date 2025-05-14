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

        Returns:
            list: Danh sách sinh viên
        """

        sql = "SELECT * FROM students"
        params = ()
        all_students = db.query_get(sql, params)

        return all_students

    @staticmethod
    def get_student_by_id(student_id: int):
        """
        Lấy thông tin sinh viên theo ID
        Args:
            student_id (int): ID của sinh viên
        Returns:
            dict: Thông tin sinh viên | None nếu không tìm thấy
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
        """
        Cập nhật thông tin sinh viên theo ID
        """
        sql = "UPDATE students SET name = %s WHERE id = %s"
        params = (student.name, student_id)
        db.query_set(sql, params)

        return {"message": "Update student", "studentId": student_id}

    @staticmethod
    def delete_student(student_id: int):
        """
        Xóa sinh viên theo ID
        """
        sql = "DELETE FROM students WHERE id = %s"
        params = (student_id,)
        db.query_set(sql, params)

        return {"message": "Delete student", "studentId": student_id}


    @staticmethod
    def insert_image_student(image: StudentImageEntity):
        """
        Chèn hình ảnh sinh viên vào cơ sở dữ liệu
        """

        with open(image.base64_image, "rb") as image_file:
            encoded_bytes = base64.b64encode(image_file.read())
            image.base64_image = encoded_bytes.decode('utf-8')
        sql = "INSERT INTO student_image (image_id, student_id, image) VALUES (%s, %s, %s)"
        params = (image.image_id, image.student_id, image.base64_image)
        db.query_set(sql, params)

        return {"message": "Insert image student"}
    
