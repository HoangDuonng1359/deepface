import './App.css';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Dashboard from './page/Dashboard';
import Attendance from './page/Attendance';

import { useEffect } from 'react';
import StatisticPage from './page/Statistics';



function App() {
  useEffect(() => {
  document.title = "Hệ thống điểm danh";
  }, []);
  return (
    <BrowserRouter>
        <Routes>
          <Route path='/' element={<Dashboard></Dashboard>}></Route>
          <Route path='/attendance/:attendance_id' element = {<Attendance></Attendance>}></Route>
          <Route path ='/statistics/:attendance_id' element={<StatisticPage/>}></Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
