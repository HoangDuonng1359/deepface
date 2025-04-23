import React from 'react';
import logo from './logo.svg';
import './App.css';
import HomePage from './page/HomePage';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import FacialAttendance from './page/FacialAttendance';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage></HomePage>}></Route>
          <Route path='/FacialAttendance' element = {<FacialAttendance></FacialAttendance>} ></Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
