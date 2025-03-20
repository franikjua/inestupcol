import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { FaMale, FaFemale } from "react-icons/fa";
import styles from './StudentFaculty.module.css';
import Title3 from './Title3';

const StudentFaculty = ({ jsonDataPath, title }) => {
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState(null);
    const [showPercentage, setShowPercentage] = useState(true);
    const chartRef = useRef(null);
    const [filterOptions, setFilterOptions] = useState({});
    const [facultadNombres, setFacultadNombres] = useState({});

    // Referencia para mostrar total de registros
    const totalRegistrosRef = useRef(null);

    // Función para quitar el prefijo "id_" de los nombres de filtros
    const formatFilterLabel = (filterKey) => {
        return filterKey.startsWith('id_') ? filterKey.substring(3) : filterKey;
    };

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
                    if (file === 'id_facultad') {
                        const nombres = {};
                        fileData.forEach(item => {
                            nombres[item.id] = item.nombre;
                        });
                        setFacultadNombres(nombres);
                    }
                })
                .catch(error => console.error(`Error loading filter data for ${file}:`, error));
        });
    }, [jsonDataPath]);

    useEffect(() => {
        if (filterOptions['id_facultad'] && filterOptions['id_programa'] && filterOptions['id_edad']) {
            setFilters({
                id_facultad: filterOptions['id_facultad'].map(item => item.id),
                id_programa: filterOptions['id_programa'].map(item => item.id),
                id_edad: filterOptions['id_edad'].map(item => item.id),
            });
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
        const totalRegistros = filtered.length;
        if (totalRegistrosRef.current) {
            totalRegistrosRef.current.textContent = `Total de registros: ${totalRegistros}`;
        }
    }, [data, filters]);

    useEffect(() => {
        if (data) {
            applyFilters();
        }
    }, [filters, data, applyFilters]);

    const clearFilters = () => {
        setFilters({
            id_facultad: filterOptions['id_facultad'].map(item => item.id),
            id_programa: filterOptions['id_programa'].map(item => item.id),
            id_edad: filterOptions['id_edad'].map(item => item.id),
        });
        setFilteredData(data);
    };

    const togglePercentage = () => {
        setShowPercentage(!showPercentage);
    };

    const prepareChartData = useCallback(() => {
        if (!filteredData || !facultadNombres) return null;

        const facultyData = filteredData.reduce((acc, item) => {
            const faculty = item.id_facultad;
            if (!acc[faculty]) {
                acc[faculty] = { M: 0, F: 0 };
            }
            acc[faculty][item.genero]++;
            return acc;
        }, {});

        const labels = Object.keys(facultyData).map(id => facultadNombres[id] || `Facultad ${id}`);
        const maleData = labels.map(label =>
            facultyData[Object.keys(facultadNombres).find(key => facultadNombres[key] === label)]?.M || 0
        );
        const femaleData = labels.map(label =>
            facultyData[Object.keys(facultadNombres).find(key => facultadNombres[key] === label)]?.F || 0
        );

        const totalStudents = maleData.reduce((sum, count) => sum + count, 0) +
                              femaleData.reduce((sum, count) => sum + count, 0);

        const stackedData = labels.map((label, index) => {
            const maleCount = maleData[index];
            const femaleCount = femaleData[index];
            const malePercentage = totalStudents > 0 ? ((maleCount / totalStudents) * 100).toFixed(2) : 0;
            const femalePercentage = totalStudents > 0 ? ((femaleCount / totalStudents) * 100).toFixed(2) : 0;
            return {
                label: label,
                Hombres: showPercentage ? malePercentage : maleCount,
                Mujeres: showPercentage ? femalePercentage : femaleCount,
                total: showPercentage
                    ? parseFloat(malePercentage) + parseFloat(femalePercentage)
                    : maleCount + femaleCount,
                malePercentage: malePercentage,
                femalePercentage: femalePercentage
            };
        });

        return {
            labels: labels,
            series: ['Hombres', 'Mujeres'],
            data: stackedData
        };
    }, [filteredData, facultadNombres, showPercentage]);

    const renderChart = useCallback((chartData) => {
        const svg = d3.select(chartRef.current);
        const margin = { top: 20, right: 30, bottom: 70, left: 70 };
        const width = 650 - margin.left - margin.right;
        const height = 370 - margin.top - margin.bottom;

        svg.selectAll('*').remove();
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand().domain(chartData.labels).rangeRound([0, width]).padding(0.1);
        const y = d3.scaleLinear().domain([0, d3.max(chartData.data, d => d.total)]).nice().rangeRound([height, 0]);
        const series = d3.stack().keys(chartData.series)(chartData.data);

        g.selectAll('g')
            .data(series)
            .enter().append('g')
            .attr('fill', (d, i) => i === 0 ? '#507DAF' : '#FF6384')
            .selectAll('rect')
            .data(d => d)
            .enter().append('rect')
            .attr('x', d => x(d.data.label))
            .attr('y', d => y(d[1]))
            .attr('height', d => y(d[0]) - y(d[1]))
            .attr('width', x.bandwidth())
            .on('mouseover', function (event, d) {
                const facultad = d.data.label;
                const programas = filteredData.filter(item => facultadNombres[item.id_facultad] === facultad);
                const programaAgrupado = programas.reduce((acc, programa) => {
                    const nombrePrograma = filterOptions['id_programa'].find(p => p.id === programa.id_programa)?.nombre || `Programa ${programa.id_programa}`;
                    if (!acc[nombrePrograma]) {
                        acc[nombrePrograma] = { mujeres: 0, hombres: 0 };
                    }
                    if (programa.genero === 'F') {
                        acc[nombrePrograma].mujeres++;
                    } else {
                        acc[nombrePrograma].hombres++;
                    }
                    return acc;
                }, {});
                let tooltipContent = `<strong>${facultad}</strong><br><table><tr><th>Programa</th><th>Mujeres</th><th>Hombres</th><th>Total</th></tr>`;
                Object.entries(programaAgrupado).forEach(([nombrePrograma, totales]) => {
                    const total = totales.mujeres + totales.hombres;
                    tooltipContent += `<tr><td>${nombrePrograma}</td><td>${totales.mujeres}</td><td>${totales.hombres}</td><td>${total}</td></tr>`;
                });
                tooltipContent += `</table>`;
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .html(tooltipContent)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function () {
                d3.select('#tooltip').style('opacity', 0);
            });

        // Crear tooltip
        d3.select('body').append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0)
            .attr('class', 'tooltip')
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '5px')
            .style('padding', '10px')
            .style('position', 'absolute');

        // Etiquetas de cada segmento
        g.selectAll('.bar-segment-label')
            .data(chartData.data.flatMap(d => [
                { label: d.label, value: showPercentage ? d.malePercentage : d.Hombres, key: 'Hombres', height: showPercentage ? parseFloat(d.malePercentage) : d.Hombres },
                { label: d.label, value: showPercentage ? d.femalePercentage : d.Mujeres, key: 'Mujeres', height: showPercentage ? parseFloat(d.femalePercentage) : d.Mujeres }
            ]))
            .enter().append('text')
            .attr('class', 'bar-segment-label')
            .attr('x', d => x(d.label) + x.bandwidth() / 2)
            .attr('y', d => {
                const barEnd = d.key === 'Hombres'
                    ? y(chartData.data.find(item => item.label === d.label).total)
                    : y(chartData.data.find(item => item.label === d.label).total - d.height);
                return d.key === 'Hombres' ? height - 10 : barEnd - 10;
            })
            .attr('text-anchor', 'middle')
            .style('font-size', '0.8em')
            .text(d => showPercentage && parseFloat(d.value) >= 0 ? `${d.value}%` : !showPercentage && d.value > 0 ? d.value : '');

        // Etiqueta total encima de cada barra
        g.selectAll('.bar-total-label')
            .data(chartData.data)
            .enter().append('text')
            .attr('class', 'bar-total-label')
            .attr('x', d => x(d.label) + x.bandwidth() / 2)
            .attr('y', d => y(d.total) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '0.8em')
            .text(d => showPercentage ? `${d.total.toFixed(2)}%` : d.total);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'translate(-10,10)rotate(-45)')
            .style('text-anchor', 'end');

        g.append('g')
            .call(d3.axisLeft(y).ticks(null, 's'));
    }, [filteredData, facultadNombres, filterOptions, showPercentage]);

    useEffect(() => {
        if (chartRef.current) {
            d3.select(chartRef.current).selectAll('*').remove();
            const chartData = prepareChartData();
            if (chartData) {
                renderChart(chartData);
            }
        }
    }, [filteredData, facultadNombres, showPercentage, prepareChartData, renderChart]);

    const handleFilterChange = (filterKey, value) => {
        setFilters(prev => {
            const filterValues = prev[filterKey] || [];
            return filterValues.includes(value)
                ? { ...prev, [filterKey]: filterValues.filter(v => v !== value) }
                : { ...prev, [filterKey]: [...filterValues, value] };
        });
    };

    const filtrosEspecificos = ['id_sede_cread', 'id_dpto', 'id_pais', 'id_metodologia', 'id_formacion', 'id_nivel', 'id_zona', 'id_estrato'];
    const filtrosVisibles = Object.entries(filterOptions)
        .filter(([filterKey]) => filtrosEspecificos.includes(filterKey))
        .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {});

    return (
        <div className={styles.stfaContainer}>
            <Title3>{title}</Title3>
            <div className={styles.stfaFilters}>
                <div className={styles.filtersGrid}>
                    {Object.entries(filtrosVisibles).map(([filterKey, options]) => (
                        <div key={filterKey}>
                            <h3>{formatFilterLabel(filterKey)}</h3>
                            <div className={styles.filterItemsContainer}>
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
                </div>
                <button onClick={applyFilters}>Filtrar</button>
                <button onClick={clearFilters}>Limpiar</button>
            </div>
            <div className={styles.stfaChartContainer}>
                <div className={styles.stfaLegend}>
                    <div className={styles.stfaLegendItem}>
                        <FaFemale className={styles.stfaIcon} style={{ color: "#FF6384" }} size={40} />
                        Mujeres
                    </div>
                    <div className={styles.stfaLegendItem}>
                        <FaMale className={styles.stfaIcon} style={{ color: "#507DAF" }} size={40} />
                        Hombres
                    </div>
                </div>
                <div className={styles.stfatotalRegistros} ref={totalRegistrosRef}>
                    <div className={styles.stfatotalRegistrosName}>
                        Total de registros:
                    </div>
                    <div className={styles.stfatotalRegistrosValue}>
                        {filteredData ? filteredData.length : 0}
                    </div>
                </div>
                <svg ref={chartRef} width="650" height="420"></svg>
                <button onClick={togglePercentage}>
                    {showPercentage ? 'Mostrar números' : 'Mostrar porcentajes'}
                </button>
            </div>
        </div>
    );
};

export default StudentFaculty;


/*-2------------------------------------------------------------------*/