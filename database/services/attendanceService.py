import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from pydantic import BaseModel

class AttendanceService:

    @staticmethod
    def create_attendance(course_id: int):
        pass

    @staticmethod
    def get_attendance_by_id(attendance_id: int):
        pass

    @staticmethod
    def check_in_student():
        pass