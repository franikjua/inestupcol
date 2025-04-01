import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
import * as d3 from 'd3';

import { createScales, getColorScale } from './d3Utils';

const StackedBarChart = ({ data, labels, keys }) => {
  const chartRef = useRef();

  useEffect(() => {
    const svg = d3.select(chartRef.current);
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    // Clear previous SVG
    svg.selectAll('*').remove();

    // Generate scales and colors
    const { x, y } = createScales(data, width, height, margin, keys);
    const color = getColorScale(keys);

    // Prepare stack data
    const stack = d3.stack().keys(keys)(data);

    // Render bars
    svg
      .append('g')
      .selectAll('g')
      .data(stack)
      .join('g')
      .attr('fill', ({ key }) => color(key))
      .selectAll('rect')
      .data((d) => d)
      .join('rect')
      .attr('x', (d) => x(d.data.campus))
      .attr('y', (d) => y(d[1]))
      .attr('height', (d) => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth());

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y));
  }, [data, labels, keys]);

  return <svg ref={chartRef} width={500} height={300}></svg>;
};

export default StackedBarChart;
