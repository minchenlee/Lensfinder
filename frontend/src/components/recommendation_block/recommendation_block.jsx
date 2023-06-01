import React, { useContext, useState, useEffect, useRef, createContext} from 'react';
import { AllPageContext } from '../../App.jsx';
import { analysisContext } from '../analysis_page/analysis_page.jsx';
import { profileContext } from '../profile_page/profile_page.jsx';
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
  if (window.location.pathname === '/analysis') {
    isAnalysisPage = true;
  }

  // 判斷是在 analysis page 還是 profile page
  let Context = profileContext;
  if (isAnalysisPage) {
    Context = analysisContext;
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

  function calculateDistance(maxFocalLength, lensinfo){
    // compute distance
    for (let i=0 ; i < Object.keys(lensinfo).length; i++){
      let lens_focalLength = parseInt(lensinfo[i].specification.focal_length);
      let distance = Math.abs(lens_focalLength - maxFocalLength);
      lensinfo[i]['distance'] = distance;
    }
    return lensinfo
  }

  // 計算推薦分數
  function calculateScore(lensinfo){
    for (let i=0 ; i < Object.keys(lensinfo).length; i++){
      let distance = lensinfo[i].distance;
      let distance_normalized_deno = 100;
      let price = lensinfo[i].price;
      let price_normalized_deno = 10000;

      let score = 1 - (distance / distance_normalized_deno) - (price / price_normalized_deno);
      lensinfo[i]['score'] = score;
    }
    // console.log(lensinfo);
    return lensinfo
  }



  // 找出推薦鏡頭
  async function recommendation_compute(){
    // console.log(imagesInfoDict);
    let maxLensModel = calculateLensModel();
    let maxFocalLength = calculateFocalLength();

    // 取得資料庫中的候選鏡頭清單
    let lensinfo = await get('lensInfo', '?mount=X');
    lensinfo = calculateDistance(maxFocalLength, lensinfo);
    lensinfo = calculateScore(lensinfo);
    lensinfo.sort(function(a, b){
      return b.score - a.score;
    });

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