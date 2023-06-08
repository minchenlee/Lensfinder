import React, { useContext, useState, useEffect, useRef, createContext} from 'react';
import { AllPageContext } from '../../App.jsx';
import { analysisContext } from '../analysis_page/analysis_page.jsx';
import { profileContext } from '../profile_page/profile_page.jsx';
import { demoContext } from '../demo_page/demo_page.jsx';
import './recommendation_block.css';
import { get } from '../../api'// API


function RecommendationBlock(){
  const [sortType, setSortType] = useState('Best Match');
  const [currency, setCurrency] = useState('USD');  // default currency
  const [avaliableCurrency, setAvaliableCurrency] = useState([]); // currency list
  const [currencyRateList, setcurrencyRateList] = useState({}); // currency rate dict
  const [lensInfoList, setlensInfoList] = useState([]);
  const [alreayRecommended, setAlreayRecommended] = useState(false);

  const getRecBtnRef = useRef(null);

  const BlockContext = createContext();
  const contextValue = {
    currency, setCurrency,
    avaliableCurrency, setAvaliableCurrency,
    currencyRateList, setcurrencyRateList,
  }

  let isAnalysisPage = false;
  let Context = profileContext;
   // 判斷是在 analysis page 還是 profile page
  if (window.location.pathname === '/analysis') {
    isAnalysisPage = true;
    Context = analysisContext;
  }

  if (window.location.pathname === '/demo') {
    Context = demoContext;
  }

  const { 
    fileList, hasData,
    imagesInfoDict, barChartRef, 
    switcherRef, saveButttonRef
  } = useContext(Context);


  // 計算最常使用的鏡頭
  function calculateLensModel() {
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
  function calculateFocalLength() {
    if (hasData) {
      let focalLength = Object.keys(imagesInfoDict.FocalLength);
      let focalLengthCount = Object.values(imagesInfoDict.FocalLength);
      let maxCount = Math.max(...focalLengthCount);
      let maxFocalLength = focalLength[focalLengthCount.indexOf(maxCount)];
      return maxFocalLength;
    }
  }


  // 計算第二常使用的焦距
  function calculateSecondFocalLength() {
    if (hasData) {
      // find the most frequent focal length
      let focalLength = Object.keys(imagesInfoDict.FocalLength);
      let focalLengthCount = Object.values(imagesInfoDict.FocalLength);
      let maxCount = Math.max(...focalLengthCount);

      // remove the most frequent focal length
      let secondFocalLength = focalLength.filter((item) => {
        return imagesInfoDict.FocalLength[item] !== maxCount;
      });
      let secondFocalLengthCount = secondFocalLength.map((item) => {
        return imagesInfoDict.FocalLength[item];
      });
      
      let secondMaxCount = Math.max(...secondFocalLengthCount);
      let secondMaxFocalLength = secondFocalLength[secondFocalLengthCount.indexOf(secondMaxCount)];


      return secondMaxFocalLength;
    }
  }

  // 計算推薦鏡頭
  function calculateDistanceByMaxFocal(maxFocalLength, lensinfo){
    // compute distance
    for (let i=0 ; i < Object.keys(lensinfo).length; i++){
      let lens_focalLength = parseInt(lensinfo[i].specification.focal_length);
      let distance = Math.abs(lens_focalLength - maxFocalLength);
      lensinfo[i]['distance'] = distance;
    }
    return lensinfo
  }


  // 計算第二推薦鏡頭
  function calculateDistanceBySecondMaxFocal(secondMaxFocalLength, lensinfo){
    if (secondMaxFocalLength === undefined){
      return lensinfo
    }

    // compute distance
    for (let i=0 ; i < Object.keys(lensinfo).length; i++){
      let lens_focalLength = parseInt(lensinfo[i].specification.focal_length);
      let distance = Math.abs(lens_focalLength - secondMaxFocalLength);
      lensinfo[i]['secondDistance'] = distance;
    }
    return lensinfo
  }

  // 考慮所有焦距的距離
  function calculateDistanceByAllFocal(lensinfo){
    // compute distance
    for (let i=0 ; i < Object.keys(lensinfo).length; i++){
      let lens_focalLength = parseInt(lensinfo[i].specification.focal_length);
      let distance = 0;

      for (let j=0 ; j < Object.keys(imagesInfoDict.FocalLength).length; j++){
        let focalLength = parseInt(Object.keys(imagesInfoDict.FocalLength)[j]);
        let weight = focalLength/imagesInfoDict.total;
        distance += weight * Math.abs(lens_focalLength - focalLength);
      }
      lensinfo[i]['distance'] = distance;
    }
    return lensinfo
  }



  // 計算推薦分數
  function calculateScore(lensinfo, maxFocalLength, secondMaxFocalLength){
    for (let i=0 ; i < Object.keys(lensinfo).length; i++){
      let distance = lensinfo[i].distance;
      let distanceNormalizedDeno = 100;
      let first = (distance / distanceNormalizedDeno);
      
      let secondDistance = lensinfo[i].secondDistance;
      let seconddistanceNormalizedDeno = 100;
      let second = (secondDistance / seconddistanceNormalizedDeno);

      let price = lensinfo[i].price;
      let priceNormalizedDeno = 5000;
      let third = (price / priceNormalizedDeno);


      // 計算兩個常用焦段的差距數量
      let maxFocallengthNum = parseInt(imagesInfoDict.FocalLength[maxFocalLength]);
      let secondMaxFocallengthNum = parseInt(imagesInfoDict.FocalLength[secondMaxFocalLength]);
      
      // 如果差太多，就不考慮第二常用焦段
      // console.log((maxFocallengthNum - secondMaxFocallengthNum)/maxFocallengthNum);
      if ((maxFocallengthNum - secondMaxFocallengthNum)/maxFocallengthNum > 0.8){
        second = 0;
        secondDistance = undefined;
      }

      // two distance's distance
      // 用來懲罰在兩個焦距中間的鏡頭
      let penalty = 0;
      // if (secondDistance !== undefined){
      //   penalty = 1 - Math.abs(distance - secondDistance)/50;
      // }

      console.log(first, second, third, penalty);

      // let score
      // if (secondDistance === undefined){
      //   score = 1 - (first + third);
      // } else {
      //   score = 1 - (first + second*0.9 + third + penalty);
      // }

      let score = 1 - (first + third);
      lensinfo[i]['score'] = score;
    }
    // console.log(lensinfo);
    return lensinfo
  }



  // 找出推薦鏡頭
  async function recommendation_compute(){
    // console.log(imagesInfoDict);
    // let maxLensModel = calculateLensModel();
    let maxFocalLength = calculateFocalLength();
    let secondMaxFocalLength = calculateSecondFocalLength();

    // 取得資料庫中的候選鏡頭清單
    let lensinfo = await get('lensInfo', '?mount=X');
    lensinfo = calculateDistanceByMaxFocal(maxFocalLength, lensinfo);
    lensinfo = calculateDistanceBySecondMaxFocal(secondMaxFocalLength, lensinfo);
    // lensinfo = calculateDistanceByAllFocal(lensinfo);

    lensinfo = calculateScore(lensinfo, maxFocalLength, secondMaxFocalLength);
    lensinfo.sort(function(a, b){
      return b.score - a.score;
    });

    // print 出 lensinfo 的 score
    for (let i=0 ; i < Object.keys(lensinfo).length; i++){
      console.log(lensinfo[i].name, lensinfo[i].score);
    }

    setlensInfoList(lensinfo);
    setAlreayRecommended(true);
  }



  // 如果是在 profile page，每當 imagesInfoDict 改變時，重新計算推薦鏡頭。
  useEffect(() => {
    if (window.location.pathname === '/profile') {
      recommendation_compute();
    }
  }, [imagesInfoDict]);


  // 取得所有支援的貨幣代號和匯率
  useEffect(() => {
    async function getCurrency(){
      let avaliableCurrency = await get('exchangeRate/avaliableCurrency', '');
      setAvaliableCurrency(avaliableCurrency);
    }

    async function getCurrencyRate(){
      let currencyRate = await get('exchangeRate', '');
      // console.log(currencyRate);
      setcurrencyRateList(currencyRate);
    }

    getCurrency();
    getCurrencyRate();
  }, []);


  // 當 sortType 改變時，重新排序推薦鏡頭。
  function onChangeSortType(e){
    setSortType(e.target.text);

    // 按價格排序
    let lensinfo = lensInfoList;
    if (e.target.text === 'Price') {
      lensinfo.sort(function(a, b){
        return a.price - b.price;
      });
    }

    // 按焦距排序
    if (e.target.text === 'Focal length') {
      lensinfo.sort(function(a, b){
        return a.distance - b.distance;
      });
    }

    // 按推薦分數排序
    if (e.target.text === 'Best Match') {
      lensinfo.sort(function(a, b){
        return b.score - a.score;
      });
    }

    // console.log(lensinfo);
    setlensInfoList(lensinfo);
  }


  function onChangeCurrency(e){
    setCurrency(e.target.text)
  }

  function RecommendationCard(lens, key){
    const { currency, currencyRateList } = useContext(BlockContext);
    lens = lens.lens

    let currencyRate = 1;
    for (let i=0; i < currencyRateList.length; i++){
      if (currencyRateList[i].currency_code === currency){
        currencyRate = currencyRateList[i].exchange_rate;
        break;
      }
    }
  
    return(
      <div className="recommendation-card" key={key}>
        <a href={lens.url} target="_blank" className='position-relative'>
          <img src={lens.image} className="card-image" alt={lens.name}/>
          <div className="w-100 lens-text">
            <p className='mb-0'>{lens.name}</p>
            {
              lens.price === 100000000 ? <p className="w-100 lens-price">No data</p>
              : <p className="w-100 lens-price">${(lens.price * currencyRate).toFixed(0)}</p>
            }
          </div>
        </a>
      </div>
    )
  }


  return(
    <BlockContext.Provider value={contextValue}>
      <div className="container-fluid">
        <div className="recommendation-container">
          { !alreayRecommended &&
            <div className='recommendation-button-placer'>
                <button className='recommendation-button' onClick={recommendation_compute} ref={getRecBtnRef}> 
                Get lens recommendation
                </button>
            </div>
          }

          { alreayRecommended &&
          <div className='recommendation-block'>
            <h3 className='mb-4' >Recommend Lenses</h3>
            <div className='sort-selector'>
              <div className='selector-group'>
                <div className="dropdown-left">
                  <button className="sort-button btn btn-outline-light w-100 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Sort by
                  </button>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" onClick={onChangeSortType}>Best Match</a></li>
                    <li><a className="dropdown-item" onClick={onChangeSortType}>Focal length</a></li>
                    <li><a className="dropdown-item" onClick={onChangeSortType}>Price</a></li>
                  </ul>
                </div>
                <div className='sort-type ps-3'>
                  <p className='mb-0'>{sortType}</p>
                </div>
              </div>

              <div className='selector-group'>
                <div className='sort-type'>
                    <p className='mb-0'>{currency}</p>
                  </div>
                <div className="dropdown-center ps-3">
                  <button className="sort-button btn btn-outline-light w-100 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    currency
                  </button>
                  <ul className="dropdown-menu currency-menu">
                    {avaliableCurrency.map((currencyCode, index) => {
                      return(
                        <li key={index}>
                          <a className="dropdown-item" onClick={onChangeCurrency}>{currencyCode}</a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
            <div className='recommendation-list'>
              {lensInfoList.map((lens, index) => {
                return(
                  <RecommendationCard lens={lens} key={index}/>
                )})
              }
            </div>
          </div>
          }
        </div>
      </div>
    </BlockContext.Provider>
  )
}

export default RecommendationBlock;