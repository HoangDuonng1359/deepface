import React, { useState } from 'react';
import { Card, Typography, Button, Tag, Divider, Row, Col, Statistic, Modal, Result, Segmented, Avatar, Form, Input, DatePicker, TimePicker, message } from 'antd';
import { UserOutlined, ClockCircleOutlined, CalendarOutlined, TeamOutlined, BarcodeOutlined } from '@ant-design/icons';
import { Course, Student } from '../interface/Course';
import { useNavigate } from 'react-router-dom';
import { Attendance } from '../interface/Attendance';
import { API_ENDPOINTS } from '../constants/api';

const { Title, Text, Paragraph } = Typography;

interface CourseDetailProps {
  course: Course;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course }) => {
  const navigate = useNavigate();

  const [segmented_value, setSegmented_value] = useState('Sinh viên');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleStartAttendance = () => {
    setIsModalOpen(true);
    form.setFieldsValue({
      course_id: course.course_id,
      late_time: null,
      end_time: null,
    });
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then(async values => {
        setIsModalOpen(false);
        try {
          const res = await fetch(API_ENDPOINTS.ATTENDANCE.CREATE_ATTENDANCE, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              course_id: values.course_id,
              late_time: values.late_time ? values.late_time.format('YYYY-MM-DD HH:mm') : null,
              end_time: values.end_time ? values.end_time.format('YYYY-MM-DD HH:mm') : null,
            }),
          });
          const attendance = await res.json();
          // Xử lý dữ liệu ở đây, ví dụ chuyển hướng hoặc gọi API
          navigate(`/attendance/${attendance.data}`);
          message.success('Đã lưu thông tin ca điểm danh!');
        } catch (e) {
          alert("Lỗi tạo ca điểm danh: " + e);
        }
      })
      .catch(info => {
        // Không làm gì, form sẽ báo lỗi
      });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 w-full h-full">
      <Card className="shadow-md rounded-lg border-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Title level={2} className="m-0">{course.course_name}</Title>
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
              title={<span className="flex items-center gap-1"><BarcodeOutlined /> Mã lớp</span>}
              value={course.course_id}
              // value={course.schedule}
              valueStyle={{ fontSize: '1rem' }}
              className="mb-4"
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title={<span className="flex items-center gap-1"><TeamOutlined />Số sinh viên</span>}
              value={course.students?.length ?? 0}
              className="mb-4"
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title={<span className="flex items-center gap-1"><ClockCircleOutlined /> Số ca điểm danh</span>}
              value={course.attendances?.length ?? 0}
              valueStyle={{ fontSize: '1rem' }}
              className="mb-4"
            />
          </Col>
        </Row>
      </Card>
      <Card className='shadow-md rounded-lg border-0'>
          <Row>
                <Segmented<string>
                  options={['Sinh viên', 'Ca điểm danh']}
                  onChange={(segmented_value) => {
                    setSegmented_value(segmented_value);
                  }}
                  defaultValue = 'Sinh viên'
                />
          </Row>
          {segmented_value === 'Sinh viên' ? (
            <Row gutter={[16, 16]} className='pt-2'>
              {course.students && course.students.length > 0 ? (
              course.students.map((student: Student) => (
                <Col key={student.student_id} span={8}>
                <Card
                  size="small"
                  className="mb-2 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg hover:bg-blue-50"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      size={64}
                      src={
                        student.images !== null
                          ? `data:image/jpeg;base64,${student.images}`
                          : undefined
                      }
                      icon={!student.images ? <UserOutlined /> : undefined}
                      style={{ borderRadius: 8, objectFit: 'cover' }}
                    />
                    <span>{student.student_name}</span>
                  </div>
                  <div className="text-xs text-gray-500">Mã sinh viên: {student.student_id}</div>
                  <div className='text-xs text-gray-500'>Khóa học: {student.cohort}</div>
                  <div style={{ marginTop: 8 }}></div>
                </Card>
                </Col>
              ))
              ) : (
              <Col>
                <span>Không có sinh viên</span>
              </Col>
              )}
            </Row>
            ) : (
            <Row gutter={[16, 16]} className='pt-2'>
              {course.attendances && course.attendances.length > 0 ? (
              course.attendances.map((attendance: Attendance, idx: number) => (
                <Col key={attendance.attendance_id || idx} span={8}>
                <Card
                  size="small"
                  className="mb-2 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg hover:bg-blue-50"
                >
                  <div className="flex items-center gap-2 mb-2">
                  <CalendarOutlined />
                  <span><b>Ca điểm danh #{attendance.attendance_id}</b></span>
                  </div>
                    <div className="text-xs text-gray-500">
                    Bắt đầu: {attendance.start_time ? new Date(attendance.start_time).toLocaleString('vi-VN', { hour12: false }) : 'Không rõ'}
                    </div>
                    <div className="text-xs text-gray-500">
                    Kết thúc: {attendance.end_time ? new Date(attendance.end_time).toLocaleString('vi-VN', { hour12: false }) : 'Không rõ'}
                  </div>
                  <div className="text-xs text-gray-500"> Số học sinh tham gia: {attendance.students.length}</div>
                </Card>
                </Col>
              ))
              ) : (
              <Col>
                <span>Không có ca điểm danh</span>
              </Col>
              )}
            </Row>
            )}
      </Card>

      {/* Modal Form */}
      <Modal
        title="Bắt đầu ca điểm danh"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            course_id: course.course_id,
            late_time: null,
            end_time: null,
          }}
        >
          <Form.Item label="Mã lớp" name="course_id">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Giờ vào muộn"
            name="late_time"
            rules={[{ required: true, message: 'Vui lòng chọn giờ vào muộn!' }]}
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn ngày và giờ vào muộn"
            />
          </Form.Item>
          <Form.Item
            label="Giờ kết thúc"
            name="end_time"
            rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn ngày và giờ kết thúc"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseDetail;