import React, { useEffect, useState } from 'react';
import {Layout} from 'antd';

// Components
import Header from '../components/Header';
import { Course } from '../interface/Course';
import CourseList from '../components/CourseList';
import CourseDetail from '../components/CourseDetail';
import { API_ENDPOINTS } from '../constants/api';

const { Content, Sider } = Layout;

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  
    useEffect(() => {
      const fetchCoursesAndStudents = async () => {
        try {
          const res = await fetch(API_ENDPOINTS.COURSE.GET_ALL);
          const result = await res.json();
          const coursesWithStudents = await Promise.all(result.data.map(async (course: Course) => {
            try {
              const resStudents = await fetch(API_ENDPOINTS.COURSE.GET_STUDENTS_BY_COURSE_ID(course.course_id));
              const studentsResult = await resStudents.json();

              // Fetch attendances
              let attendances = [];
              try {
                const resAttendances = await fetch(API_ENDPOINTS.COURSE.GET_ATTENDANCES_BY_COURSE_ID(course.course_id));
                const attendancesResult = await resAttendances.json();
                attendances = attendancesResult.data;
              } catch (e) {
                console.log('Lỗi lấy dữ liệu attendances', e);
              }

              return { ...course, students: studentsResult.data, attendances };
            } catch (e) {
              console.log('Lỗi lấy dữ liệu students', e);
              return { ...course, students: [], attendances: [] };
            }
          }));
          setCourses(coursesWithStudents);
        } catch (error) {
          console.log('Lỗi lấy dữ liệu khóa học', error);
        }
      };

      fetchCoursesAndStudents();
    }, []);


  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0]);

  const handleCourseSelect = (courseId: string) => {
    const course: Course | null = (courses as Course[]).find((c: Course) => c.course_id === courseId) || null;
    setSelectedCourse(course);
  };

 

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Layout>
        <Sider width={300} theme="light" className="border-r border-gray-200">
          <CourseList 
            courses={courses} 
            selectedCourseId={selectedCourse?.course_id || ""} 
            onSelectCourse={handleCourseSelect} 
          />
        </Sider>
        
        <Content className="bg-gray-50 p-6">
          {selectedCourse && (
            <CourseDetail course={selectedCourse} />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;