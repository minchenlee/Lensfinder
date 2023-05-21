import { useState, useEffect, createContext, useContext, useRef} from 'react'
import './analysis_page.css'
import Layout from '../layout/layout'

import { FileUploader } from "react-drag-drop-files";  // 拖拉檔案上傳的套件
const fileTypes = ["JPG", "JPEG", "HEIC"];

import { create as createExifParser } from 'exif-parser';  // 解析圖片 EXIF 的套件
import 'animate.css';  // 動畫套件

// 滾動套件
import Scroll from 'react-scroll';
let scroller = Scroll.scroller;

// 圖表
import BarChart from './chart/BarChart';
import PieChart from './chart/PieChart';

// 彈出視窗
import Modal from './modal/modal';

// Create a context
const Context = createContext();

// 解析圖片 EXIF 
async function ParseEXIF(file, setFileList) {
  const arrayBuffer = await file.arrayBuffer();
  const parser = createExifParser(arrayBuffer);
  const result = parser.parse();
  
  // console.log(file);
  // console.log(Object.keys(result.tags).length);
  // 如果圖片沒有 EXIF，則回傳 true
  if (Object.keys(result.tags).length <= 10) {
    return true; 
  }

  // 將解析結果存入 fileList
  setFileList(fileList => [...fileList, result.tags]);
  return false;
}

// 解析多張圖片 EXIF
async function ParseMultiplePicture(files, setFileList, pictureCountRef) {
  // Analyzing 圖片數量的動畫
  if (pictureCountRef.current){
    pictureCountRef.current.classList.add('is-analyzing');
  }

  for (const file of files) {
    const isFailed = await ParseEXIF(file, setFileList);
    if (isFailed) {
      pictureCountRef.current.classList.remove('is-analyzing');
      return isFailed;
    }
  }

  return false;
}


// 拖拉檔案上傳的 component
function DragDrop() {
  const { setFileList, pictureCountRef } = useContext(Context);

  async function handleChange(files) {
    // 解析多張圖片
    const isFailed = await ParseMultiplePicture(files, setFileList, pictureCountRef);
    if (isFailed) {
      alert('Please upload images that contain EXIF data.');
      return;
    }
  };

  // 圖片拖拉區域的 component
  function DragDropArea() {
    return (
      <div className="drag-drop-area square-box box-shadow glass center-all">
        <div>
          <p className='mb-0'>Drag and drop your files here,</p>
          <p className='mb-0'>or click here to upload your pictures.</p>
          <div className="drag-drop-icon">
            <i className="bi bi-file-earmark-arrow-up"></i>
          </div>
        </div>
          
      </div>
    );
  }

  return (
    <FileUploader 
    handleChange={handleChange} 
    name="file" 
    multiple={true} 
    types={fileTypes}
    children={<DragDropArea/>}
    onTypeError={() => alert('Please upload JPG or JPEG or HEIF files.')}
    />
  );
}


// Upload Image Real Time Overview
function UploadRTOverview() {
  const { fileList, setFileList, pictureCountRef } = useContext(Context);

  async function handleChange(files) {
    // 解析多張圖片
    const isFailed = await ParseMultiplePicture(files, setFileList, pictureCountRef);
    if (isFailed) {
      alert('Please upload JPG or JPEG or HEIF files.');
      return;
    }
  };

  return (
    // 讓使用者也可以從資訊欄上傳
    <FileUploader 
    handleChange={handleChange} 
    name="file" 
    multiple={true} 
    types={fileTypes}
    children={
      <div className="upload-rt-overview square-box box-shadow center-all animate__animated" ref={pictureCountRef} >
      <div>
        <p className='mb-0'>You have uploaded</p>
        <p className='mb-0'>{fileList.length}</p>
        <p className='mb-0'>pictures.</p>
      </div>
      <div className='analyzing-mask center-all'>
        <div className='analyzing-icon'>
          <i className="bi bi-arrow-clockwise"></i>
        </div>
      </div>
    </div>
    }
    onTypeError={() => alert('Please upload JPG or JPEG files.')}
    />
  )
}


