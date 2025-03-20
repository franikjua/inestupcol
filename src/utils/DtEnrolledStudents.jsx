import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './DtEnrolledStudents.module.css';
import Title3 from './Title3';

const DtEnrolledStudents = ({ jsonDataPath, title }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [showTable, setShowTable] = useState(false);

  // Función para quitar el prefijo "id_" de los nombres de filtros
  const formatFilterLabel = (filterKey) =>
    filterKey.startsWith('id_') ? filterKey.substring(3) : filterKey;

  // Cargar datos y opciones de filtro
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(jsonDataPath);
        const jsonData = await res.json();
        setData(jsonData);
        // No se muestra la tabla hasta que se haga clic en "Filtrar"
        setFilteredData([]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

    const filterFiles = [
      'id_sede_cread',
      'id_dpto',
      'id_pais',
      'id_metodologia',
      'id_formacion',
      'id_nivel',
      'id_facultad',
      'id_programa',
      'id_zona',
      'id_estrato',
      'id_edad'
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

  // Inicializar filtros: sin selección (arrays vacíos) para todos los filtros, excepto 'id_genero'
  useEffect(() => {
    if (Object.keys(filterOptions).length > 0) {
      const newFilters = {};
      Object.keys(filterOptions).forEach(key => {
        if (key !== 'id_genero') {
          newFilters[key] = [];
        }
      });
      setFilters(newFilters);
    }
  }, [filterOptions]);

  // Función para aplicar los filtros (se ejecuta solo al hacer clic en "Filtrar")
  const applyFilters = useCallback(() => {
    let filtered = data;
    Object.entries(filters).forEach(([filterKey, selected]) => {
      if (selected.length > 0) {
        filtered = filtered.filter(item => selected.includes(item[filterKey]));
      }
    });
    setFilteredData(filtered);
    setShowTable(true);
  }, [data, filters]);

  // Limpia todos los filtros y deja la tabla en blanco
  const clearFilters = () => {
    const newFilters = {};
    Object.keys(filterOptions).forEach(key => {
      if (key !== 'id_genero') {
        newFilters[key] = [];
      }
    });
    setFilters(newFilters);
    setFilteredData([]);
    setShowTable(false);
  };

  // Prepara los datos para la tabla dinámica
  // Para cada filtro (excluyendo 'id_genero'), se cuentan mujeres y hombres por opción.
  // Se omiten los grupos y opciones cuyo total sea 0.
  const prepareTableData = useCallback(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const tableData = [];
    Object.entries(filterOptions).forEach(([filterKey, options]) => {
      if (filterKey === 'id_genero') return;
      let groupTotalM = 0, groupTotalH = 0;
      const optionRows = options
        .map(option => {
          const countM = filteredData.filter(
            item => item[filterKey] === option.id && item.genero === 'F'
          ).length;
          const countH = filteredData.filter(
            item => item[filterKey] === option.id && item.genero === 'M'
          ).length;
          groupTotalM += countM;
          groupTotalH += countH;
          return {
            name: option.nombre || option.id,
            countM,
            countH,
            total: countM + countH
          };
        })
        .filter(row => row.total > 0);
      const groupTotal = groupTotalM + groupTotalH;
      if (groupTotal > 0) {
        tableData.push({
          filterName: formatFilterLabel(filterKey),
          totalM: groupTotalM,
          totalH: groupTotalH,
          total: groupTotal,
          options: optionRows
        });
      }
    });
    return tableData;
  }, [filteredData, filterOptions]);

  const tableData = prepareTableData();

  // Maneja el cambio de un checkbox
  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => {
      const arr = prev[filterKey] || [];
      return arr.includes(value)
        ? { ...prev, [filterKey]: arr.filter(v => v !== value) }
        : { ...prev, [filterKey]: [...arr, value] };
    });
  };

  // Exporta a PDF usando jsPDF y autoTable
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(title, 14, 20);
    const tableColumn = ["Filtro", "Mujeres", "Hombres", "Total"];
    const tableRows = [];
    tableData.forEach(group => {
      tableRows.push([group.filterName, group.totalM, group.totalH, group.total]);
      group.options.forEach(option => {
        tableRows.push(["  " + option.name, option.countM, option.countH, option.total]);
      });
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30
    });
    doc.output('dataurlnewwindow');
  };

  // Exporta a Excel generando un CSV y descargándolo
  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Filtro,Mujeres,Hombres,Total\r\n";
    tableData.forEach(group => {
      csvContent += `${group.filterName},${group.totalM},${group.totalH},${group.total}\r\n`;
      group.options.forEach(option => {
        csvContent += `  ${option.name},${option.countM},${option.countH},${option.total}\r\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "enrolled_students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <Title3>{title}</Title3>
      <div className={styles.filters}>
        {Object.entries(filterOptions)
          .filter(([key]) => key !== 'id_genero')
          .map(([filterKey, options]) => (
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
      {showTable && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Filtro</th>
                <th>Mujeres</th>
                <th>Hombres</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {tableData &&
                tableData.map((group, idx) => (
                  <React.Fragment key={idx}>
                    <tr className={styles.groupHeader}>
                      <td>{group.filterName}</td>
                      <td>{group.totalM}</td>
                      <td>{group.totalH}</td>
                      <td>{group.total}</td>
                    </tr>
                    {group.options.map((opt, i) => (
                      <tr key={i} className={styles.groupRow}>
                        <td className={styles.optionName}>{opt.name}</td>
                        <td>{opt.countM}</td>
                        <td>{opt.countH}</td>
                        <td>{opt.total}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.exportButtons}>
        <button onClick={exportToPDF}>Ver PDF</button>
        <button onClick={exportToExcel}>Descargar Excel</button>
      </div>
    </div>
  );
};

export default DtEnrolledStudents;



