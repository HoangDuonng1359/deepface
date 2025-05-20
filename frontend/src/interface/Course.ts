// Types

import { Attendance } from "./Attendance";

export interface Student{
    student_id: string;
    student_name: string;
    cohort: string;
}

export interface Course {
  course_id: string;
  title: string;
  course_name: string;
  teacher_name: string;
  description: string;
  attendances: Attendance[];
  students: Student[];
}