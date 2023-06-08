import './App.css'
import 'animate.css';
import { useState, useEffect , createContext , useRef} from 'react'
import { Route, Routes } from 'react-router'; // new import statement
import jwt_decode from 'jwt-decode';
import HomePage from './components/home_page/home_page.jsx'
import AnalysisPage from './components/analysis_page/analysis_page.jsx'
import ProfilePage from './components/profile_page/profile_page.jsx'
import DemoPage from './components/demo_page/demo_page.jsx'


const AllPageContext = createContext()
export { AllPageContext }

function App() {
  const dashboardRef = useRef(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const contextValue = {
    isSignedIn, setIsSignedIn,
    dashboardRef
  }

  // 判斷是否登入
  useEffect(() => {
    localStorage.getItem('lensFinderToken') ? setIsSignedIn(true) : setIsSignedIn(false);
  }, []);

  // useEffect(() => {
  //   console.log(isSignedIn)
  // }, [isSignedIn])

  // 檢查 token 是否過期
  useEffect(() => {
    // 檢查是否登入
    if (!isSignedIn) return;
    
    function checkToken() {
      const JWT = localStorage.getItem('lensFinderToken');
      if (jwt_decode(JWT).exp < Math.round(Date.now() / 1000)) {
        alert('Please sign in again');

        // 清除 token
        localStorage.removeItem('lensFinderToken');
        setIsSignedIn(false);
        return;
      }
    }

    // 每 5 秒鐘檢查一次
    const interval = setInterval(checkToken, 5000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  return (
    <AllPageContext.Provider value={contextValue}>
      <Routes>
        <Route element={<HomePage />} path={'/'} ></Route>
        <Route element={<AnalysisPage />} path={'/analysis'}></Route>
        <Route element={<ProfilePage />} path={'/profile'}></Route>
        <Route element={<DemoPage/>} path={'/demo'}></Route>
      </Routes>
    </AllPageContext.Provider>
  )
}

export default App
