import React, { useContext, useState, useRef} from 'react';
import { AllPageContext } from '../../../App.jsx';
import { analysisContext } from '../analysis_page.jsx';
import { profileContext } from '../../profile_page/profile_page.jsx';
import { demoContext } from '../../demo_page/demo_page.jsx';
import './dashboard.css';

// 圖表
import BarChart from '../chart/BarChart';
import PieChart from '../chart/PieChart';

//
import { authorize_post } from '../../../api'// API
import jwt_decode from "jwt-decode"; // 解析 JWT 的套件


function AnalysisOverview({hasData, isAnalysisPage, imagesInfoDict, chartInlineStyle}) {
  //  如果沒有上傳照片，顯示 No Data
   if (!hasData) {
    return (
      <div className='analysis-overview-info'>
        <p>No Data</p>
      </div>
    )
  }

  // 計算照片拍攝的橫跨日期
  function CalculateDate() {
    let startTimestamp = 0;
    let endTimestamp = 0;
    let startDate = 'None';
    let endDate = 'None';

    if (!hasData) {
      return [startDate, endDate];
    }

    if (hasData) {
      startTimestamp = Math.min(...imagesInfoDict.CreateDate);
      endTimestamp = Math.max(...imagesInfoDict.CreateDate);
    }

    startDate = new Date(startTimestamp * 1000).toLocaleDateString();
    endDate = new Date(endTimestamp * 1000).toLocaleDateString();
    return [startDate, endDate];
  }

  // 計算最常使用的鏡頭
  function CalculateLensModel() {
    let maxLensModel = 'None';
    if (hasData) {
      let lensModel = Object.keys(imagesInfoDict.LensModel);
      let lensModelCount = Object.values(imagesInfoDict.LensModel);
      let maxCount = Math.max(...lensModelCount);
      maxLensModel = lensModel[lensModelCount.indexOf(maxCount)];
    }
    return maxLensModel;
  }

  // 計算最常使用的焦距
  function CalculateFocalLength() {
    if (hasData) {
      let focalLength = Object.keys(imagesInfoDict.FocalLength);
      let focalLengthCount = Object.values(imagesInfoDict.FocalLength);
      let maxCount = Math.max(...focalLengthCount);
      let maxFocalLength = focalLength[focalLengthCount.indexOf(maxCount)];
      return maxFocalLength;
    }
  }

  // 計算最常使用的攝影角度
  function CalculateOrientation() {
    let maxOrientation = 'None';
    if (hasData) {
      let orientation = Object.keys(imagesInfoDict.Orientation);
      let orientationCount = Object.values(imagesInfoDict.Orientation);
      let maxCount = Math.max(...orientationCount);
      maxOrientation = orientation[orientationCount.indexOf(maxCount)];
    }

    if (maxOrientation === '1') {
      maxOrientation = 'Horizontal';
    }

    if (maxOrientation === '8' || maxOrientation === '6') {
      maxOrientation = 'Vertical';
    }

    return maxOrientation;
  }

  let [startDate, endDate] = CalculateDate();
  let maxLensModel = CalculateLensModel();
  let maxFocalLength = CalculateFocalLength();
  let maxOrientation = CalculateOrientation();

  // 判斷 startDate 和 endDate 是否為同一天
  let sameDate = false;
  if (startDate === endDate) {
    sameDate = true;
  }

  // 判斷是在 analysis page 還是 profile page
  let Context = profileContext;
  if (isAnalysisPage) {
    Context = analysisContext;
  }

  if (window.location.pathname === '/demo') {
    Context = demoContext;
  }

  const { isSignedIn, setIsSignedIn } = useContext(AllPageContext);
  const {isSaved, setIsSaved} = useContext(Context);
  const { saveButttonRef } = useContext(Context);
  let total = imagesInfoDict.total;

  // 如果有上傳照片，顯示分析結果
  return(
    <div className='row w-100 analysis-overview' style={chartInlineStyle}>
      <div className='col-4 center-all'>
        <div>
          <p className='photo-count mb-0'>{total}</p>
          <p className='mb-0'>photos</p>
          {isAnalysisPage && 
            <button className="btn btn-outline-light save-button animate__animated" data-bs-toggle="modal" 
            data-bs-target={isSignedIn ? '#saveNamingModal' : '#signInUpModalSave'}
            ref={saveButttonRef}> 
              {isSaved ? `Saved`: `Save`}
            </button>
          }
        </div>
      </div>
      <div className='analysis-overview-info col-8'>
        {
          sameDate ? 
          <p> Date: <span className='bold'>{startDate}</span></p> 
          :
          <p className=''>Date: <span className='bold'>{startDate} ~ {endDate}</span></p>
        }
        <p className=''>Most used lens: <span className='bold'>    {maxLensModel}</span></p>
        <p className=''>Most used focal length: <span className='bold'>{maxFocalLength} mm</span></p>
        <p className=''>Most shoot orientation: <span className='bold'>{maxOrientation}</span></p>
      </div>
    </div>
  )
};


