import React, { useState } from 'react';
import { Button, Typography, Layout, Menu, Card, Avatar, Tag, Divider } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, BookOutlined, UserOutlined } from '@ant-design/icons';

// Components
import Header from '../components/Header';
import CourseList from '../components/CourseList';
import CourseDetail from '../components/CourseDetail';

// Types
export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  schedule: string;
  students: number;
  status: 'active' | 'completed' | 'upcoming';
}

const { Content, Sider } = Layout;
const { Title } = Typography;

const Dashboard: React.FC = () => {
  // Sample course data
  const courses: Course[] = [
    {
      id: 1,
      title: 'Thực hành phát triển trí tuệ nhân tạo',
      description: 'Learn the basics of React including components, props, and state management.',
      instructor: 'John Smith',
      schedule: 'Mon, Wed 10:00 - 12:00',
      students: 25,
      status: 'active',
    },
    {
      id: 2,
      title: 'Advanced TypeScript',
      description: 'Deep dive into TypeScript features, generics, and advanced type manipulation.',
      instructor: 'Emily Chen',
      schedule: 'Tue, Thu 14:00 - 16:00',
      students: 18,
      status: 'upcoming',
    },
    {
      id: 3,
      title: 'UI/UX Fundamentals',
      description: 'Understand the principles of user interface and experience design.',
      instructor: 'David Wilson',
      schedule: 'Fri 09:00 - 13:00',
      students: 22,
      status: 'active',
    },
  ];

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0]);

  const handleCourseSelect = (courseId: number) => {
    const course = courses.find(c => c.id === courseId) || null;
    setSelectedCourse(course);
  };

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Layout>
        <Sider width={300} theme="light" className="border-r border-gray-200">
          <CourseList 
            courses={courses} 
            selectedCourseId={selectedCourse?.id || 0} 
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