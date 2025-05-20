import React from 'react';
import logo from './logo_uet.webp';
import './App.css';
import HomePage from './page/Dashboard';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import FacialAttendance from './page/FacialAttendance';
import DeepFacePage from './page/DeepFacePage';
import Dashboard from './page/Dashboard';
import Attendance from './page/Attendance';
import Test from './page/Attendance_copy';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path='/' element={<Dashboard></Dashboard>}></Route>
          <Route path='/FacialAttendance' element = {<FacialAttendance></FacialAttendance>} ></Route>
          <Route path= '/deepface' element = {<DeepFacePage></DeepFacePage>}></Route>
          <Route path='/attendance/:courseId' element = {<Attendance></Attendance>}></Route>
          <Route path='/test/:courseId'element = {<Test></Test>}></Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
