import './App.css'
import axios from "axios"
import { useEffect, useState } from 'react'
import Login from './login';
import {Route,Routes} from 'react-router-dom'
import Home from './Home';

function App() {
  return (
      <Routes>
        <Route path="/login" Component={Login}></Route>
        <Route path='/' Component={Home}></Route>
      </Routes>
     
  )
}

export default App
