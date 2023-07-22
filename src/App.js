import './App.css';
import React from 'react'
import {Routes,Route, Router} from 'react-router'

import Layout from './Layout';
import Home from './Pages/Home';
import About from './Pages/About';
import Result from './Pages/Result';
import Download from './Pages/Download';
import Contact from './Pages/Contact';

function App() {
  return (
    <div className="custom-scrollbar-container">
      <div className='all-caps'>
        <Routes>
          <Route path='/' element={<Layout/>}>
            <Route path='/' element={<Home/>}></Route>
            <Route path='/about' element={<About/>}></Route>
            <Route path='/results' element={<Result/>}></Route>
            <Route path='/download' element={<Download/>}></Route>
            <Route path='/contact' element={<Contact/>}></Route>
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
