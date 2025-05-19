from drivers.DatabaseDriver import DatabaseConnector

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
        # Lấy thông tin lớp học
        sql = "SELECT * FROM courses WHERE course_id = %s"
        params = (course_id,)
        course = db.query_get(sql, params, limit=1)

        if course is None:
            return None

        # Lấy danh sách sinh viên (id, name) trong lớp học
        sql = """
            SELECT s.student_id, s.student_name
            FROM student_course sc
            JOIN students s ON sc.student_id = s.student_id
            WHERE sc.course_id = %s
        """
        params = (course_id,)
        students = db.query_get(sql, params)
        course['students'] = students
        course['num_students'] = len(students)
        
        return course
    
    @staticmethod
    def get_students_by_course_id(course_id: str):
        """
        Lấy danh sách sinh viên theo ID lớp học
        """
        
        sql = """
            SELECT s.student_id, s.student_name
            FROM student_course sc
            JOIN students s ON sc.student_id = s.student_id
            WHERE sc.course_id = %s
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
        sql = """
            UPDATE courses
            SET course_name = %s, teacher_name = %s
            WHERE course_id = %s
        """
        params = (course_name, teacher_name, course_id)
        db.query_set(sql, params)
    
        # Xóa danh sách sinh viên cũ
        sql = """
            DELETE FROM student_course
            WHERE course_id = %s
        """
        params = (course_id,)
        db.query_set(sql, params)

        # Thêm danh sách viên đã cập nhật
        sql = """
            INSERT INTO student_course (course_id, student_id)
            VALUES (%s, %s)
        """
        for student_id in students:
            params = (course_id, student_id)
            db.query_set(sql, params)

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