// 分析 images 的 metadata
function analyze(fileList, setImagesInfoDict, pictureCountRef) {  

  // 計算陣列中各元素出現的次數
  // key 代表陣列中的元素，value 代表出現的次數
  function counting(data){
    let countingDict = {};
    for (const item of data) {
      if (countingDict[item] === undefined) {
        countingDict[item] = 1;
      } else {
        countingDict[item] += 1;
      }
    }
    return countingDict;
  }

  // sorting function
  function sortDict(dict) {
    let keys = Object.keys(dict);
    keys.sort(function(a, b) {
      return a - b;
    });

    keys.forEach(function(key) {
      let value = dict[key];
      delete dict[key];
      dict[key] = value;
    });

    return dict;
  }

  // 將資料分類  
  let FocalLength = [];
  let FocalLengthIn35mmFormat = [];
  let Aperture = [];
  let ShutterSpeed = [];
  let ISO = [];
  let CreateDate = [];
  let LensModel = [];
  let Orientation = [];

  // 將資料存入各個 list
  for (const file of fileList) {
    FocalLength.push(Math.round(file.FocalLength));
    FocalLengthIn35mmFormat.push(Math.round(file.FocalLengthIn35mmFormat));
    Aperture.push(file.ApertureValue.toFixed(1));
    ShutterSpeed.push(1/file.ExposureTime);
    ISO.push(file.ISO);
    CreateDate.push(file.CreateDate);
    LensModel.push(file.LensModel);
    Orientation.push(file.Orientation);
  }

  // 計算各個 list 中元素出現的次數
  let newImagesInfo = {
    FocalLength: counting(FocalLength),
    FocalLengthIn35mmFormat: counting(FocalLengthIn35mmFormat),
    Aperture: sortDict(counting(Aperture)),
    ShutterSpeed: counting(ShutterSpeed),
    ISO: counting(ISO),
    CreateDate: CreateDate,
    LensModel: counting(LensModel),
    Orientation: counting(Orientation),
  }

  // console.log(newImagesInfo);
  setImagesInfoDict(newImagesInfo);

  if (pictureCountRef.current && fileList.length !== 0) {
    pictureCountRef.current.classList.add('animate__bounce');
    pictureCountRef.current.classList.remove('is-analyzing');

    // 2.5 秒後移除動畫
    setTimeout(() => {
      if (pictureCountRef.current) {
        pictureCountRef.current.classList.remove('animate__bounce');
      }
    }, 2500);
  }

}


