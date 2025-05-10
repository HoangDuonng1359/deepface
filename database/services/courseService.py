import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from pydantic import BaseModel
from database.services.databaseService import Service



class CourseService(Service):
    
    @staticmethod
    def get_all_courses():
        return [
            {
                "courseId" : 1,
                "courseName" : "Công nghệ phần mềm",
                "teacherName" : "Phạm Ngọc Hùng",
                "numStudent" : 85,
            },
        ]

    def get_course_by_id(self, course_id):
        pass

    def create_course(self, course : BaseModel):
        pass





