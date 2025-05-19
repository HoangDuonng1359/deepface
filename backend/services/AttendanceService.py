from drivers.DatabaseDriver import DatabaseConnector
from datetime import datetime
import pytz

db = DatabaseConnector()

class AttendanceService:

    @staticmethod
    def create_attendance(course_id: str, late_time: str):
        sql = """
            INSERT INTO attendances (course_id, start_time, late_time)
            VALUES (%s, %s, %s)     
        """
        params = (course_id, datetime.now(pytz.timezone("Asia/Bangkok")), late_time)
        attendance_id = db.query_set(sql, params)
        return attendance_id


    @staticmethod
    def end_attendance(attendance_id: int):
        sql = """
            UPDATE attendances
            SET end_time = %s
            WHERE attendance_id = %s
        """
        params = (
            datetime.now(pytz.timezone("Asia/Bangkok")), 
            attendance_id
        )
        db.query_set(sql, params)

    
    @staticmethod
    def get_attendance_by_id(attendance_id: int):
        sql = """
            SELECT 
                a.attendance_id AS attendance_id, 
                a.start_time AS start_time, 
                a.end_time AS end_time, 
                c.course_name AS course_name
            FROM attendances a
            JOIN courses c ON a.course_id = c.course_id
            WHERE a.attendance_id = %s
        """
        params = (attendance_id,)
        attendance = db.query_get(sql, params, limit=1)
        return attendance


    @staticmethod
    def get_students_by_attendance_id(attendance_id: int):
        sql = """
            SELECT
                sc.student_id AS student_id,
                s.student_name AS student_name,
                s.cohort AS cohort,
                sa.time_in AS time_in,
                sa.status AS status,
                sa.emotion AS emotion
            FROM student_course sc
            JOIN students s 
                ON s.student_id = sc.student_id
            JOIN attendances a
                ON a.course_id = sc.course_id
                AND a.attendance_id = %s
            LEFT JOIN student_attendance sa
                ON sa.student_id = sc.student_id
                AND sa.attendance_id = a.attendance_id
            
        """
        params = (attendance_id,)
        students = db.query_get(sql, params)
        return students
    

    @staticmethod
    def get_student_by_attendance_id(attendance_id: int, student_id: str):
        sql = """
            SELECT

            FROM student_course sc
            
        """
        params = (attendance_id, student_id)
        student = db.query_get(sql, params, limit=1)
        return student


    @staticmethod
    def verify_attendance(attendance_id: int, image: str):
        """
            Khi biết một ca điểm danh và bức ảnh được gửi lên, hãy nhận diện và trả về danh tính sinh viên.
        """
        pass

    
    @staticmethod
    def checkin_attendance(attendance_id: int, student_id: str, emotion: str):

        attendance = AttendanceService.get_attendance_by_id(attendance_id)
        status = 'late' if datetime.now() > attendance['late_time'] else 'early'

        sql = """
            INSERT INTO student_attendance (attendance_id, student_id, time_in, status, emotion)
            VALUES (%s, %s, %s, %s, %s)
        """
        params = (attendance_id, student_id, datetime.now(), status, emotion)
        db.query_set(sql, params)

    @staticmethod

    
    @staticmethod
    def punctuality_statistics_by_attendance_id(attendance_id: int):
        """
            Thống kê tình trạng đến đúng giờ của một sinh viên trong một ca điểm danh
        """
        sql = """
            SELECT
                COUNT(CASE WHEN sa.status = 'early' THEN 1 END) AS early,
                COUNT(CASE WHEN sa.status = 'late' THEN 1 END) AS late,
                COUNT(CASE WHEN sa.status IS NULL THEN 1 END) AS absent
            FROM student_course sc
                JOIN attendances a
                    ON sc.course_id = a.course_id
                LEFT JOIN student_attendance sa
                    ON sa.student_id = sc.student_id
                    AND sa.attendance_id = a.attendance_id
            WHERE a.attendance_id = %s;
        """
        params = (attendance_id,)
        result = db.query_get(sql, params)
        return result


    @staticmethod
    def emotion_statistics_by_attendance_id(attendance_id: int):
        """
            Thống kê tình trạng cảm xúc của sinh viên trong một ca điểm danh
        """
        sql = """
            SELECT
                COUNT(CASE WHEN sa.emotion = 'happy' THEN 1 END) AS happy,
                COUNT(CASE WHEN sa.emotion = 'sad' THEN 1 END) AS sad,
                COUNT(CASE WHEN sa.emotion = 'suprise' THEN 1 END) AS suprise,
                COUNT(CASE WHEN sa.emotion = 'angry' THEN 1 END) AS angry,
                COUNT(CASE WHEN sa.emotion = 'neutral' THEN 1 END) AS neutral,
                COUNT(CASE WHEN sa.emotion = 'disgust' THEN 1 END) AS disgust,
                COUNT(CASE WHEN sa.emotion = 'fear' THEN 1 END) AS fear
            FROM student_course sc
                JOIN attendances a
                    ON sc.course_id = a.course_id
                LEFT JOIN student_attendance sa
                    ON sa.student_id = sc.student_id
                    AND sa.attendance_id = a.attendance_id
            WHERE a.attendance_id = %s;
        """
        params = (attendance_id,)
        result = db.query_get(sql, params)
        return result
