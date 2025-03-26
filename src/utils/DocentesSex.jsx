import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { FaMale, FaFemale } from 'react-icons/fa';
import styles from './DocentesSex.module.css';
import Title3 from './Title3';
import escolaridadData from '../data/rh/escolaridad.json';

const DocentesSex = ({ jsonDataPath, title }) => {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({});
  const chartRef = useRef(null);

  // Generar mapeo de escolaridad: id -> nombre
  const escolaridadMap = useMemo(() => {
    return escolaridadData.reduce((acc, curr) => {
      acc[curr.id] = curr.nombre;
      return acc;
    }, {});
  }, []);

  // Cargar datos principales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(jsonDataPath);
        const jsonData = await response.json();
        setData(jsonData);
        setFilteredData(jsonData);
      } catch (error) {
        console.error('Error fetching docentes data:', error);
      }
    };

    fetchData();

    // Cargar archivos de filtros: cargo, unidad, centro
    const filterFiles = ['cargo', 'unidad', 'centro'];
    filterFiles.forEach(file => {
      import(`../data/rh/${file}.json`)
        .then(module => {
          const fileData = module.default;
          setFilterOptions(prev => ({ ...prev, [file]: fileData }));
        })
        .catch(error => console.error(`Error loading filter data for ${file}:`, error));
    });
  }, [jsonDataPath]);

  // Inicializar filtros sin selección
  useEffect(() => {
    if (filterOptions && Object.keys(filterOptions).length > 0) {
      const newFilters = {};
      Object.keys(filterOptions).forEach(key => {
        newFilters[key] = [];
      });
      setFilters(newFilters);
    }
  }, [filterOptions]);

  // Aplicar filtros cuando se presiona "Filtrar"
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

  // Limpiar filtros y restaurar datos originales
  const clearFilters = () => {
    const newFilters = {};
    Object.keys(filterOptions).forEach(key => {
      newFilters[key] = [];
    });
    setFilters(newFilters);
    setFilteredData(data);
  };

  // Preparar datos para el gráfico de dona
  const prepareChartData = useCallback(() => {
    if (!filteredData) return null;
    const genderData = filteredData.reduce((acc, item) => {
      acc[item.sexo] = (acc[item.sexo] || 0) + 1;
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

  // Refactor: getEscolaridadTable ahora recibe los datos como argumento
  const getEscolaridadTable = useCallback((sexo, data) => {
    const docentesBySex = data.filter(item => item.sexo === sexo);
    const escolaridadCounts = docentesBySex.reduce((acc, item) => {
      acc[item.escolaridad] = (acc[item.escolaridad] || 0) + 1;
      return acc;
    }, {});
    let tableHtml = '<table style="border-collapse: collapse; width: 100%;">';
    tableHtml += '<tr><th style="border: 1px solid #ccc; padding: 4px;">Escolaridad</th><th style="border: 1px solid #ccc; padding: 4px;">Número de docentes</th></tr>';
    Object.entries(escolaridadCounts).forEach(([id, count]) => {
      const nombreEscolaridad = escolaridadMap[id] || id;
      tableHtml += `<tr>
                      <td style="border: 1px solid #ccc; padding: 4px; text-align: center;">${nombreEscolaridad}</td>
                      <td style="border: 1px solid #ccc; padding: 4px; text-align: center;">${count}</td>
                    </tr>`;
    });
    tableHtml += '</table>';
    return tableHtml;
  }, [escolaridadMap]);

  // Renderizar gráfico con D3
  const renderChart = useCallback((chartData) => {
    const svg = d3.select(chartRef.current);
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(['#507DAF', '#FF6384']);
    const pie = d3.pie().value(d => d);
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
        let tooltip = d3.select('#docs-tooltip');
        if (tooltip.empty()) {
          tooltip = d3.select('body').append('div')
            .attr('id', 'docs-tooltip')
            .attr('class', styles.docsTooltip)
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', '1px solid #ccc')
            .style('border-radius', '5px')
            .style('padding', '10px')
            .style('pointer-events', 'none')
            .style('font-size', '0.9rem');
        }
        tooltip.style('opacity', 1)
          .html(
            `<strong>${d.label}</strong>: ${d.count} docentes<br/>` +
            getEscolaridadTable(d.label === 'Hombres' ? 'M' : 'F', filteredData)
          )
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select('#docs-tooltip').style('opacity', 0);
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
      .text('docentes');
  }, [getEscolaridadTable, filteredData]);

  // Actualizar gráfico cuando filteredData cambia
  useEffect(() => {
    if (chartRef.current) {
      d3.select(chartRef.current).selectAll('*').remove();
      const chartData = prepareChartData();
      if (chartData) {
        renderChart(chartData);
      }
    }
  }, [filteredData, prepareChartData, renderChart]);

  // Manejar cambio en los filtros
  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => {
      const filterValues = prev[filterKey] || [];
      return filterValues.includes(value)
        ? { ...prev, [filterKey]: filterValues.filter(v => v !== value) }
        : { ...prev, [filterKey]: [...filterValues, value] };
    });
  };

  const visibleFilters = Object.entries(filterOptions)
    .filter(([key]) => ['cargo', 'unidad', 'centro'].includes(key))
    .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

  const formatFilterLabel = (filterKey) => {
    return filterKey.charAt(0).toUpperCase() + filterKey.slice(1);
  };

  return (
    <div className={styles.docsContainer}>
      <Title3>{title}</Title3>
      <div className={styles.docsFilters}>
        {Object.entries(visibleFilters).map(([filterKey, options]) => (
          <div key={filterKey} className={styles.docsFilter}>
            <h3>{formatFilterLabel(filterKey)}</h3>
            <div className={styles.docsFilterItems}>
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
        <div className={styles.docsButtonContainer}>
          <button onClick={applyFilters}>Filtrar</button>
          <button onClick={clearFilters}>Limpiar</button>
        </div>
      </div>
      <div className={styles.docsChartContainer}>
        <div className={styles.docsLegend}>
          <div className={styles.docsLegendItem}>
            <FaFemale className={styles.docsIcon} style={{ color: "#FF6384" }} size={40} />
            Mujeres
          </div>
          <div className={styles.docsLegendItem}>
            <FaMale className={styles.docsIcon} style={{ color: "#507DAF" }} size={40} />
            Hombres
          </div>
        </div>
        <svg ref={chartRef} width="300" height="300"></svg>
      </div>
    </div>
  );
};

export default DocentesSex;



