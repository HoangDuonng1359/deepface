import React, { useEffect, useState } from 'react';
import {Layout, Spin} from 'antd';

// Components
import Header from '../components/Header';
import { Course } from '../interface/Course';
import CourseList from '../components/CourseList';
import CourseDetail from '../components/CourseDetail';
import { API_ENDPOINTS } from '../constants/api';

const { Content, Sider } = Layout;

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
    useEffect(() => {
      const fetchCoursesAndStudents = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(API_ENDPOINTS.COURSE.GET_ALL);
          const result = await res.json();
          const coursesWithStudents = await Promise.all(result.data.map(async (course: Course) => {
        try {
          const resStudents = await fetch(API_ENDPOINTS.COURSE.GET_STUDENTS_BY_COURSE_ID(course.course_id));
          const studentsResult = await resStudents.json();
          const studentsWithImages = await Promise.all(
            (studentsResult.data || []).map(async (student: any) => {
          try {
            const resImages = await fetch(API_ENDPOINTS.STUDENT.GET_STUDENTS_BY_ID(student.student_id));
            const imagesResult = await resImages.json();
            return { ...student, images: (imagesResult.data.images && imagesResult.data.images.length > 0) ? imagesResult.data.images[0] : "" };
          } catch (e) {
            console.log('Lỗi lấy dữ liệu images', e);
            return { ...student, images: [] };
          }
            })
          );

          // Fetch attendances
          let attendances = [];
          try {
            const resAttendances = await fetch(API_ENDPOINTS.COURSE.GET_ATTENDANCES_BY_COURSE_ID(course.course_id));
            const attendancesResult = await resAttendances.json();
            attendances = attendancesResult.data;
          } catch (e) {
            console.log('Lỗi lấy dữ liệu attendances', e);
          }

          return { ...course, students: studentsWithImages, attendances };
        } catch (e) {
          console.log('Lỗi lấy dữ liệu students', e);
          return { ...course, students: [], attendances: [] };
        }
          }));
          console.log(coursesWithStudents)
          setCourses(coursesWithStudents);
        } catch (error) {
          console.log('Lỗi lấy dữ liệu khóa học', error);
        }
        setIsLoading(false);
      };

      fetchCoursesAndStudents();
    }, []);


  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0]);

  const handleCourseSelect = (courseId: string) => {
    const course: Course | null = (courses as Course[]).find((c: Course) => c.course_id === courseId) || null;
    setSelectedCourse(course);
  };

  useEffect(() => {
    setSelectedCourse(courses[0] || null);
  }, [courses]);

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
        <Content className="bg-gray-50 p-6" style={{ position: 'relative', minHeight: '100vh' }}>
          {isLoading && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(255,255,255,0.7)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Spin size="large"/>
            </div>
          )}
          {!isLoading && selectedCourse && (
            <CourseDetail course={selectedCourse} />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;