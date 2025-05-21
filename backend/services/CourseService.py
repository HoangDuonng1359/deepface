from drivers.DatabaseDriver import DatabaseConnector
from services.AttendanceService import AttendanceService
from datetime import datetime
import pytz

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
            SELECT
                s.student_id AS student_id,
                s.student_name AS student_name,
                s.cohort AS cohort,
                COUNT(CASE WHEN sa.status = 'late' THEN 1 END) AS late,
                COUNT(CASE WHEN sa.status = 'early' THEN 1 END) AS early,
                COUNT(CASE WHEN sa.status IS NULL THEN 1 END) AS absent,
                COUNT(CASE WHEN sa.emotion = 'happy' THEN 1 END) AS happy,
                COUNT(CASE WHEN sa.emotion = 'sad' THEN 1 END) AS sad,
                COUNT(CASE WHEN sa.emotion = 'suprise' THEN 1 END) AS suprise,
                COUNT(CASE WHEN sa.emotion = 'angry' THEN 1 END) AS angry,
                COUNT(CASE WHEN sa.emotion = 'neutral' THEN 1 END) AS neutral,
                COUNT(CASE WHEN sa.emotion = 'disgust' THEN 1 END) AS disgust,
                COUNT(CASE WHEN sa.emotion = 'fear' THEN 1 END) AS fear
                
            FROM students s
                JOIN student_course sc
                    ON s.student_id = sc.student_id
                LEFT JOIN attendances a
                    ON sc.course_id = a.course_id
                LEFT JOIN student_attendance sa
                    ON s.student_id = sa.student_id
                    AND a.attendance_id = sa.attendance_id
            WHERE sc.course_id = %s
            GROUP BY s.student_id, s.student_name, s.cohort;
        """
        params = (course_id,)
        students = db.query_get(sql, params)

        return students

    @staticmethod
    def get_attendances_by_course_id(course_id: str):
        
        sql = """
            SELECT 
                a.attendance_id AS attendance_id,
                a.start_time AS start_time,
                a.late_time AS last_time,
                a.end_time AS end_time
            FROM courses c
            JOIN attendances a
                ON c.course_id = a.course_id
            WHERE c.course_id = %s
            ORDER BY a.attendance_id DESC 
        """
        params = (course_id,)
        attendances = db.query_get(sql, params)

        for attendance in attendances:
            attendance_id = attendance['attendance_id']

            students = AttendanceService.get_students_by_attendance_id(attendance_id)
            punctuation = AttendanceService.punctuality_statistics_by_attendance_id(attendance_id)
            emotion = AttendanceService.emotion_statistics_by_attendance_id(attendance_id)
            
            attendance['students'] = students
            attendance['punctuality'] = punctuation
            attendance['emotion'] = emotion

        return attendances

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

    @staticmethod
    def get_last_attendance_by_course_id(course_id: str):
        sql = """
            SELECT 
                a.attendance_id AS attendance_id,
                a.end_time AS end_time
            FROM courses c
            JOIN attendances a
                ON c.course_id = a.course_id
            WHERE c.course_id = %s
            ORDER BY a.attendance_id DESC 
            LIMIT 1
        """
        params = (course_id,)
        last_attendance = db.query_get(sql, params, limit=1)

        end_time = datetime.strptime(last_attendance['end_time'], "%Y-%m-%d %H:%M:%S")
        time_now = datetime.now(pytz.timezone("Asia/Ho_Chi_Minh"))
        if (last_attendance is None) or (time_now > end_time):
            return None
        elif time_now < end_time:
            return last_attendance