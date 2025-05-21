import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../constants/api';
import { Attendance } from '../interface/Attendance';
import { Course } from '../interface/Course';
import { Layout, Card, List, Statistic } from 'antd';
import { SmileOutlined, FrownOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import AttendanceInfo from '../components/AttendanceInfo';

const { Sider, Content } = Layout;

const StatisticPage: React.FC = () => {
  const { attendance_id } = useParams<{ attendance_id: string }>();
  const [attendance, setAttendance] = useState<Attendance>();
  const [course, setCourse] = useState<Course>();

  const getAttendance = async () => {
    try {
      if (!attendance_id) throw new Error("attendance_id is missing in URL params");
      const res = await fetch(API_ENDPOINTS.ATTENDANCE.GET_BY_ID(attendance_id));
      const data = await res.json();
      try {
        const res_course = await fetch(API_ENDPOINTS.COURSE.GET_ATTENDANCES_BY_COURSE_ID(data.data.course_id));
        const data_course = await res_course.json();
        if (data_course.data && Array.isArray(data_course.data)) {
          const foundAttendance = data_course.data.find(
            (att: Attendance) => String(att.attendance_id) === String(attendance_id)
          );
          setAttendance(foundAttendance);
        } else {
          setAttendance(undefined);
        }
        try {
          const resCourse = await fetch(API_ENDPOINTS.COURSE.GET_BY_ID(data.data.course_id));
          const result_course = await resCourse.json();
          console.log(result_course.data);
          setCourse(result_course.data);
        } catch (e) {
          console.log("Lỗi lấy dữ liệu khóa học", e);
        }
      } catch (e) {
        console.log("Lỗi lấy dữ liệu điểm danh", e);
      }
    } catch (e) {
      setAttendance(undefined);
    }
  };

  useEffect(() => {
    getAttendance();
  }, []);

  // Xử lý dữ liệu cho chart
const moodStats = (() => {
  if (!attendance?.students) return [];
  return [
    { type: 'Vui vẻ', value: attendance.emotion?.[0]?.happy || 0 },
    { type: 'Bình thường', value: attendance.emotion?.[0]?.neutral || 0 },
    { type: 'Buồn', value: attendance.emotion?.[0]?.sad || 0 },
    { type: 'Ngạc nhiên', value: attendance.emotion?.[0]?.suprise || 0 },
    { type: 'Tức giận', value: attendance.emotion?.[0]?.angry || 0 },
    { type: 'Ghê tởm', value: attendance.emotion?.[0]?.disgust || 0 },
    { type: 'Sợ hãi', value: attendance.emotion?.[0]?.fear || 0 }
  ].filter(item => item.value !== 0);
})();

  const totalStudents = attendance?.students?.length || 0;

  const moodColors = [
    '#52c41a', // Vui vẻ
    '#1890ff', // Bình thường
    '#bfbfbf', // Buồn
    '#faad14', // Ngạc nhiên
    '#f5222d', // Tức giận
    '#722ed1', // Ghê tởm
    '#13c2c2', // Sợ hãi
  ];

  return (
    <Layout className="min-h-screen">
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        boxShadow: '0 2px 8px #f0f1f2'
      }}>
        <Header />
      </div>
      <Layout className='mt-14'>
        <Sider
          width={340}
          style={{
            background: '#f7fafc',
            padding: '24px 0 24px 0',
            borderRight: '1px solid #f0f0f0',
            minHeight: 'calc(100vh - 64px)'
          }}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <div className="flex items-center justify-center gap-2 text-lg font-semibold text-blue-700">
            <UserOutlined /> Danh sách sinh viên
          </div>
          <List
            itemLayout="horizontal"
            dataSource={attendance?.students || []}
            style={{ height: '100%', overflow: 'auto' }}
            renderItem={item => (
              <List.Item
                className="hover:bg-gray-100 transition"
                style={{ paddingLeft: 16, paddingRight: 16 }}
              >
                <List.Item.Meta
                  avatar={<UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={
                    <span className="font-semibold text-base text-gray-800">
                      {item.student_name}
                    </span>
                  }
                  description={
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-gray-600">Mã SV: {item.student_id}</span>
                      {item.status && (
                        <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 flex items-center gap-1">
                          <ClockCircleOutlined /> Đi học muộn
                        </span>
                      )}
                      {item.emotion === 'happy' && (
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 flex items-center gap-1">
                          <SmileOutlined /> Vui
                        </span>
                      )}
                      {item.emotion === 'sad' && (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 flex items-center gap-1">
                          <FrownOutlined /> Buồn
                        </span>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Sider>
        <Content style={{ padding: 24, minHeight: 280, background: '#f5f6fa' }}>
          <div className="max-w-4xl mx-auto">
            <div className='mb-4'>
              <AttendanceInfo course={course} attendance={attendance}></AttendanceInfo>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="shadow rounded-lg">
                <Statistic
                  title="Sĩ số"
                  value={totalStudents}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff', fontWeight: 700 }}
                />
              </Card>
              <Card className="shadow rounded-lg">
                <Statistic
                  title="Số học sinh đi muộn"
                  value={attendance?.punctuality?.[0]?.late}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14', fontWeight: 700 }}
                />
              </Card>
            </div>
            <Card className="shadow rounded-lg">
              <div className="text-center font-bold text-xl mb-6 text-blue-700 tracking-wide">
                Thống kê tâm trạng
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div>
                  <Pie
                    data={moodStats}
                    angleField="value"
                    colorField="type"
                    radius={0.9}
                    label={{
                      text: 'value',
                      style: { fontWeight: 'bold' }
                    }}
                    legend={{
                      color: {
                        title: false,
                        position: 'left',
                        rowPadding: 5,
                      },
                    }}
                    color={moodColors}
                    height={340}
                    width={420}
                    statistic={false}
                  />
                </div>
              </div>

            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StatisticPage;