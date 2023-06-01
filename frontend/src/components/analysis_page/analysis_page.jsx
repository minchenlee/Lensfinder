import { useState, useEffect, createContext, useContext, useRef} from 'react'
import './analysis_page.css'
import Layout from '../layout/layout'

import { FileUploader } from "react-drag-drop-files";  // 拖拉檔案上傳的套件
const fileTypes = ["JPG", "JPEG", "HEIC"];

import { create as createExifParser } from 'exif-parser';  // 解析圖片 EXIF 的套件
import 'animate.css';  // 動畫套件

import moment from 'moment-timezone';  // 處理時間的套件

import { AllPageContext } from '../../App';  // 全域 analysisContext

// 滾動套件
import Scroll from 'react-scroll';
let scroller = Scroll.scroller;

// 儀表板
import Dashboard from './dashboard/dashboard';

// 推薦頁面
import RecommendationBlock from '../recommendation_block/recommendation_block';

// 彈出視窗
import Modal from '../modal/modal';

// Create a context
const analysisContext = createContext();
export { analysisContext };

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
  const { setFileList, pictureCountRef, setIsSaved } = useContext(analysisContext);

  async function handleChange(files) {
    // 解析多張圖片
    const isFailed = await ParseMultiplePicture(files, setFileList, pictureCountRef);
    if (isFailed) {
      alert('Please upload images that contain EXIF data.');
      return;
    }

    // 重置已經按過 save 按鈕的狀態
    setIsSaved(false);
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
  const { fileList, setFileList, pictureCountRef, setIsSaved } = useContext(analysisContext);

  async function handleChange(files) {
    // 解析多張圖片
    const isFailed = await ParseMultiplePicture(files, setFileList, pictureCountRef);
    if (isFailed) {
      alert('Please upload JPG or JPEG or HEIF files.');
      return;
    }

    // 重置已經按過 save 按鈕的狀態
    setIsSaved(false);
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
  let total = fileList.length;
  let Make = [];
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
    Make.push(file.Make);
    FocalLength.push(Math.round(file.FocalLength));
    FocalLengthIn35mmFormat.push(Math.round(file.FocalLengthIn35mmFormat));
    Aperture.push(file.ApertureValue.toFixed(1));
    ShutterSpeed.push(1/file.ExposureTime);
    ISO.push(file.ISO);
    CreateDate.push(file.CreateDate);
    LensModel.push(file.LensModel);
    Orientation.push(file.Orientation);
  }

  const currentTimestamp = Date.now(); // Current timestamp in UTC
  let localDateTime = new Date(currentTimestamp).toLocaleString('en-US', {
    timeZone: moment.tz.guess(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  localDateTime = moment(localDateTime, 'MM/DD/YYYY, hh:mm:ss A').format('YYYY-MM-DD HH:mm:ss');
  


  // 計算各個 list 中元素出現的次數
  let newImagesInfo = {
    total: total,
    Make: Array.from(new Set(Make)),
    AnalysisDate: localDateTime,
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


// page component
function AnalysisPage() {
  const [fileList, setFileList] = useState([]); // 用來存上傳的檔案
  const [imagesInfoDict, setImagesInfoDict] = useState({}); // 用來存分類好的 metadata
  const [hasData, setHasData] = useState(false); // 用來判斷是否有資料
  const [section, setSection] = useState('dashboard'); // 用來切換頁面
  const [isSaved, setIsSaved ] = useState(false); // 用來判斷是否按過 save 按鈕
  

  const arrowRef = useRef(null);
  const pictureCountRef = useRef(null);
  const barChartRef = useRef(null);

  const uploadRef = useRef(null);
  const { dashboardRef } = useContext(AllPageContext);
  const switcherRef = useRef(null);
  
  const saveButttonRef = useRef(null);

  const contextValue = {
    fileList, setFileList, 
    imagesInfoDict, setImagesInfoDict,
    hasData, setHasData,
    isSaved, setIsSaved,
    pictureCountRef,
    barChartRef,
    uploadRef,
    dashboardRef,
    switcherRef,
    saveButttonRef
  }

  useEffect(() => {
    // console.log(fileList);
    analyze(fileList, setImagesInfoDict, pictureCountRef);
    if (fileList.length !== 0){
      setHasData(true);
    }
  }, [fileList]);

  useEffect(() => {
    console.log(imagesInfoDict);
    // console.log(JSON.stringify(imagesInfoDict).length);
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
      <analysisContext.Provider value={contextValue}>
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
              <div id="carouselExampleControls" className="carousel slide" data-bs-ride="false">
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <Dashboard/>
                  </div>
                  <div className="carousel-item">
                    <RecommendationBlock/>
                  </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                </button>
              </div>
            </section>
            <Modal/>
        </div>
      </analysisContext.Provider>
    </Layout>
  )
}

export default AnalysisPage
