import React from 'react';
import { List, Typography, Badge, Input } from 'antd';
import { SearchOutlined, BookOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Course } from '../interface/Course';

const { Title, Text } = Typography;

interface CourseListProps {
  courses: Course[];
  selectedCourseId: number;
  onSelectCourse: (id: number) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, selectedCourseId, onSelectCourse }) => {
  // Function to get status icon
  const getStatusIcon = (status: Course['status']) => {
    switch (status) {
      case 'active':
        return <BookOutlined className="text-green-500" />;
      case 'upcoming':
        return <ClockCircleOutlined className="text-blue-500" />;
      case 'completed':
        return <CheckCircleOutlined className="text-gray-500" />;
      default:
        return null;
    }
  };

  // Function to get status text color
  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'upcoming':
        return 'text-blue-500';
      case 'completed':
        return 'text-gray-500';
      default:
        return '';
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <Title level={4} className="mb-4">Danh sách lớp học</Title>
      
      <Input 
        placeholder="Tìm kiếm lớp học" 
        prefix={<SearchOutlined className="text-gray-400" />}
        className="mb-4" 
      />
      
      <List
        className="overflow-auto flex-1"
        dataSource={courses}
        renderItem={course => (
          <List.Item 
            onClick={() => onSelectCourse(course.course_id)}
            className={`cursor-pointer rounded-lg mb-2 p-4 hover:bg-blue-50 transition-colors ${
              selectedCourseId === course.course_id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="w-full">
              <div className="flex justify-between items-center mb-2 ml-2">
                <Text strong className="text-lg">{course.course_name}</Text>
                {getStatusIcon(course.status)}
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary" className="text-sm truncate">{course.teacher_name}</Text>
                <Text className={`text-xs capitalize ${getStatusColor(course.status)}`}>
                  {course.status}
                </Text>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default CourseList;