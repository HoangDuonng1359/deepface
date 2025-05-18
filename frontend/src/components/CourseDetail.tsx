import React, { useState } from 'react';
import { Card, Typography, Button, Tag, Divider, Row, Col, Statistic, Modal, Result } from 'antd';
import { UserOutlined, ClockCircleOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { Course } from '../page/Dashboard';

const { Title, Text, Paragraph } = Typography;

interface CourseDetailProps {
  course: Course;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course }) => {
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [attendanceStarted, setAttendanceStarted] = useState(false);
  const [timer, setTimer] = useState(60); // 60 seconds timer
  
  const handleStartAttendance = () => {
    setAttendanceModalVisible(true);
    setAttendanceStarted(true);
    
    // In a real application, you would start a timer here
    // and connect to a backend for attendance tracking
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
              <Title level={2} className="m-0">{course.title}</Title>
              <Tag color={getStatusColor(course.status)} className="uppercase">
                {course.status}
              </Tag>
            </div>
            <Text type="secondary" className="flex items-center gap-1">
              <UserOutlined /> Instructor: <Text strong>{course.instructor}</Text>
            </Text>
          </div>
          
          <Button 
            type="primary" 
            size="large"
            onClick={handleStartAttendance}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Bắt đầu
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
              value={course.schedule}
              valueStyle={{ fontSize: '1rem' }}
              className="mb-4"
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title={<span className="flex items-center gap-1"><TeamOutlined /> Sinh viên</span>}
              value={course.students}
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
      
      <Card title="Course Content" className="shadow-md rounded-lg border-0">
        <Paragraph>
          Course materials and content will be displayed here. Students can access lessons,
          assignments, and resources related to this course.
        </Paragraph>
      </Card>
      
      <Modal
        title="Attendance"
        open={attendanceModalVisible}
        onCancel={() => setAttendanceModalVisible(false)}
        footer={null}
        centered
      >
        <Result
          status="success"
          title="Attendance Session Started"
          subTitle={`Students can now check in for the next ${timer} seconds`}
          extra={[
            <div key="code" className="text-center mb-4">
              <div className="inline-block px-8 py-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                <Text className="text-4xl font-mono font-bold">8:45</Text>
              </div>
            </div>,
            <Button 
              key="close" 
              type="primary"
              onClick={() => setAttendanceModalVisible(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Close
            </Button>,
          ]}
        />
      </Modal>
    </div>
  );
};

export default CourseDetail;