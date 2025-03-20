import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const GaugeCharts = () => {
  const data = {
    datasets: [{
      data: [745, 400, 8745],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
    }],
    labels: ['Estudiantes Primera Generación', 'Proyectos ODS', 'Estudiantes Servicios de Salud']
  };

  return (
    <div>
      <Doughnut data={data} />
      <p>+745 estudiantes primera generación estudio superior</p>
      <p>+400 proyectos de ODS</p>
      <p>+8745 estudiantes acceden a servicios de salud</p>
    </div>
  );
};

export default GaugeCharts;
