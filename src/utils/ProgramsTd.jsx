import React, { useState, useEffect } from 'react';
import Title3 from './Title3';
import styles from './ProgramsTd.module.css';

// Función auxiliar para generar el HTML de la tabla (para exportar a PDF)
const generateTableHTML = (groupedData, mappings) => {
  const { facultyNames, programNames, formationNames, levelNames, methodologyNames, sedeCreadNames } = mappings;
  
  // Cabecera de la tabla (encabezados sin "id_")
  const headerRow = `
    <tr>
      <th>SNIES</th>
      <th>programa</th>
      <th>acreditacion</th>
      <th>facultad</th>
      <th>formacion</th>
      <th>nivel</th>
      <th>metodologia</th>
      <th>sede_cread</th>
    </tr>
  `;
  let html = '<table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">';
  
  groupedData.forEach(group => {
    // Fila de encabezado del grupo con total de registros
    html += `<tr style="background-color:#f0f0f0;">
               <td colspan="8"><strong>${group.faculty} - Total programas: ${group.records.length}</strong></td>
             </tr>`;
    // Fila de columnas
    html += headerRow;
    // Filas de datos
    group.records.forEach(record => {
      const snies = record.SNIES;
      const programa = programNames[record.id_programa] || record.id_programa;
      const acreditacion = record.id_acreditacion; // Se puede mapear si se tiene el mapping
      const facultad = facultyNames[record.id_facultad] || record.id_facultad;
      const formacion = formationNames[record.id_formacion] || record.id_formacion;
      const nivel = levelNames[record.id_nivel] || record.id_nivel;
      const metodologia = methodologyNames[record.id_metodologia] || record.id_metodologia;
      const sede = sedeCreadNames[record.id_sede_cread] || record.id_sede_cread;
      html += `<tr>
                <td>${snies}</td>
                <td>${programa}</td>
                <td>${acreditacion}</td>
                <td>${facultad}</td>
                <td>${formacion}</td>
                <td>${nivel}</td>
                <td>${metodologia}</td>
                <td>${sede}</td>
              </tr>`;
    });
    // Fila de subtotal para el grupo
    html += `<tr style="font-weight:bold;">
                <td colspan="8">Subtotal: ${group.records.length}</td>
             </tr>`;
  });
  
  html += '</table>';
  return html;
};

