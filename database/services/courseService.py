import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from pydantic import BaseModel



class CourseService:
    
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

    @staticmethod
    def get_course_by_id(self, course_id):
    
        pass

    @staticmethod
    def create_course(self, course : BaseModel):
        pass

    @staticmethod
    def update_course(self, course : BaseModel):
        pass

    @staticmethod
    def delete_course(self, course_id):
        pass
