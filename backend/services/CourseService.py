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
        pass

    @staticmethod
    def get_course_by_id(course_id: int) -> CourseEntity:
        pass

    @staticmethod
    def create_course(course: CourseCreateRequestEntity):
        pass

    @staticmethod
    def update_course(course_id: int, course: CourseUpdateRequestEntity):
        pass

    @staticmethod
    def delete_course(course_id: int):
        pass