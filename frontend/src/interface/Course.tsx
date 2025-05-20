// Types

import { API_ENDPOINTS } from "../constants/api";

export interface Student{
    studentId: string;
    studentName: string;
}

export interface Course {
  course_id: number;
  title: string;
  course_name: string;
  teacher_name: string;
  description: string;
  schedule : string;
  numStudent: number;
  students: Student[];
  status: 'active' | 'completed' | 'upcoming';
}