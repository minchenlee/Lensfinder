import { useState, useEffect, createContext, useContext, useRef} from 'react'
import { Link } from 'react-router-dom';
import './demo_page.css'
import Layout from '../layout/layout'
import Modal from '../modal/modal'

import { AllPageContext } from '../../App';

import RecommendationBlock from '../recommendation_block/recommendation_block';
import Dashboard from '../analysis_page/dashboard/dashboard'; // 儀表板

import { get } from '../../api'
import { set } from 'react-hook-form';

// Create a context
const demoContext = createContext();
export { demoContext };


function DemoPage() {
  const [imagesInfoList, setImagesInfoList] = useState([]); // 用來存所有 request 取得的 metadata
  const [imagesInfoDict, setImagesInfoDict] = useState({}); // 用來存分類好的 metadata
  const [hasData, setHasData] = useState(false); // 用來判斷是否有資料

  const barChartRef = useRef(null);
  const switcherRef = useRef(null);

  const profileRef = useRef(null);
  const { dashboardRef } = useContext(AllPageContext);

  const carouselNextIconRef = useRef(null);
  const carouselPrevIconRef = useRef(null);

  const contextValue = {
    imagesInfoList, setImagesInfoList,
    imagesInfoDict, setImagesInfoDict,
    hasData, setHasData,
    barChartRef,
    switcherRef,
    profileRef,
    dashboardRef,
    carouselNextIconRef,
    carouselPrevIconRef,
  }

  // call api to get snapshot
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await get('demo', '');

        // console.log(result);

        setImagesInfoList(result);
        setImagesInfoDict(result[0].analysis_result);
        setHasData(true);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchData();
  }, [])

  function handleClick() {
    carouselNextIconRef.current.classList.add('hide');
    carouselPrevIconRef.current.classList.add('hide');
    setTimeout(() => {
      carouselNextIconRef.current.classList.remove('hide');
      carouselNextIconRef.current.classList.add('animate__fadeIn');

      carouselPrevIconRef.current.classList.remove('hide');
      carouselPrevIconRef.current.classList.add('animate__fadeIn');
    }
    , 600);

    setTimeout(() => {
      carouselNextIconRef.current.classList.remove('animate__fadeIn');
      carouselPrevIconRef.current.classList.remove('animate__fadeIn');
    }
    , 1000);
  }

  return(
    <Layout>
      <demoContext.Provider value={contextValue}>
        <div className='container-fluid'>
            <section id='dashboard' ref={dashboardRef} className='dashboard w-100' >
              <div id="dashboardCarousel" className="carousel slide" data-bs-ride="false">
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <Dashboard/>
                  </div>
                  <div className="carousel-item vh-100 overflow-scroll">
                    <RecommendationBlock/>
                  </div>
                </div>
                <button className="carousel-control-prev animate__animated" type="button" data-bs-target="#dashboardCarousel" data-bs-slide="prev" ref={carouselPrevIconRef} onClick={handleClick}>
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                </button>
                <button className="carousel-control-next animate__animated" type="button" data-bs-target="#dashboardCarousel" data-bs-slide="next" ref={carouselNextIconRef} onClick={handleClick}>
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                </button>
              </div>
            </section>
        </div>
      </demoContext.Provider>
    </Layout>
  )
}

export default DemoPage;