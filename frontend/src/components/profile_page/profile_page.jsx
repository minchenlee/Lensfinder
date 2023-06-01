import { useState, useEffect, useContext, useRef, createContext } from 'react'
import './profile_page.css'
import Layout from '../layout/layout'

import { authorize_get } from '../../api'

import RecommendationBlock from '../recommendation_block/recommendation_block'
import Dashboard from '../analysis_page/dashboard/dashboard'
import Modal from '../modal/modal'

import Snapshot from './snapshot/snapshot'

// 滾動套件
import Scroll from 'react-scroll';
let scroller = Scroll.scroller;

import { AllPageContext } from '../../App'

// Create a context
const profileContext = createContext();
export { profileContext };


function SnapshotBlock({imagesInfoList}){
  const {hasData, setImagesInfoDict, setdeleteSnapshot} = useContext(profileContext);
  // console.log(imagesInfoList.length)

  if (imagesInfoList.length === undefined) {
    return;
  }

  return(
    <div className='snapshot-block'>
      {
        imagesInfoList.map((imageInfoDict, index) => {
          return (
            <Snapshot key={imageInfoDict.id} id={index}
            imageInfoDict={imageInfoDict} imagesInfoList={imagesInfoList}
            setImagesInfoDict={setImagesInfoDict}
            setdeleteSnapshot = {setdeleteSnapshot}
            />
          )
        })
      }
    </div>
  )
}


function ProfilePage() {
  const [fileList, setFileList] = useState([]); // 用來存上傳的檔案
  const [imagesInfoList, setImagesInfoList] = useState([]); // 用來存所有 request 取得的 metadata
  const [imagesInfoDict, setImagesInfoDict] = useState({}); // 用來存分類好的 metadata
  const [hasData, setHasData] = useState(false); // 用來判斷是否有資料
  const [section, setSection] = useState('dashboard'); // 用來切換頁面
  const [isSaved, setIsSaved ] = useState(false); // 用來判斷是否按過 save 按鈕
  const [deleteSnapshot, setdeleteSnapshot] = useState(null); // 用來刪除 snapshot

  const { isSignedIn, setIsSignedIn } = useContext(AllPageContext);

  const arrowRef = useRef(null);
  const pictureCountRef = useRef(null);
  const barChartRef = useRef(null);

  const profileRef = useRef(null);
  const { dashboardRef } = useContext(AllPageContext);
  const switcherRef = useRef(null);
  
  const saveButttonRef = useRef(null);

  const contextValue = {
    fileList, setFileList, 
    imagesInfoList, setImagesInfoList,
    imagesInfoDict, setImagesInfoDict,
    hasData, setHasData,
    section, setSection,
    isSaved, setIsSaved,
    deleteSnapshot, setdeleteSnapshot,
    pictureCountRef,
    barChartRef,
    profileRef,
    dashboardRef,
    switcherRef,
    saveButttonRef
  }

  useEffect(() => {
    // console.log(imagesInfoDict)
  }, [imagesInfoDict])

  // 讓 arrow 自動隨著頁面位置翻轉
  useEffect(() => {
    // 如果沒有登入，就不執行
    if (!isSignedIn || !hasData) {
      return;
    }

    let windowHeight = window.innerHeight;
    let dashboardRect = null;
    let uploadRect = null;
    let scrollTimeout = null;

    // 當頁面載入時，取得 dashboard 和 upload 的位置
    const getBoundingClientRects = () => {
      dashboardRect = dashboardRef.current?.getBoundingClientRect();
      uploadRect = profileRef.current?.getBoundingClientRect();
    };

    // 當頁面滾動時，判斷 dashboard 和 upload 是否佔據整個畫面
    function handleScroll() {
      getBoundingClientRects();

      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }

      scrollTimeout = requestAnimationFrame(() => {
        const dashboardVisibleHeight = Math.max(0, Math.min(dashboardRect.bottom, windowHeight) - Math.max(dashboardRect.top, 0));
        const uploadVisibleHeight = Math.max(0, Math.min(uploadRect.bottom, windowHeight) - Math.max(uploadRect.top, 0));

        if (dashboardVisibleHeight >= windowHeight) {
          setSection('profile');
          arrowRef.current?.classList.remove('arrow-down');
          arrowRef.current?.classList.add('arrow-up');
        }

        if (uploadVisibleHeight >= windowHeight) {
          setSection('dashboard');
          arrowRef.current?.classList.remove('arrow-up');
          arrowRef.current?.classList.add('arrow-down');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
    };
  }, [isSignedIn]);


  // call api to get snapshot
  useEffect(() => {
    // 沒有登入的狀態不發送 request
    if (!isSignedIn){
      return
    }

    const fetchData = async () => {
      try {
        const JWT = localStorage.getItem('lensFinderToken');
        const result = await authorize_get('snapshot', JWT);

        // console.log(result);

        setImagesInfoList(result);
        setImagesInfoDict(result[0].analysis_result);
        setHasData(true);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchData();
  }, [isSignedIn])

  return (
    <Layout>
      <profileContext.Provider value={contextValue}>
        <div className="container-fluid">
          <section id='profile' className="profile-page-block" ref={profileRef}>
            {isSignedIn ?
              <div className="profile-table">
                <SnapshotBlock imagesInfoList={imagesInfoList}/>
              </div>
              :
              <div className="blur-mask center-all flex-column">
                <h5 className='mb-3'> Ready to explore your analysis history? <br/> Sign in or sign up to discover your past insights!</h5>
                  <div className="d-flex flex-column align-items-center w-100 SIU-button">
                    <button className="btn btn-outline-light" data-bs-target="#signInModal" data-bs-toggle="modal">Sign in</button>
                    <button className="btn btn-outline-light" data-bs-target="#signUpModal" data-bs-toggle="modal">Sign up</button>
                  </div>
              </div>
            }
            {
              (!hasData && isSignedIn) &&
              <div className="blur-mask center-all flex-column">
                <h5 className='mb-3'> You haven't analyzed anything yet. <br/> Let's get started and uncover insights together!</h5>
              </div>
            }
          </section>
          {(isSignedIn && hasData) &&
            <section id='dashboard' ref={dashboardRef} className='dashboard' >
              <div id="dashboardCarousel" className="carousel slide" data-bs-ride="false">
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <Dashboard/>
                  </div>
                  <div className="carousel-item vh-100 overflow-scroll">
                    <RecommendationBlock/>
                  </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#dashboardCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#dashboardCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                </button>
              </div>
            </section>
          }
          <Modal/>
        </div>
      </profileContext.Provider>
    </Layout>
  )
}

export default ProfilePage