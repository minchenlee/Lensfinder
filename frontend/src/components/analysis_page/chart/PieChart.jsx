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
function PieChart( {Context, dataDict, name} ) {
  const { fileList } = useContext(Context);

  if (fileList.length === 0) {
    return (
      <div className="center-all">
        <div>
          <p className='mb-0'>No data</p>
        </div>
      </div>
    );
  }

  if (fileList.length === 0) {
    return (
      <div className="pie-chart square-box center-all">
        <div>
          <p className='mb-0'>No data</p>
        </div>
      </div>
    );
  }

  ChartJS.register(ArcElement, Tooltip, Legend, Colors);
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
        // backgroundColor: 
        //   [
        //     '#A7E68C',
        //     '#FFAC63',
        //     '#FEC3A6',
        //   ]
        // ,
        borderWidth: 1,
      },
    ],
  };

  return <Pie options={options} data={data} />;
}

export default PieChart;
