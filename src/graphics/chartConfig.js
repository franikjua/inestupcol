// Configuración común para gráficos de Chart.js
export const defaultColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

export const getChartOptions = (title) => ({
  plugins: {
    title: {
      display: true,
      text: title,
    },
    legend: {
      position: 'top',
    },
  },
  responsive: true,
  maintainAspectRatio: false,
});
