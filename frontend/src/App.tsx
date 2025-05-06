import React from 'react';
import logo from './logo.svg';
import './App.css';
import HomePage from './page/HomePage';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import FacialAttendance from './page/FacialAttendance';
import DeepFacePage from './page/DeepFacePage';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage></HomePage>}></Route>
          <Route path='/FacialAttendance' element = {<FacialAttendance></FacialAttendance>} ></Route>
          <Route path= '/deepface' element = {<DeepFacePage></DeepFacePage>}></Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
