
import { Student } from "./Course";

export interface StudentsAttendance extends Student{
    time_in: string;
    status: string;
    emotion: string;
}

export interface Attendance {
    attendance_id: number;
    start_time: string;
    end_time: string;
    students: StudentsAttendance[];
}