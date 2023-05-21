import './App.css'
import 'animate.css';
import { useState } from 'react'
import { Route, Routes } from 'react-router'; // new import statement
import HomePage from './components/home_page/home_page.jsx'
import AnalysisPage from './components/analysis_page/analysis_page.jsx'
import ProfilePage from './components/profile_page/profile_page.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route element={<HomePage />} path={'/'}></Route>
        <Route element={<AnalysisPage />} path={'/analysis'}></Route>
        <Route element={<ProfilePage />} path={'/profile'}></Route>
      </Routes>
    </>
  )
}

export default App