const ProgramsTd = ({ jsonDataPath, title }) => {
  // Estados para datos, filtros y visibilidad de la tabla
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({});
  // Estado para el método de conteo (por programas o SNIES)
  const [countMethod, setCountMethod] = useState("id_programa");

  // Mappings
  const [facultyNames, setFacultyNames] = useState({});
  const [programNames, setProgramNames] = useState({});
  const [formationNames, setFormationNames] = useState({});
  const [levelNames, setLevelNames] = useState({});
  const [methodologyNames, setMethodologyNames] = useState({});
  const [sedeCreadNames, setSedeCreadNames] = useState({});

  // Cargar datos principales (programs_general.json)
  useEffect(() => {
    fetch(jsonDataPath)
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        // Inicialmente, sin resultados hasta filtrar
        setFilteredData([]);
      })
      .catch(err => console.error("Error fetching main data:", err));
  }, [jsonDataPath]);

  // Cargar opciones de filtro
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

  // Cargar mappings de nombres
  useEffect(() => {
    import(`../data/id/id_facultad.json`)
      .then(module => {
        const names = {};
        module.default.forEach(item => { names[item.id] = item.nombre; });
        setFacultyNames(names);
      })
      .catch(err => console.error("Error loading id_facultad.json:", err));
  }, []);
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
  useEffect(() => {
    import(`../data/id/id_sede_cread.json`)
      .then(module => {
        const names = {};
        module.default.forEach(item => { names[item.id] = item.nombre; });
        setSedeCreadNames(names);
      })
      .catch(err => console.error("Error loading id_sede_cread.json:", err));
  }, []);

  // Función para aplicar filtros (al presionar "Filtrar")
  const applyFilters = () => {
    let filtered = data;
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(item => values.includes(item[key]));
      }
    });
    setFilteredData(filtered);
  };

  // Función para limpiar filtros (al presionar "Limpiar")
  const clearFilters = () => {
    const reset = {};
    Object.keys(filterOptions).forEach(key => { reset[key] = []; });
    setFilters(reset);
    setFilteredData([]);
  };

  // Función para agrupar datos por facultad
  const groupData = () => {
    const groups = {};
    filteredData.forEach(record => {
      const fac = record.id_facultad;
      if (!groups[fac]) groups[fac] = [];
      groups[fac].push(record);
    });
    const result = Object.entries(groups).map(([facId, records]) => ({
      faculty: facultyNames[facId] || facId,
      records,
    }));
    return result.sort((a, b) => a.faculty.localeCompare(b.faculty));
  };

  // Función para generar un string con los filtros aplicados
  const getAppliedFiltersString = () => {
    const applied = [];
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        applied.push(`${key.replace('id_', '')}: ${values.join(", ")}`);
      }
    });
    return applied.join(" | ");
  };

  // Función para exportar la tabla a PDF (abrir en nueva ventana)
  const exportPDF = () => {
    const tableHTML = generateTableHTML(groupData(), { facultyNames, programNames, formationNames, levelNames, methodologyNames, sedeCreadNames });
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body>
          <h2>${title}</h2>
          ${tableHTML}
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  // Función para exportar la tabla a CSV
  const exportCSV = () => {
    const groupedData = groupData();
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Facultad, SNIES, programa, acreditacion, facultad, formacion, nivel, metodologia, sede_cread\n";
    groupedData.forEach(group => {
      csvContent += `${group.faculty} - Total programas: ${group.records.length}\n`;
      group.records.forEach(record => {
        const snies = record.SNIES;
        const programa = programNames[record.id_programa] || record.id_programa;
        const acreditacion = record.id_acreditacion;
        const facultad = facultyNames[record.id_facultad] || record.id_facultad;
        const formacion = formationNames[record.id_formacion] || record.id_formacion;
        const nivel = levelNames[record.id_nivel] || record.id_nivel;
        const metodologia = methodologyNames[record.id_metodologia] || record.id_metodologia;
        const sede = sedeCreadNames[record.id_sede_cread] || record.id_sede_cread;
        csvContent += `${facultad},${snies},${programa},${acreditacion},${facultad},${formacion},${nivel},${metodologia},${sede}\n`;
      });
      csvContent += `Subtotal:,${group.records.length}\n\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "programs_table.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Total general de programas (únicos según countMethod)
  const totalPrograms = new Set(filteredData.map(item => item[countMethod])).size;
  const appliedFiltersString = getAppliedFiltersString();

  return (
    <div className={styles.prtdContainer}>
      <Title3>{title}</Title3>
      {/* Toggle para cambiar el método de conteo */}
      <div className={styles.prtdToggleContainer}>
        <button onClick={() => setCountMethod(prev => (prev === "id_programa" ? "SNIES" : "id_programa"))}>
          {countMethod === "id_programa" ? "Contar por SNIES" : "Contar por Programa"}
        </button>
      </div>
      {/* Filtros */}
      <div className={styles.prtdFiltersRow}>
        <div className={styles.prtdFilters}>
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className={styles.prtdFilter}>
              <h3>{key.replace('id_', '')}</h3>
              <div className={styles.prtdFilterItems}>
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
      </div>
      {/* Botones de acción debajo de los filtros, centrados */}
      <div className={styles.prtdButtonContainer}>
        <button onClick={clearFilters}>Limpiar</button>
        <button onClick={applyFilters}>Filtrar</button>
      </div>
      {/* Encabezado de la tabla */}
      {filteredData.length > 0 && (
        <div className={styles.prtdTableHeader}>
          <div className={styles.prtdAppliedFilters}>
            {appliedFiltersString ? `Filtros aplicados: ${appliedFiltersString}` : "No hay filtros aplicados"}
          </div>
          <div className={styles.prtdTotal}>
            Total de programas: {totalPrograms}
          </div>
        </div>
      )}
      {/* Tabla dinámica */}
      {filteredData.length > 0 && (
        <div className={styles.prtdTableContainer} dangerouslySetInnerHTML={{ __html: generateTableHTML(groupData(), { facultyNames, programNames, formationNames, levelNames, methodologyNames, sedeCreadNames }) }}></div>
      )}
      {/* Botones de exportación debajo de la tabla */}
      {filteredData.length > 0 && (
        <div className={styles.prtdExportButtons}>
          <button onClick={exportPDF}>Mostrar en PDF</button>
          <button onClick={exportCSV}>Descargar CSV</button>
        </div>
      )}
    </div>
  );
};

export default ProgramsTd;