function Dashboard(){
  let isAnalysisPage = false;

  // 判斷是在 analysis page 還是 profile page
  let Context = profileContext;
  if (window.location.pathname === '/analysis') {
    Context = analysisContext;
    isAnalysisPage = true;
  }
  // 判斷是否在 demo 頁面
  if (window.location.pathname === '/demo') {
    Context = demoContext;
  }

  const { 
    fileList, hasData,
    imagesInfoDict, barChartRef, 
    switcherRef, saveButttonRef
  } = useContext(Context);
  
  // console.log(hasData);
  const [ isSwitchChart, setSwitchChart ] = useState(false);

  // 切換圖表
  function handleChartSwitch() {
    setSwitchChart(!isSwitchChart);

    // 點擊切換圖表的變化
    if (switcherRef.current) {
      switcherRef.current.classList.add('pulse');
    }

    // 400ms 後移除動畫
    setTimeout(() => {
      if (switcherRef.current) {
        switcherRef.current.classList.remove('pulse');
      }
    }, 400);
  }


  // 將圓餅圖的高度和長條圖的高度同步
  let chartInlineStyle = {};
  if (hasData && barChartRef.current) {
    chartInlineStyle = {
      height: barChartRef.current.clientHeight
    }
  }

 
  return (
    <div className="container-fluid">
      <div className='chart-switcher' onClick={handleChartSwitch}>
        <i className="bi bi-three-dots"></i>
      </div>
      <div className='switcher-decoration center-all' ref={switcherRef}>
        <div className='circle-1 switcher-decoration '/>
        <div className='circle-2 switcher-decoration '/>
        <div className='circle-3 switcher-decoration '/>
      </div>
      <div className='row w-100 h-10'></div>
      <div className='row h-40 gx-5 sub-block first-sub'>
        <div className='col-lg-5 ms-auto center-all'>
          <AnalysisOverview
          isAnalysisPage={isAnalysisPage}
          hasData={hasData}
          imagesInfoDict={imagesInfoDict}
          />
        </div>
        <div className='col-lg-5 me-auto center-all'>
          {isSwitchChart ? 
            <div className='pie-chart center-all' style={chartInlineStyle}>
              <PieChart
              dataDict={imagesInfoDict.LensModel}
              name={'LensModel'}
              />
            </div> 
            : 
            <BarChart
            dataDict={imagesInfoDict.ShutterSpeed}
            backgroundColor={'rgb(99, 255, 132)'}
            name={'ShutterSpeed'}
            />
          }
        </div>
      </div>
      <div className='row h-40 gx-5 sub-block'>
        <div className='col-lg-5 ms-auto center-all' ref={barChartRef}>
          {isSwitchChart ?
            <BarChart 
            dataDict={imagesInfoDict.FocalLength} 
            backgroundColor={'rgb(255, 198, 99)'}
            name={'FocalLength'}
            />
            :
            <BarChart 
            dataDict={imagesInfoDict.Aperture} 
            backgroundColor={'rgb(255, 99, 132)'}
            name={'Apeture'}/>
          }
        </div>
        <div className='col-lg-5 me-auto center-all'>
          {isSwitchChart ?
            <BarChart 
            dataDict={imagesInfoDict.FocalLengthIn35mmFormat} 
            backgroundColor={'rgb(247, 242, 107)'}
            name={'FocalLength in 35mm format'}
            />
            :
            <BarChart 
            dataDict={imagesInfoDict.ISO} 
            backgroundColor={'rgb(247, 242, 107)'}
            name={'ISO'}
            />
          }
          
        </div>
      </div>
      <div className='row w-100 h-10'></div>
    </div>
  );
}

export default Dashboard;