// import Chart from 'chart.js/auto'
// import { Chart as ChartJS, 
//   ArcElement, 
//   Tooltip, 
//   Legend, 
//   Colors,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title
// } from 'chart.js';
// import { Pie, Bar } from 'react-chartjs-2';
// import snapshot_circle from './MultiSerisPie.css'

// // 時間套件
// import moment from 'moment-timezone'

// // 滾動套件
// import Scroll from 'react-scroll';
// let scroller = Scroll.scroller;


// function MultiSerisPie({id, imageInfoDict, imagesInfoList, setImagesInfoDict, setHasData, section, setSection}){
//   ChartJS.register(ArcElement, Tooltip, Legend);
//   ChartJS.defaults.font.size = 14;

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         display: false,
//         tooltip: {
//           callbacks: {
//             label: function(context) {
//               const labelIndex = (context.datasetIndex * 2) + context.dataIndex;
//               return context.chart.data.labels[labelIndex] + ': ' + context.formattedValue;
//             }
//           }
//         }
//       },
//     },
//   };

//   const total = imageInfoDict.analysis_result.total;
//   const ShutterSpeed = Object.values(imageInfoDict.analysis_result.ShutterSpeed);
//   const maxShutterSpeed = Math.max(...ShutterSpeed);
//   const maxShutterSpeedKey = Object.keys(ShutterSpeed).reduce((a, b) => ShutterSpeed[a] > ShutterSpeed[b] ? a : b);
  
//   const Aperture = Object.values(imageInfoDict.analysis_result.Aperture);
//   const maxAperture = Math.max(...Aperture);

//   const FocalLength = Object.values(imageInfoDict.analysis_result.FocalLength);
//   const maxFocalLength = Math.max(...FocalLength);

//   const data = {
//     labels: ['', '', 'Aperture', '', 'Shutter Speed', '', 'Focal length', ''],
//     datasets: [
//       {
//         backgroundColor: ['rgba(174, 192, 114, 1)', 'rgba(174, 192, 114, 0.4)'],
//         data: [maxShutterSpeed, total-maxShutterSpeed],
//       },
//       {
//         backgroundColor: ['rgba(255, 206, 86, 1)', 'rgba(255, 206, 86, 0.4)'],
//         data: [maxAperture, total-maxAperture],
//       },
//       {
//         backgroundColor: ['rgba(255, 68, 85, 1)', 'rgba(255, 68, 85, 0.4)'],
//         data: [maxFocalLength, total-maxFocalLength],
//       },
//       {
//         backgroundColor: ['rgba(255, 68, 85, 0)'],
//         data: [],
//       },
//     ],
//   };

//   const timeStamp = imageInfoDict.create_date
//   let date = new Date(timeStamp).toLocaleString('en-Us');
//   date = moment(date, 'M/D/YYYY, h:mm:ss A');
//   date = date.format('YYYY/M/D H:mm');

//   function handleClick() {
//     // alert('You clicked me!'+ id);
//     setImagesInfoDict(imagesInfoList[id].analysis_result);
//     setHasData(true);

//     scroller.scrollTo('dashboard', {
//       duration: 1000,
//       delay: 50,
//       smooth: 'easeInQuad',
//     });
//   }

//   return (
//     <div className='snapcircle-box' >
//       <a onClick={handleClick}>
//         <Pie options={options} data={data}/>
//         <p className='mt-3 mb-0'>{date}</p>
//       </a>
//     </div>
//   );
// }

// export default MultiSerisPie