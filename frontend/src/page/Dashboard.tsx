import React, { useEffect, useState } from 'react';
import {Typography, Layout} from 'antd';

// Components
import Header from '../components/Header';
import { Course } from '../interface/Course';
import CourseList from '../components/CourseList';
import CourseDetail from '../components/CourseDetail';
import { API_ENDPOINTS } from '../constants/api';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;
const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
  const fetchCourses = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.COURSE.GET_ALL);
      const result = await res.json();
      setCourses(result.data);
      
    } catch (error) {
      console.log('Lỗi lấy dữ liệu khóa học', error);
    }
  };

    fetchCourses();
  }, []);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0]);

  const handleCourseSelect = (courseId: number) => {
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
            selectedCourseId={selectedCourse?.course_id || 0} 
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