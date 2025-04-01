import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { FaMale, FaFemale } from "react-icons/fa";
import styles from './NumberPeopleSex.module.css';
import Title3 from './Title3';

const NumberPeopleSex = ({ jsonDataPath, title }) => {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState(null);
  const chartRef = useRef(null);
  const [filterOptions, setFilterOptions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(jsonDataPath);
        const jsonData = await response.json();
        setData(jsonData);
        setFilteredData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const filterFiles = [
      'id_sede_cread', 'id_dpto', 'id_pais', 'id_metodologia',
      'id_formacion', 'id_nivel', 'id_facultad', 'id_programa',
      'id_zona', 'id_estrato', 'id_edad'
    ];
    filterFiles.forEach(file => {
      import(`../data/id/${file}.json`)
        .then(module => {
          const fileData = module.default;
          setFilterOptions(prev => ({ ...prev, [file]: fileData }));
        })
        .catch(error => console.error(`Error loading filter data for ${file}:`, error));
    });
  }, [jsonDataPath]);

  // Inicialmente dejamos todos los filtros sin selección (array vacío)
  useEffect(() => {
    if (filterOptions && Object.keys(filterOptions).length > 0) {
      const newFilters = {};
      Object.keys(filterOptions).forEach(key => {
        if (key !== 'id_genero') {
          newFilters[key] = [];
        }
      });
      setFilters(newFilters);
    }
  }, [filterOptions]);

  const applyFilters = useCallback(() => {
    if (!data) return;
    let filtered = data;
    Object.entries(filters).forEach(([filterKey, filterValues]) => {
      if (filterValues.length > 0) {
        filtered = filtered.filter(item => filterValues.includes(item[filterKey]));
      }
    });
    setFilteredData(filtered);
  }, [data, filters]);

  useEffect(() => {
    if (data) {
      applyFilters();
    }
  }, [filters, data, applyFilters]);

  const clearFilters = () => {
    const newFilters = {};
    Object.keys(filterOptions).forEach(key => {
      if (key !== 'id_genero') {
        newFilters[key] = [];
      }
    });
    setFilters(newFilters);
    setFilteredData(data);
  };

  const prepareChartData = useCallback(() => {
    if (!filteredData) return null;

    const genderData = filteredData.reduce((acc, item) => {
      acc[item.genero] = (acc[item.genero] || 0) + 1;
      return acc;
    }, { M: 0, F: 0 });

    const total = genderData.M + genderData.F;
    const malePercentage = total > 0 ? ((genderData.M / total) * 100).toFixed(2) : 0;
    const femalePercentage = total > 0 ? ((genderData.F / total) * 100).toFixed(2) : 0;

    return {
      labels: ['Hombres', 'Mujeres'],
      series: [malePercentage, femalePercentage],
      counts: [genderData.M, genderData.F],
      total: total
    };
  }, [filteredData]);

  const renderChart = useCallback((chartData) => {
    const svg = d3.select(chartRef.current);
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    svg.selectAll('*').remove();

    // Centrar el gráfico
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(['#507DAF', '#FF6384']);
    const pie = d3.pie().value(d => d);
    // Generar datos para el pie y asociar count y label
    const dataReady = pie(chartData.series).map((d, i) => {
      d.count = chartData.counts[i];
      d.label = chartData.labels[i];
      return d;
    });
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

    g.selectAll('path')
      .data(dataReady)
      .enter().append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .on('mouseover', function(event, d) {
        let tooltip = d3.select('#tooltip');
        if (tooltip.empty()) {
          tooltip = d3.select('body').append('div')
            .attr('id', 'tooltip')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', '1px solid #ccc')
            .style('border-radius', '5px')
            .style('padding', '10px')
            .style('pointer-events', 'none');
        }
        tooltip.style('opacity', 1)
          .html(`<strong>${d.label}</strong>: ${d.count} personas`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select('#tooltip').style('opacity', 0);
      });

    g.selectAll('text')
      .data(dataReady)
      .enter().append('text')
      .text(d => `${d.data}%`)
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .style('text-anchor', 'middle')
      .style('font-size', '16px');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 20)
      .style('font-size', '24px')
      .style('fill', '#333')
      .text(chartData.total);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 45)
      .style('font-size', '16px')
      .style('fill', '#666')
      .text('Personas');
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      d3.select(chartRef.current).selectAll('*').remove();
      const chartData = prepareChartData();
      if (chartData) {
        renderChart(chartData);
      }
    }
  }, [filteredData, prepareChartData, renderChart]);

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => {
      const filterValues = prev[filterKey] || [];
      return filterValues.includes(value)
        ? { ...prev, [filterKey]: filterValues.filter(v => v !== value) }
        : { ...prev, [filterKey]: [...filterValues, value] };
    });
  };

  // Mostrar todos los filtros disponibles, excepto 'id_genero'
  const filtrosVisibles = Object.entries(filterOptions)
    .filter(([filterKey]) => filterKey !== 'id_genero')
    .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

  const formatFilterLabel = (filterKey) => {
    return filterKey.startsWith('id_') ? filterKey.substring(3) : filterKey;
  };

  return (
    <div className={styles.container}>
      <Title3>{title}</Title3>
      <div className={styles.filters}>
        {Object.entries(filtrosVisibles).map(([filterKey, options]) => (
          <div key={filterKey} className={styles.filter}>
            <h3>{formatFilterLabel(filterKey)}</h3>
            <div className={styles.filterItems}>
              {options.map(option => (
                <label key={option.id}>
                  <input
                    type="checkbox"
                    value={option.id}
                    checked={filters[filterKey]?.includes(option.id) || false}
                    onChange={() => handleFilterChange(filterKey, option.id)}
                  />
                  {option.nombre || option.id}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className={styles.buttonContainer}>
            <button onClick={applyFilters}>Filtrar</button>
            <button onClick={clearFilters}>Limpiar</button>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <FaFemale className={styles.icon} style={{ color: "#FF6384" }} size={40} />
            Mujeres
          </div>
          <div className={styles.legendItem}>
            <FaMale className={styles.icon} style={{ color: "#507DAF" }} size={40} />
            Hombres
          </div>
        </div>
        <svg ref={chartRef} width="300" height="300"></svg>
      </div>
    </div>
  );
};

export default NumberPeopleSex;


