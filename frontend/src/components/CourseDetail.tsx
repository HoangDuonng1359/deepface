import React, { useState } from 'react';
import { Card, Typography, Button, Tag, Divider, Row, Col, Statistic, Modal, Result } from 'antd';
import { UserOutlined, ClockCircleOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { Course } from '../interface/Course';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

interface CourseDetailProps {
  course: Course;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course }) => {
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const navigate = useNavigate();


  const handleStartAttendance = () => {
    navigate(`/attendance/${course.course_id}`);
  };
  
  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'upcoming':
        return 'blue';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md rounded-lg border-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Title level={2} className="m-0">{course.course_name}</Title>
              <Tag color={getStatusColor(course.status)} className="uppercase">
                {course.status}
              </Tag>
            </div>
            <Text type="secondary" className="flex items-center gap-1">
              <UserOutlined /> Giảng viên: <Text strong>{course.teacher_name}</Text>
            </Text>
          </div>
          
          <Button 
            type="primary" 
            size="large"
            onClick={handleStartAttendance}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Bắt đầu điểm danh
          </Button>
        </div>
        
        <Paragraph className="text-gray-600 mb-6">
          {course.description}
        </Paragraph>
        
        <Divider className="my-4" />
        
        <Row gutter={24}>
          <Col span={8}>
            <Statistic 
              title={<span className="flex items-center gap-1"><CalendarOutlined /> Lịch</span>}
              value={"8:00"}
              // value={course.schedule}
              valueStyle={{ fontSize: '1rem' }}
              className="mb-4"
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title={<span className="flex items-center gap-1"><TeamOutlined /> Sinh viên</span>}
              value={course.numStudent}
              className="mb-4"
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title={<span className="flex items-center gap-1"><ClockCircleOutlined /> Thời lượng</span>}
              value="2 hours"
              valueStyle={{ fontSize: '1rem' }}
              className="mb-4"
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CourseDetail;