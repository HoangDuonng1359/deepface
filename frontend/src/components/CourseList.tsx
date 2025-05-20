import React from 'react';
import { List, Typography, Input } from 'antd';
import { SearchOutlined} from '@ant-design/icons';
import { Course } from '../interface/Course';

const { Title, Text } = Typography;

interface CourseListProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourse: (id: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, selectedCourseId, onSelectCourse }) => {

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
              </div>
              <div className="flex justify-between items-center mb-2 ml-2">
                <Text type="secondary" className="text-sm truncate">{course.teacher_name}</Text>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default CourseList;