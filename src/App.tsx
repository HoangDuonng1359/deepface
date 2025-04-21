import React from 'react';
import logo from './logo.svg';
import './App.css';
import HomePage from './page/HomePage';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage></HomePage>}></Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
