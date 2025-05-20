
import { Student } from "./Course";

export interface StudentsAttendance extends Student{
    time_in: string;
    status: string;
    emotion: string;
}

export interface Attendance {
    attendance_id: number;
    course_id : string;
    start_time: string;
    late_time: string;
    end_time: string;
    students: StudentsAttendance[];
}