import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { FaGlobe, FaAward } from 'react-icons/fa';
import styles from './ProgramsAcredited.module.css';
import Title3 from './Title3';

const ProgramsAcredited = ({ jsonDataPath, title }) => {
  // Estados principales
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  // Método de conteo: "id_programa" o "SNIES"
  const [countMethod, setCountMethod] = useState("id_programa");
  // Mapeo de nombres para facultades y agencias
  const [facultyNames, setFacultyNames] = useState({});
  const [agencyNames, setAgencyNames] = useState({});
  const chartRef = useRef(null);

  // Helper para quitar el prefijo "id_"
  const formatFilterLabel = (key) =>
    key.startsWith('id_') ? key.substring(3) : key;

  // Cargar datos principales de acreditación
  useEffect(() => {
    fetch(jsonDataPath)
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        setFilteredData(jsonData);
      })
      .catch(err => console.error("Error fetching main data:", err));
  }, [jsonDataPath]);

  // Cargar opciones de filtro desde ../data/id/
  useEffect(() => {
    const files = [
      'id_programa', 'id_acreditacion', 'id_agencia',
      'id_facultad', 'id_formacion', 'id_nivel', 'id_metodologia'
    ];
    files.forEach(file => {
      import(`../data/id/${file}.json`)
        .then(module => {
          setFilterOptions(prev => ({ ...prev, [file]: module.default }));
        })
        .catch(err => console.error(`Error loading ${file}.json:`, err));
    });
  }, []);

  // Inicializar filtros como arrays vacíos
  useEffect(() => {
    if (Object.keys(filterOptions).length > 0) {
      const initFilters = {};
      Object.keys(filterOptions).forEach(key => {
        initFilters[key] = [];
      });
      setFilters(initFilters);
    }
  }, [filterOptions]);

  // Cargar nombres de facultades desde ../data/id/id_facultad.json
  useEffect(() => {
    import(`../data/id/id_facultad.json`)
      .then(module => {
        const names = {};
        module.default.forEach(item => { names[item.id] = item.nombre; });
        setFacultyNames(names);
      })
      .catch(err => console.error("Error loading id_facultad.json:", err));
  }, []);

  // Cargar nombres de agencias desde ../data/id/id_agencia.json
  useEffect(() => {
    import(`../data/id/id_agencia.json`)
      .then(module => {
        const names = {};
        module.default.forEach(item => { names[item.id] = item.nombre; });
        setAgencyNames(names);
      })
      .catch(err => console.error("Error loading id_agencia.json:", err));
  }, []);

  // Función para aplicar filtros
  const applyFilters = useCallback(() => {
    let filtered = data;
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(item => values.includes(item[key]));
      }
    });
    setFilteredData(filtered);
  }, [data, filters]);

  // Función para limpiar filtros y restablecer datos
  const clearFilters = () => {
    const reset = {};
    Object.keys(filterOptions).forEach(key => { reset[key] = []; });
    setFilters(reset);
    setFilteredData(data);
  };

  // Toggle del método de conteo
  const toggleCountMethod = () => {
    setCountMethod(prev => (prev === "id_programa" ? "SNIES" : "id_programa"));
  };

  // Prepara datos para la gráfica (solo registros con id_acreditacion === 1 o 2)
  const prepareChartData = useCallback(() => {
    if (!filteredData.length) return null;
    const records = filteredData.filter(item =>
      item.id_acreditacion === 1 || item.id_acreditacion === 2
    );
    const groups = {
      Internacional: records.filter(item => item.id_acreditacion === 1),
      "Alta calidad": records.filter(item => item.id_acreditacion === 2)
    };
    const countUnique = (group) => new Set(group.map(item => item[countMethod])).size;
    const countInternacional = countUnique(groups.Internacional);
    const countAltaCalidad = countUnique(groups["Alta calidad"]);
    const total = countInternacional + countAltaCalidad;
    const percInternacional = total > 0 ? ((countInternacional / total) * 100).toFixed(2) : 0;
    const percAltaCalidad = total > 0 ? ((countAltaCalidad / total) * 100).toFixed(2) : 0;
    return {
      labels: ["Internacional", "Alta calidad"],
      counts: [countInternacional, countAltaCalidad],
      percentages: [percInternacional, percAltaCalidad],
      total,
      details: {
        Internacional: groups.Internacional,
        "Alta calidad": groups["Alta calidad"]
      }
    };
  }, [filteredData, countMethod]);

  // Renderiza la gráfica de barras usando D3
  const renderChart = useCallback((chartData) => {
    const svg = d3.select(chartRef.current);
    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    svg.selectAll('*').remove();
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    const x = d3.scaleBand().domain(chartData.labels).range([0, chartWidth]).padding(0.4);
    const y = d3.scaleLinear().domain([0, d3.max(chartData.counts)]).range([chartHeight, 0]);
    
    // Dibujar las barras
    g.selectAll('.bar')
      .data(chartData.labels)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d))
      .attr('y', (d, i) => y(chartData.counts[i]))
      .attr('width', x.bandwidth())
      .attr('height', (d, i) => chartHeight - y(chartData.counts[i]))
      .attr('fill', (d, i) => i === 0 ? '#2A9D8F' : '#507DAF')
      .on('mouseover', (event, d) => {
        const idx = chartData.labels.indexOf(d);
        const details = chartData.details[d];

        // Agrupar por combinación de facultad y agencia.
        const groups = {};
        details.forEach(record => {
          const key = record.id_facultad + '|' + record.id_agencia;
          if (!groups[key]) {
            groups[key] = { facultad: record.id_facultad, agencia: record.id_agencia, count: 0 };
          }
          groups[key].count += 1;
        });

        // Construir el contenido del tooltip:
        let content = `<table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td colspan="3" style="text-align: center; font-weight: bold; border: 1px solid #ccc; padding: 4px;">
              ${d} - Total: ${chartData.counts[idx]}
            </td>
          </tr>
          <tr>
            <th style="border: 1px solid #ccc; padding: 4px;">Facultad</th>
            <th style="border: 1px solid #ccc; padding: 4px;">No.acred</th>
            <th style="border: 1px solid #ccc; padding: 4px;">Agencia</th>
          </tr>`;
        Object.values(groups).forEach(group => {
          content += `<tr>
            <td style="border: 1px solid #ccc; padding: 4px;">${facultyNames[group.facultad] || group.facultad}</td>
            <td style="border: 1px solid #ccc; padding: 4px;">${group.count}</td>
            <td style="border: 1px solid #ccc; padding: 4px;">${agencyNames[group.agencia] || group.agencia}</td>
          </tr>`;
        });
        content += `</table>`;

        let tooltip = d3.select('#tooltip');
        if (tooltip.empty()) {
          tooltip = d3.select('body').append('div')
            .attr('id', 'tooltip')
            .attr('class', styles.tooltip)
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', '1px solid #ccc')
            .style('border-radius', '5px')
            .style('padding', '10px')
            .style('pointer-events', 'none');
        }
        tooltip.style('opacity', 1)
          .html(content)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        d3.select('#tooltip').style('opacity', 0);
      });
    
    // Mostrar porcentajes sobre las barras
    g.selectAll('.label')
      .data(chartData.percentages)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', (d, i) => x(chartData.labels[i]) + x.bandwidth() / 2)
      .attr('y', (d, i) => y(chartData.counts[i]) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(d => d + '%');
    
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x));
    g.append('g')
      .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + '%'));
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', '#333');
  }, [facultyNames, agencyNames]);

  useEffect(() => {
    const chartData = prepareChartData();
    if (chartData) renderChart(chartData);
  }, [filteredData, prepareChartData, renderChart]);

  return (
    <div className={styles.container}>
      <Title3>{title}</Title3>
      <div className={styles.filterAndButtonContainer}>
        <div className={styles.filters}>
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className={styles.filter}>
              <h3>{formatFilterLabel(key)}</h3>
              <div className={styles.filterItems}>
                {options.map(option => (
                  <label key={option.id}>
                    <input
                      type="checkbox"
                      value={option.id}
                      checked={filters[key]?.includes(option.id) || false}
                      onChange={() =>
                        setFilters(prev => ({
                          ...prev,
                          [key]: prev[key]?.includes(option.id)
                            ? prev[key].filter(v => v !== option.id)
                            : [...(prev[key] || []), option.id]
                        }))
                      }
                    />
                    {option.nombre || option.id}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.filterButton} onClick={applyFilters}>Filtrar</button>
          <button className={styles.clearButton} onClick={clearFilters}>Limpiar</button>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.toggleContainer}>
          <button onClick={toggleCountMethod}>
            {countMethod === "id_programa" ? "Contar por SNIES" : "Contar por Programa"}
          </button>
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <FaAward className={styles.icon} style={{ color: '#2A9D8F' }} size={40} />
            Alta calidad
          </div>
          <div className={styles.legendItem}>
            <FaGlobe className={styles.icon} style={{ color: '#507DAF' }} size={40} />
            Internacional
          </div>
        </div>
        <div className={styles.totalAcreditaciones}>
          Total de acreditaciones: <span>{prepareChartData()?.total || 0}</span>
        </div>
        <svg ref={chartRef} width="500" height="400"></svg>
      </div>
      <div id="tooltip" className={styles.tooltip}></div>
    </div>
  );
};

export default ProgramsAcredited;



