import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { FaChalkboardTeacher, FaTabletAlt, FaGlobe } from 'react-icons/fa';
import Title3 from './Title3';
import styles from './ProgramsGeneral.module.css';

const ProgramsGeneral = ({ jsonDataPath, title }) => {
  // Estados principales
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({});
  // Método de conteo: se cuentan datos únicos por "id_programa" o "SNIES"
  const [countMethod, setCountMethod] = useState("id_programa");

  // Mappings
  const [levelNames, setLevelNames] = useState({});
  const [methodologyNames, setMethodologyNames] = useState({});
  const [programNames, setProgramNames] = useState({});
  const [formationNames, setFormationNames] = useState({});

  // Referencia al SVG del gráfico
  const chartRef = useRef(null);

  // Cargar datos principales (programs_general.json)
  useEffect(() => {
    fetch(jsonDataPath)
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        setFilteredData(jsonData); // Se muestran todos los datos inicialmente
      })
      .catch(err => console.error("Error fetching main data:", err));
  }, [jsonDataPath]);

  // Cargar opciones de filtro desde ../data/id/
  useEffect(() => {
    const files = [
      'id_programa',
      'id_acreditacion',
      'id_facultad',
      'id_formacion',
      'id_nivel',
      'id_metodologia',
      'id_sede_cread'
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

  // Cargar mapping de nombres para niveles y metodologías
  useEffect(() => {
    import(`../data/id/id_nivel.json`)
      .then(module => {
        const names = {};
        module.default.forEach(item => { names[item.id] = item.nombre; });
        setLevelNames(names);
      })
      .catch(err => console.error("Error loading id_nivel.json:", err));
  }, []);

  useEffect(() => {
    import(`../data/id/id_metodologia.json`)
      .then(module => {
        const names = {};
        module.default.forEach(item => { names[item.id] = item.nombre; });
        setMethodologyNames(names);
      })
      .catch(err => console.error("Error loading id_metodologia.json:", err));
  }, []);

  // Cargar mapping de nombres para programas y formación
  useEffect(() => {
    import(`../data/id/id_programa.json`)
      .then(module => {
        const names = {};
        module.default.forEach(item => { names[item.id] = item.nombre; });
        setProgramNames(names);
      })
      .catch(err => console.error("Error loading id_programa.json:", err));
  }, []);

  useEffect(() => {
    import(`../data/id/id_formacion.json`)
      .then(module => {
        const names = {};
        module.default.forEach(item => { names[item.id] = item.nombre; });
        setFormationNames(names);
      })
      .catch(err => console.error("Error loading id_formacion.json:", err));
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

  // Función para limpiar filtros
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

  // Preparar datos para el gráfico:
  // 1. Agrupar por nivel (usando id_nivel y mapping de levelNames)
  // 2. Dentro de cada nivel, agrupar por metodología (orden fijo: Presencial, Distancia, Virtual)
  // 3. Calcular el número único de programas y el porcentaje respecto al total global de cada metodología
  // (Para la deduplicación se usa la comparación manual)
  const chartData = useMemo(() => {
    if (!filteredData.length) return null;
    // Agrupar por nivel
    const levelsSet = new Set(filteredData.map(item => item.id_nivel));
    const levels = Array.from(levelsSet).sort((a, b) => a - b);
    const levelLabels = levels.map(lv => levelNames[lv] || lv);

    // Orden fijo para metodologías
    let fixedMethods = [];
    if (Object.keys(methodologyNames).length > 0) {
      const methodsMap = methodologyNames;
      const presId = Object.keys(methodsMap).find(key => methodsMap[key].toLowerCase() === "presencial");
      const distId = Object.keys(methodsMap).find(key => methodsMap[key].toLowerCase() === "distancia");
      const virtId = Object.keys(methodsMap).find(key => methodsMap[key].toLowerCase() === "virtual");
      if (presId) fixedMethods.push({ id: presId, name: methodsMap[presId] });
      if (distId) fixedMethods.push({ id: distId, name: methodsMap[distId] });
      if (virtId) fixedMethods.push({ id: virtId, name: methodsMap[virtId] });
    }
    if (fixedMethods.length === 0) {
      const methodSet = new Set(filteredData.map(item => item.id_metodologia));
      fixedMethods = Array.from(methodSet).map(id => ({ id, name: id }));
    }

    // Inicializar totales globales por metodología
    const globalTotals = {};
    fixedMethods.forEach(m => { globalTotals[m.id] = 0; });

    // Agrupar datos por nivel
    const barData = levelLabels.map((levelLabel, idx) => {
      const levelId = levels[idx];
      const recordsInLevel = filteredData.filter(item => item.id_nivel === levelId);
      const bars = fixedMethods.map(m => {
        // Filtrar registros por metodología
        const records = recordsInLevel.filter(item => String(item.id_metodologia) === m.id);
        // Deduplicar registros según countMethod
        const uniqueRecords = [];
        const seen = new Set();
        records.forEach(item => {
          if (!seen.has(item[countMethod])) {
            seen.add(item[countMethod]);
            uniqueRecords.push(item);
          }
        });
        const count = uniqueRecords.length;
        globalTotals[m.id] += count;
        return { methodology: m.name, methodologyId: m.id, count, records: uniqueRecords };
      });
      return { level: levelLabel, bars };
    });

    // Calcular porcentajes para cada barra respecto al total global de esa metodología
    barData.forEach(levelData => {
      levelData.bars.forEach(bar => {
        const global = globalTotals[bar.methodologyId];
        bar.percentage = global > 0 ? ((bar.count / global) * 100).toFixed(2) : 0;
      });
    });

    return { levels: levelLabels, barData, fixedMethods, globalTotals };
  }, [filteredData, levelNames, methodologyNames, countMethod]);

  // Renderizar gráfico con D3
  const renderChart = useCallback(() => {
    if (!chartData) return;
    const svg = d3.select(chartRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 100, left: 60 };
    svg.selectAll('*').remove();

    // Escala para niveles (x0)
    const x0 = d3.scaleBand()
      .domain(chartData.levels)
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.1);
    // Escala para metodologías (x1)
    const x1 = d3.scaleBand()
      .domain(chartData.fixedMethods.map(m => m.name))
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);
    const maxCount = d3.max(chartData.barData.flatMap(level => level.bars.map(b => b.count)));
    const y = d3.scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Escala de colores fija para metodologías: Presencial, Distancia, Virtual
    const colorRange = ["#507DAF", "#F4A261", "#2A9D8F"];
    const color = d3.scaleOrdinal()
      .domain(chartData.fixedMethods.map(m => m.name))
      .range(colorRange);

    const g = svg.append('g');

    // Crear grupos por nivel
    chartData.barData.forEach(levelData => {
      const group = g.append('g')
        .attr('transform', `translate(${x0(levelData.level)},0)`);
      levelData.bars.forEach(bar => {
        group.append('rect')
          .attr('x', () => x1(bar.methodology))
          .attr('y', () => y(bar.count))
          .attr('width', x1.bandwidth())
          .attr('height', () => y(0) - y(bar.count))
          .attr('fill', color(bar.methodology))
          .on('mouseover', (event) => {
            let content = `<table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td colspan="3" style="text-align: center; font-weight: bold; border: 1px solid #ccc; padding: 4px;">
                  Número de programas: ${bar.count}
                </td>
              </tr>
              <tr>
                <th style="border: 1px solid #ccc; padding: 4px;">Programa</th>
                <th style="border: 1px solid #ccc; padding: 4px;">Número</th>
                <th style="border: 1px solid #ccc; padding: 4px;">Formación</th>
              </tr>`;
            const groups = {};
            bar.records.forEach(item => {
              const prog = programNames[item.id_programa] || item.id_programa;
              const form = formationNames[item.id_formacion] || item.id_formacion;
              const key = prog + '|' + form;
              if (!groups[key]) {
                groups[key] = { program: prog, formation: form, count: 0 };
              }
              groups[key].count++;
            });
            Object.values(groups).forEach(grp => {
              content += `<tr>
                <td style="border: 1px solid #ccc; padding: 4px;">${grp.program}</td>
                <td style="border: 1px solid #ccc; padding: 4px;">${grp.count}</td>
                <td style="border: 1px solid #ccc; padding: 4px;">${grp.formation}</td>
              </tr>`;
            });
            content += `</table>`;
            d3.select('#tooltip')
              .style('opacity', 1)
              .html(content)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', () => {
            d3.select('#tooltip').style('opacity', 0);
          });
        group.append('text')
          .attr('x', x1(bar.methodology) + x1.bandwidth() / 2)
          .attr('y', y(bar.count) - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .text(`${bar.percentage}%`);
      });
    });

    // Eje X (niveles)
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
  }, [chartData, programNames, formationNames]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Total de programas únicos en el conjunto filtrado
  const totalPrograms = useMemo(() => new Set(filteredData.map(item => item[countMethod])).size, [filteredData, countMethod]);

  return (
    <div className={styles.prgeContainer}>
      <Title3>{title}</Title3>
      {/* Sección de filtros y botones de acción */}
      <div className={styles.prgeFilterAndButtonContainer}>
        <div className={styles.prgeFilters}>
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className={styles.prgeFilter}>
              <h3>{key.replace('id_', '')}</h3>
              <div className={styles.prgeFilterItems}>
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
        <div className={styles.prgeButtonContainer}>
          <button onClick={clearFilters}>Limpiar</button>
          <button onClick={applyFilters}>Filtrar</button>
        </div>
      </div>
      {/* Botón toggle para cambiar método de conteo */}
      <div className={styles.prgeToggleContainer}>
        <button onClick={toggleCountMethod}>
          {countMethod === "id_programa" ? "Contar por SNIES" : "Contar por Programa"}
        </button>
      </div>
      {/* Leyenda */}
      <div className={styles.prgeLegend}>
        <div className={styles.prgeLegendItem}>
          <FaChalkboardTeacher style={{ color: "#507DAF" }} size={40} />
          <span>Presencial</span>
        </div>
        <div className={styles.prgeLegendItem}>
          <FaTabletAlt style={{ color: "#F4A261" }} size={40} />
          <span>Distancia</span>
        </div>
        <div className={styles.prgeLegendItem}>
          <FaGlobe style={{ color: "#2A9D8F" }} size={40} />
          <span>Virtual</span>
        </div>
      </div>
      {/* Total de programas */}
      <div className={styles.prgeTotalPrograms}>
        Total de programas: <span>{totalPrograms}</span>
      </div>
      {/* Contenedor del gráfico */}
      <div className={styles.prgeChartContainer}>
        <svg ref={chartRef} width="800" height="400"></svg>
      </div>
      {/* Tooltip */}
      <div id="tooltip" className={styles.prgeTooltip}></div>
    </div>
  );
};

export default ProgramsGeneral;
/*---------------------------final----------------------------------*/



