import {useEffect} from 'react'

// 時間套件
import moment from 'moment-timezone'

// 滾動套件
import Scroll from 'react-scroll';
let scroller = Scroll.scroller;

import './snapshot.css'

import { del } from '../../../api'



function Snapshot({
  id, imageInfoDict, imagesInfoList, 
  setImagesInfoDict, setdeleteSnapshot}){
  // console.log(imageInfoDict)
  let analysis_result = imageInfoDict.analysis_result;
  // console.log(analysis_result)

  // 計算照片拍攝的橫跨日期
  function CalculateDate() {
    let startTimestamp = 0;
    let endTimestamp = 0;
    let startDate = 'None';
    let endDate = 'None';

    startTimestamp = Math.min(...analysis_result.CreateDate);
    endTimestamp = Math.max(...analysis_result.CreateDate);

    startDate = new Date(startTimestamp * 1000).toLocaleDateString();
    endDate = new Date(endTimestamp * 1000).toLocaleDateString();
    return [startDate, endDate];
  }

  // 計算最常使用的焦距
  function CalculateFocalLength() {
    let focalLength = Object.keys(analysis_result.FocalLength);
    let focalLengthCount = Object.values(analysis_result.FocalLength);
    let maxCount = Math.max(...focalLengthCount);
    let maxFocalLength = focalLength[focalLengthCount.indexOf(maxCount)];
    return maxFocalLength;
  }


  function Calculate35FocalLength(){
    let focalLength35 = Object.keys(analysis_result.FocalLengthIn35mmFormat);
    let focalLengthCount35 = Object.values(analysis_result.FocalLengthIn35mmFormat);
    let maxCount = Math.max(...focalLengthCount35);
    let maxFocalLength35 = focalLength35[focalLengthCount35.indexOf(maxCount)];
    return maxFocalLength35;
  }

  let snapshotName = imageInfoDict.snapshot_name;
  let total = analysis_result.total;
  let [startDate, endDate] = CalculateDate()
  let maxFocalLength = CalculateFocalLength();
  let maxFocalLength35 = Calculate35FocalLength();

  // 判斷 startDate 和 endDate 是否為同一天
  let sameDate = false;
  if (startDate === endDate) {
    sameDate = true;
  }
  
  // 創建日期解析
  const timeStamp = imageInfoDict.create_date
  let date = new Date(timeStamp).toLocaleString('en-Us');
  date = moment(date, 'M/D/YYYY, h:mm:ss A');
  date = date.format('YYYY/M/D H:mm');


  function handleClick() {
    // alert('You clicked me!'+ id);
    setImagesInfoDict(imagesInfoList[id].analysis_result);

    scroller.scrollTo('dashboard', {
      duration: 500,
      smooth: 'easeInQuad',
    });
  }

  async function handleDelete(){
    // console.log('delete');
    // console.log(imagesInfoList[id].id);
    setdeleteSnapshot(imagesInfoList[id]);
  }

  useEffect(() => {
    // console.log(imageInfoDict)
  }, [imageInfoDict])


  return (
    <div className='snapcard-box' >    
      <div className='snapcard glass-light' onClick={handleClick}>
        <h5 className='mb-1 snapshot-name'> {snapshotName} </h5>
        <h5 className=' mb-3 snapshot-photo-num'>{total} Photos</h5>
        <p className=' mb-0'>Most used: {maxFocalLength}mm({maxFocalLength35}mm)</p>
        {
          sameDate ? <p className='mb-0'>{startDate}</p> : <p className='mb-0'>{startDate}~{endDate}</p>
        }
      </div>
      <i className="bi bi-trash2 snapshot-delete-button" onClick={handleDelete} data-bs-target="#deleteConfirmModal" data-bs-toggle="modal"></i>
    </div>

  );
}

export default Snapshot