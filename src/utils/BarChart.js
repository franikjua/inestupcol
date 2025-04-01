import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './BarChart.css';

const BarChart = ({ data, xKey, yKeys, colors }) => {
  const chartRef = useRef();

  useEffect(() => {
    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d[xKey]))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => yKeys.reduce((acc, key) => acc + (d[key] || 0), 0))])
      .nice()
      .range([chartHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g').call(d3.axisLeft(yScale));

    const stack = d3.stack().keys(yKeys);
    const series = stack(data);

    g.selectAll('.layer')
      .data(series)
      .enter()
      .append('g')
      .attr('fill', (_, i) => colors[i])
      .selectAll('rect')
      .data((d) => d)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.data[xKey]))
      .attr('y', (d) => yScale(d[1]))
      .attr('height', (d) => yScale(d[0]) - yScale(d[1]))
      .attr('width', xScale.bandwidth());
  }, [data, xKey, yKeys, colors]);

  return <svg ref={chartRef}></svg>;
};

export default BarChart;



