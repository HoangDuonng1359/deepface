from drivers.DatabaseDriver import DatabaseConnector

db = DatabaseConnector()

class AttendanceService:

    @staticmethod
    def create_attendance(course_id: str):
        """
        Tạo ca điểm danh mới

        Parameters:

        Returns:
            attendance_id: ID của ca điểm danh mới được tạo
        """
        sql = "INSERT INTO attendances (course_id) VALUES (%s)"
        params = (course_id,)
        attendance_id = db.query_set(sql, params)
        return attendance_id
        

    @staticmethod
    def get_attendance_by_id(attendance_id: int):
        return {
            "id" : 123,
            "course_id" : "INT2008-2",
            "course_name" : "Công nghệ phần mềm",
            "teacher_name" : "Nguyễn Đức Anh",
            "start" : "2023-10-01 08:00:00",
            "end" : "2023-10-01 09:00:00",
            "students" : [
                {
                    "student_id" : "23020001",
                    "student_name" : "Nguyễn Văn A",
                    "status" : "Đúng giờ"
                },
                {
                    "student_id" : "23020002",
                    "student_name" : "Nguyễn Văn B",
                    "status" : "Muộn"
                },
                {
                    "student_id" : "23020003",
                    "student_name" : "Nguyễn Văn C",
                    "status" : "Vắng"
                }
            ]
        }

    @staticmethod
    def check_attendance(attendance_id: int, image: str):
        """
            Khi biết một ca điểm danh và bức ảnh được gửi lên, hãy nhận diện và trả về danh tính sinh viên.
        """
        pass
        