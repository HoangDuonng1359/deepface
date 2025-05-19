from drivers.DatabaseDriver import DatabaseConnector

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

        # Lấy thông tin sinh viên
        sql = "SELECT * FROM students WHERE student_id = %s"
        params = (student_id,)
        student = db.query_get(sql, params, limit=1)
        
        if student is None:
            return None
        
        # Lấy danh sách ảnh của sinh viên
        sql = """
            SELECT i.image
            FROM students s
            JOIN student_image i ON s.student_id = i.student_id
            WHERE s.student_id = %s
        """
        params = (student_id,)
        images = db.query_get(sql, params)
        images = [image['image'] for image in images]
        student['images'] = images

        return student

    @staticmethod
    def create_student(
            student_id: str, 
            student_name: str,
            cohort: str,
            images: list[str]
        ):
        """
        Tạo sinh viên mới
        """

        # Tạo sinh viên mới trong bảng students
        sql = """
            INSERT INTO students (student_id, student_name, cohort)
            VALUES (%s, %s, %s)
        """
        params = (student_id, student_name, cohort)
        db.query_set(sql, params)

        # Thêm ảnh vào bảng student_image
        sql = """
            INSERT INTO student_image (student_id, image) 
            VALUES (%s, %s)
        """
        for image in images:
            params = (student_id, image)
            db.query_set(sql, params)

    @staticmethod
    def add_image_for_student(student_id: str, image: str):
        """
        Thêm ảnh cho sinh viên
        """
        sql = """
            INSERT INTO student_image (student_id, image) 
            VALUES (%s, %s)
        """
        params = (student_id, image)
        db.query_set(sql, params)
    
    @staticmethod
    def update_student(
            student_id: str, 
            student_name: str, 
            cohort: str, 
            images: list[str]
        ):
        """
        Cập nhật thông tin sinh viên theo ID
        """
        
        # Cập nhật thông tin sinh viên trong bảng students
        sql = """
            UPDATE students 
            SET student_name = %s, cohort = %s
            WHERE student_id = %s
        """
        params = (student_name, cohort, student_id)
        db.query_set(sql, params)

        # Xóa danh sách ảnh cũ
        sql = """
            DELETE FROM student_image
            WHERE student_id = %s
        """
        params = (student_id,)
        db.query_set(sql, params)

        # Thêm danh sách ảnh đã cập nhật
        sql = """
            INSERT INTO student_image (student_id, image) 
            VALUES (%s, %s)
        """
        for image in images:
            params = (student_id, image)
            db.query_set(sql, params)

    @staticmethod
    def delete_student(student_id: int):
        """
        Xóa sinh viên theo ID
        """
        # Xóa ảnh của sinh viên
        sql = """
            DELETE FROM student_image
            WHERE student_id = %s
        """
        params = (student_id,)
        db.query_set(sql, params)

        # Xóa sinh viên
        sql = """
            DELETE FROM students
            WHERE student_id = %s
        """
        params = (student_id,)
        db.query_set(sql, params)


