import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { FaGlobe, FaAward } from 'react-icons/fa';
import styles from './ProgramsAcreditedFaculty.module.css';
import Title3 from './Title3';

const ProgramsAcreditedFaculty = ({ jsonDataPath, title }) => {
  const [data, setData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({});
  const [countMethod, setCountMethod] = useState("id_programa");
  const [filteredData, setFilteredData] = useState([]);
  const [facultyNames, setFacultyNames] = useState({});
  const [programNames, setProgramNames] = useState({}); // Nuevo estado para nombres de programas

  const chartRef = useRef(null);

  // Cargar datos principales
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
    const files = ['id_programa', 'id_acreditacion', 'id_facultad', 'id_formacion', 'id_nivel', 'id_metodologia'];
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

  // Cargar nombres de programas desde ../data/id/id_programa.json
  useEffect(() => {
    import(`../data/id/id_programa.json`)
      .then(module => {
        const names = {};
        module.default.forEach(item => { names[item.id] = item.nombre; });
        setProgramNames(names);
      })
      .catch(err => console.error("Error loading id_programa.json:", err));
  }, []);

  // Aplicar filtros: se actualiza filteredData cada vez que cambian filters o data
  useEffect(() => {
    let filtered = data;
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(item => values.includes(item[key]));
      }
    });
    setFilteredData(filtered);
  }, [filters, data]);

  const applyFilters = useCallback(() => {
    let filtered = data;
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(item => values.includes(item[key]));
      }
    });
    setFilteredData(filtered);
  }, [data, filters]);

  const clearFilters = () => {
    const reset = {};
    Object.keys(filterOptions).forEach(key => { reset[key] = []; });
    setFilters(reset);
    setFilteredData(data);
  };

  const toggleCountMethod = () => {
    setCountMethod(prev => (prev === "id_programa" ? "SNIES" : "id_programa"));
  };

  // Prepara datos para la gráfica agrupada por facultad  
  // Se cuentan de forma única usando countMethod y se calculan los porcentajes respecto a los totales globales.
  const prepareChartData = useCallback(() => {
    if (!filteredData.length) return null;
    const grouped = {};
    // Agrupar por facultad usando el mapping de facultyNames
    filteredData.forEach(item => {
      const facultad = facultyNames[item.id_facultad] || item.Facultad || 'Sin Facultad';
      if (!grouped[facultad]) grouped[facultad] = { AltaCalidad: [], Internacional: [] };
      if (item.id_acreditacion === 2) grouped[facultad].AltaCalidad.push(item);
      if (item.id_acreditacion === 1) grouped[facultad].Internacional.push(item);
    });
    const labels = Object.keys(grouped);

    // Función para contar valores únicos según countMethod
    const countUnique = (records) => new Set(records.map(item => item[countMethod])).size;
    
    // Calcular los conteos únicos usando countMethod
    const altaCalidadCounts = labels.map(label => countUnique(grouped[label].AltaCalidad));
    const internacionalCounts = labels.map(label => countUnique(grouped[label].Internacional));

    // Totales globales para cada categoría
    const globalAltaCalidadTotal = altaCalidadCounts.reduce((sum, v) => sum + v, 0);
    const globalInternacionalTotal = internacionalCounts.reduce((sum, v) => sum + v, 0);

    const percentagesAltaCalidad = labels.map(label =>
      globalAltaCalidadTotal > 0 ? ((countUnique(grouped[label].AltaCalidad) / globalAltaCalidadTotal) * 100).toFixed(2) : 0
    );
    const percentagesInternacional = labels.map(label =>
      globalInternacionalTotal > 0 ? ((countUnique(grouped[label].Internacional) / globalInternacionalTotal) * 100).toFixed(2) : 0
    );

    return { 
      labels, 
      altaCalidadCounts, 
      internacionalCounts, 
      percentagesAltaCalidad, 
      percentagesInternacional, 
      details: grouped 
    };
  }, [filteredData, facultyNames, countMethod]);

  const renderChart = useCallback(() => {
    const chartData = prepareChartData();
    if (!chartData) return;
    const svg = d3.select(chartRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 100, left: 60 };
    svg.selectAll('*').remove();
    
    // Escala para facultades (grupo)
    const x0 = d3.scaleBand()
      .domain(chartData.labels)
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.1);
    
    // Escala interna para cada categoría
    const x1 = d3.scaleBand()
      .domain(['Alta Calidad', 'Internacional'])
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);
    
    const maxCount = d3.max([...chartData.altaCalidadCounts, ...chartData.internacionalCounts]);
    const y = d3.scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([height - margin.bottom, margin.top]);
    
    // Escala de colores: Alta Calidad (rojo) y Internacional (azul)
    const color = d3.scaleOrdinal()
      .domain(['Alta Calidad', 'Internacional'])
      .range(['#507DAF', '#2A9D8F']);

    const g = svg.append('g');
    
    // Crear grupos por facultad
    g.selectAll('g.facultyGroup')
      .data(chartData.labels)
      .enter().append('g')
      .attr('class', 'facultyGroup')
      .attr('transform', d => `translate(${x0(d)},0)`)
      .each(function(faculty, i) {
        const group = d3.select(this);
        const dataForFaculty = [
          { key: 'Alta Calidad', value: chartData.altaCalidadCounts[i], percentage: chartData.percentagesAltaCalidad[i], details: chartData.details[faculty].AltaCalidad },
          { key: 'Internacional', value: chartData.internacionalCounts[i], percentage: chartData.percentagesInternacional[i], details: chartData.details[faculty].Internacional }
        ];
        group.selectAll('rect')
          .data(dataForFaculty)
          .enter().append('rect')
          .attr('x', d => x1(d.key))
          .attr('y', d => y(d.value))
          .attr('width', x1.bandwidth())
          .attr('height', d => y(0) - y(d.value))
          .attr('fill', d => color(d.key))
          .on('mouseover', (event, d) => {
            let content = `<table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td colspan="2" style="text-align: center; font-weight: bold; border: 1px solid #ccc; padding: 4px;">
                  ${faculty} - ${d.key}: ${d.value}
                </td>
              </tr>
              <tr>
                <th style="border: 1px solid #ccc; padding: 4px;">Programa</th>
                <th style="border: 1px solid #ccc; padding: 4px;">Agencia</th>
              </tr>`;
            const uniquePairs = new Set();
            d.details.forEach(record => {
              // Usamos el mapping de programNames para mostrar el nombre del programa
              const progName = programNames[record.id_programa] || record.id_programa;
              const agency = record.id_agencia;
              const pairKey = progName + '|' + agency;
              if (!uniquePairs.has(pairKey)) {
                uniquePairs.add(pairKey);
                content += `<tr>
                  <td style="border: 1px solid #ccc; padding: 4px;">${progName}</td>
                  <td style="border: 1px solid #ccc; padding: 4px;">${agency}</td>
                </tr>`;
              }
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
        // Agregar texto con el porcentaje sobre cada barra
        group.selectAll('text')
          .data(dataForFaculty)
          .enter().append('text')
          .attr('x', d => x1(d.key) + x1.bandwidth() / 2)
          .attr('y', d => y(d.value) - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .text(d => `${d.percentage}%`);
      });
    
    // Eje X
    g.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');
    
    // Eje Y
    g.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [prepareChartData, programNames]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Calcular total de acreditaciones (suma de ambas categorías globalmente)
  const chartData = prepareChartData();
  const totalAcreditaciones = chartData
    ? chartData.altaCalidadCounts.reduce((a, b) => a + b, 0) + chartData.internacionalCounts.reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className={styles.container}>
      <Title3>{title}</Title3>
      {/* Sección de filtros y botones de acción */}
      <div className={styles.filterAndButtonContainer}>
        <div className={styles.filters}>
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className={styles.filter}>
              <h3>{key.replace('id_', '')}</h3>
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
          <button onClick={clearFilters}>Limpiar</button>
          <button onClick={applyFilters}>Filtrar</button>
        </div>
      </div>
      {/* Botón de toggle */}
      <div className={styles.toggleContainer}>
        <button onClick={toggleCountMethod}>
          {countMethod === "id_programa" ? "Contar por SNIES" : "Contar por Programa"}
        </button>
      </div>
      {/* Leyenda */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <FaAward className={styles.icon} style={{ color: '#507DAF' }} size={40} />
          Alta Calidad
        </div>
        <div className={styles.legendItem}>
          <FaGlobe className={styles.icon} style={{ color: '#2A9D8F' }} size={40} />
          Internacional
        </div>
      </div>
      <div className={styles.totalAcreditaciones}>
        Total de acreditaciones: <span>{totalAcreditaciones}</span>
      </div>
      <div className={styles.chartContainer}>
        <svg ref={chartRef} width="800" height="400"></svg>
      </div>
      <div id="tooltip" className={styles.tooltip}></div>
    </div>
  );
};

export default ProgramsAcreditedFaculty;






