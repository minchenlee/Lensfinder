import { useContext } from 'react'

import { Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  Colors,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Pie Chart component
function PieChart( {dataDict, name} ) {
  if (dataDict === undefined || Object.keys(dataDict).length === 0) {
    return (
      <div className="center-all">
        <div>
          <p className='mb-0'>No data</p>
        </div>
      </div>
    );
  }

  ChartJS.register(ArcElement, Tooltip, Legend);
  ChartJS.defaults.font.size = 14;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' ,
        display: false,
      },
      title: {
        display: true,
        text: name,
        position: 'bottom',
        // font: {
        //   size: 23
        // }
      },
      colors: {
        forceOverride: true,
        enabled: true
      },
    }
  };

  const data = {
    labels: Object.keys(dataDict),
    datasets: [
      {
        label: 'Count',
        data: Object.values(dataDict),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Pie options={options} data={data} />;
}

export default PieChart;
