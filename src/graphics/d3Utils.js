import * as d3 from 'd3';


// Configura escalas para gráficos de barras apiladas
export const createScales = (data, width, height, margin, keys) => {
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.campus)) // Asume que el campo 'campus' es el eje X
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d3.sum(keys, (key) => d[key]))])
    .nice()
    .range([height - margin.bottom, margin.top]);

  return { x, y };
};

// Genera una escala de colores
export const getColorScale = (keys) =>
  d3.scaleOrdinal()
    .domain(keys)
    .range(['#6baed6', '#fd8d3c', '#74c476']);
