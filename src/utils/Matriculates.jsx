import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FaMale, FaFemale } from 'react-icons/fa';
import styles from './Matriculates.module.css';

const Matriculates = ({ jsonData }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const transformedData = jsonData.matriculados.map((item) => ({
      ...item,
      id_sede_cread: getName(item.id_sede_cread, jsonData.id_sede_cread, 'id_sede_cread', 'sede_cread'),
      id_dpto: getName(item.id_dpto, jsonData.id_dpto, 'id_dpto', 'dpto'),
      id_pais: getName(item.id_pais, jsonData.id_pais, 'id_pais', 'pais'),
      id_metodologia: getName(item.id_metodologia, jsonData.id_metodologia, 'id_metodologia', 'metodologia'),
      id_formacion: getName(item.id_formacion, jsonData.id_formacion, 'id_formacion', 'formacion'),
      id_nivel: getName(item.id_nivel, jsonData.id_nivel, 'id_nivel', 'nivel'),
      id_facultad: getName(item.id_facultad, jsonData.id_facultad, 'id_facultad', 'FACULTAD'),
      snies: getName(item.snies, jsonData.snies, 'snies', 'programa'),
      id_zona: getName(item.id_zona, jsonData.id_zona, 'id_zona', 'zona'),
    }));
    setFilteredData(transformedData);
  }, [jsonData]);

  const getName = (id, list, keyId, keyName) => {
    const item = list.find((el) => el[keyId] === id);
    return item ? item[keyName] : 'Sin Información';
  };

  useEffect(() => {
    drawChart();
  }, [filteredData]);

  const drawChart = () => {
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const genderData = d3.rollup(filteredData, v => v.length, d => d.genero);
    const pieData = Array.from(genderData, ([key, value]) => ({ label: key, value }));

    const color = d3.scaleOrdinal().domain(['M', 'F']).range(['#507DAF', '#F4A261']);
    const pie = d3.pie().value(d => d.value).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);

    const arcs = svg.selectAll('arc').data(pie(pieData)).enter().append('g');
    const tooltip = d3.select(tooltipRef.current);

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .on('mouseover', (event, d) => {
        tooltip.style('opacity', 1).html(`${d.data.label}: ${d.data.value} personas`);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${event.pageX}px`).style('top', `${event.pageY - 40}px`);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    svg.append('text')
      .attr('class', styles.mtctDonutTotalText)
      .attr('text-anchor', 'middle')
      .attr('dy', '-1rem')
      .text(d3.sum(pieData, d => d.value));

    svg.append('text')
      .attr('class', styles.mtctDonutLabelText)
      .attr('text-anchor', 'middle')
      .attr('dy', '1rem')
      .text('Personas');
  };

  const handleFilterChange = (key, values) => {
    setFilters({ ...filters, [key]: values });
  };

  const applyFilters = () => {
    let filtered = jsonData.matriculados.filter((item) => {
      return Object.entries(filters).every(([key, values]) =>
        values.length === 0 || values.includes(getName(item[key], jsonData[key], key, key))
      );
    });
    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setFilters({});
    setFilteredData(jsonData.matriculados);
  };

  const categories = ['id_sede_cread', 'id_dpto', 'id_pais', 'id_metodologia', 'id_formacion', 'id_nivel', 'id_facultad', 'snies', 'id_zona'];

  return (
    <div className={styles.mtctContainer}>
      <h3>Distribución de Género</h3>
      {categories.map(category => (
        <div key={category} className={styles.mtctFilterContainer}>
          <label>{category}</label>
          <select multiple onChange={(e) => handleFilterChange(category, Array.from(e.target.selectedOptions, option => option.value))}>
            {Array.from(new Set(filteredData.map(d => d[category]))).map((value, index) => (
              <option key={index} value={value}>{value}</option>
            ))}
          </select>
        </div>
      ))}
      <button onClick={applyFilters} className={styles.mtctApplyButton}>Aplicar Filtros</button>
      <button onClick={clearFilters} className={styles.mtctClearButton}>Limpiar</button>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef} className={styles.mtctTooltip}></div>
    </div>
  );
};

export default Matriculates;

