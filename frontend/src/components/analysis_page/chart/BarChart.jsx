import { useContext } from 'react'

// Chart.js and react-chartjs-2
import { Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// BarChart
function BarChart( {dataDict, backgroundColor, name} ) {
  if (dataDict === undefined || Object.keys(dataDict).length === 0) {
    return (
      <div className="center-all">
        <div>
          <p className='mb-0'>No data</p>
        </div>
      </div>
    );
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
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
      },
    }
  };

  const labels = Object.keys(dataDict);
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Count',
        data: Object.values(dataDict),
        backgroundColor: backgroundColor,
      },
    ]
  };

  return <Bar options={options} data={data} className=''/>;
}

export default BarChart;