function AnalysisOverview({fileList, imagesInfoDict, chartInlineStyle}) {
  // 計算照片拍攝的橫跨日期
  function CalculateDate() {
    let startTimestamp = 0;
    let endTimestamp = 0;
    let startDate = 'None';
    let endDate = 'None';

    if (fileList.length === 0) {
      return [startDate, endDate];
    }

    if (fileList.length !== 0) {
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
    if (fileList.length !== 0) {
      let lensModel = Object.keys(imagesInfoDict.LensModel);
      let lensModelCount = Object.values(imagesInfoDict.LensModel);
      let maxCount = Math.max(...lensModelCount);
      maxLensModel = lensModel[lensModelCount.indexOf(maxCount)];
    }
    return maxLensModel;
  }

  // 計算最常使用的焦距
  function CalculateFocalLength() {
    if (fileList.length !== 0) {
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
    if (fileList.length !== 0) {
      let orientation = Object.keys(imagesInfoDict.Orientation);
      let orientationCount = Object.values(imagesInfoDict.Orientation);
      let maxCount = Math.max(...orientationCount);
      maxOrientation = orientation[orientationCount.indexOf(maxCount)];
    }

    if (maxOrientation === '1') {
      maxOrientation = 'Horizontal';
    }

    if (maxOrientation === '8') {
      maxOrientation = 'Vertical';
    }

    return maxOrientation;
  }

  let [startDate, endDate] = CalculateDate();
  let maxLensModel = CalculateLensModel();
  let maxFocalLength = CalculateFocalLength();
  let maxOrientation = CalculateOrientation();

  // 如果沒有上傳照片，顯示 No Data
  if (fileList.length === 0) {
    return (
      <div className='analysis-overview-info'>
        <p>No Data</p>
      </div>
    )
  }

  // 如果有上傳照片，顯示分析結果
  return(
    <div className='row w-100 analysis-overview' style={chartInlineStyle}>
      <div className='col-4 center-all'>
        <div>
          <p className='photo-count mb-0'>{fileList.length}</p>
          <p className='mb-0'>photos</p>
          <button className="btn btn-outline-light save-button" data-bs-toggle="modal" data-bs-target="#signInUpModal"> Save </button>
        </div>
      </div>
      <div className='analysis-overview-info col-8'>
        <p className=''>Date: <span className='bold'>{startDate} ~ {endDate}</span></p>
        <p className=''>Most used lens: <span className='bold'>    {maxLensModel}</span></p>
        <p className=''>Most used focal length: <span className='bold'>{maxFocalLength} mm</span></p>
        <p className=''>Most shoot orientation: <span className='bold'>{maxOrientation}</span></p>
      </div>
    </div>
  )
};





function Dashboard(){
  const { fileList, imagesInfoDict, barChartRef, switcherRef} = useContext(Context);
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
  if (fileList.length !== 0) {
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
      <div className='row w-100 h-40 gx-5'>
        <div className='col-5 ms-auto center-all'>
          <AnalysisOverview
          fileList={fileList}
          imagesInfoDict={imagesInfoDict}
          chartInlineStyle={chartInlineStyle}
          />
        </div>
        <div className='col-5 me-auto center-all'>
          {isSwitchChart ? 
            <div className='pie-chart center-all' style={chartInlineStyle}>
              <PieChart
              Context={Context}
              dataDict={imagesInfoDict.LensModel}
              name={'LensModel'}
              />
            </div> 
            : 
            <BarChart
            Context={Context}
            dataDict={imagesInfoDict.ShutterSpeed}
            backgroundColor={'rgb(99, 255, 132)'}
            name={'ShutterSpeed'}
            />
          }
        </div>
      </div>
      <div className='row w-100 h-40 gx-5'>
        <div className='col-5 ms-auto center-all' ref={barChartRef}>
          {isSwitchChart ?
            <BarChart 
            Context={Context}
            dataDict={imagesInfoDict.FocalLength} 
            backgroundColor={'rgb(255, 198, 99)'}
            name={'FocalLength'}
            />
            :
            <BarChart 
            Context={Context}
            dataDict={imagesInfoDict.Aperture} 
            backgroundColor={'rgb(255, 99, 132)'}
            name={'Apeture'}/>
          }
        </div>
        <div className='col-5 me-auto center-all'>
          {isSwitchChart ?
            <BarChart 
            Context={Context}
            dataDict={imagesInfoDict.FocalLengthIn35mmFormat} 
            backgroundColor={'rgb(247, 242, 107)'}
            name={'FocalLength in 35mm format'}
            />
            :
            <BarChart 
            Context={Context}
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


// page component
function AnalysisPage() {
  const [fileList, setFileList] = useState([]); // 用來存上傳的檔案
  const [imagesInfoDict, setImagesInfoDict] = useState({}); // 用來存分類好的 metadata
  const [section, setSection] = useState('dashboard'); // 用來切換頁面

  const arrowRef = useRef(null);
  const pictureCountRef = useRef(null);
  const barChartRef = useRef(null);

  const uploadRef = useRef(null);
  const dashboardRef = useRef(null);
  const switcherRef = useRef(null);
  

  const contextValue = {
    fileList, setFileList, 
    imagesInfoDict, setImagesInfoDict,
    pictureCountRef,
    barChartRef,
    uploadRef,
    dashboardRef,
    switcherRef,
  }

  useEffect(() => {
    // console.log(fileList);
    analyze(fileList, setImagesInfoDict, pictureCountRef);
  }, [fileList]);

  useEffect(() => {
    // console.log(imagesInfoDict);
  }, [imagesInfoDict]);


  // 讓 arrow 自動隨著頁面位置翻轉
  useEffect(() => {
    let windowHeight = window.innerHeight;
    let dashboardRect = null;
    let uploadRect = null;
    let scrollTimeout = null;

    // 當頁面載入時，取得 dashboard 和 upload 的位置
    const getBoundingClientRects = () => {
      dashboardRect = dashboardRef.current?.getBoundingClientRect();
      uploadRect = uploadRef.current?.getBoundingClientRect();
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
          setSection('upload');
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
  }, []);


  // if (fileList.length === 0) {
  //   dashboardRef.current?.classList.add('blur');
  // } else {
  //   dashboardRef.current?.classList.remove('blur');
  // }

  // 切換 section
  const handleSectionChange = (e) => {
    // console.log(section);
    scroller.scrollTo(section, {
      duration: 1000,
      delay: 50,
      smooth: 'easeInQuad',
    });

    if (section === 'upload') {
      setSection('dashboard');
      if (arrowRef.current) {
        arrowRef.current.classList.remove('arrow-up');
        arrowRef.current.classList.add('arrow-down');
      }
      return
    }

    if (section === 'dashboard') {
      setSection('upload');
      if (arrowRef.current) {
        arrowRef.current.classList.remove('arrow-down');
        arrowRef.current.classList.add('arrow-up');
      }
      return
    }
  }

  return (
    <Layout>
      <Context.Provider value={contextValue}>
        <div className="container-fluid">
            <section id="upload" ref={uploadRef} className='pageBlock upload'>
              <div className="squares-placer">
                <div>
                  <UploadRTOverview/>
                </div>
                <div>
                  <DragDrop />
                </div>
              </div>
              <div className='arrow fixed-bottom' data-bs-toggle="tooltip" data-bs-title="Default tooltip"
              onClick={handleSectionChange}>
                <div ref={arrowRef}>
                  <div>
                    <i className="bi bi-arrow-down-circle-fill"/>
                  </div>
                </div>
              </div>
            </section>
            <section id="dashboard" ref={dashboardRef} className='pageBlock dashboard' >
              {fileList.length === 0 && 
              <div className="blur-mask center-all">
                <h5 className='mb-0'> Hey, mind uploading the images? Then swing back here. Thanks! </h5>
              </div>}
              <Dashboard/>
              <Modal/>
            </section>
        </div>
      </Context.Provider>
    </Layout>
  )
}

export default AnalysisPage







{/* <section id="dashboard" ref={dashboardRef} className='' >
  <div id="carouselExample" className="carousel slide pageBlock dashboard">
    <div className="carousel-inner">
      <div className="carousel-item active">
          {fileList.length === 0 && 
        <div className="blur-mask center-all">
          <h5 className='mb-0'> Hey, mind uploading the images? Then swing back here. Thanks! </h5>
        </div>}
        <Dashboard/>
      </div>
      <div className="carousel-item">
        <h1>test</h1>
      </div>
    </div>
    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Previous</span>
    </button>
    <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
      <span className="carousel-control-next-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Next</span>
    </button>
  </div>
</section> */}


// Decoration component
function DecorationSquare() {
  return (
    <div className="decoration-square square-box center-all"/>
  );
}
