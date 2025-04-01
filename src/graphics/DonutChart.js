import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { defaultColors, getChartOptions } from './chartConfig';

const DonutChart = ({ data, labels, title }) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: defaultColors,
        hoverBackgroundColor: defaultColors.map((color) => `${color}AA`), // Añade transparencia al hover
      },
    ],
  };

  const options = getChartOptions(title);

  return (
    <div style={{ height: '300px', width: '300px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DonutChart;


