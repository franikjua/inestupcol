import React, { useState, useEffect, useCallback } from 'react';
import Title3 from './Title3';
import styles from './ProgramsTdAcredited.module.css';

const ProgramsTdAcredited = ({ jsonDataPath, title }) => {
  const [data, setData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({});
  // Inicialmente, no mostramos la tabla: filteredData está vacío
  const [filteredData, setFilteredData] = useState([]);
  const [facultyNames, setFacultyNames] = useState({});
  const [programNames, setProgramNames] = useState({});
  const [agencyNames, setAgencyNames] = useState({});

  // Cargar datos principales (solo setData, sin actualizar filteredData)
  useEffect(() => {
    fetch(jsonDataPath)
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        // No se asigna a filteredData para que inicialmente no se muestre nada
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
      'id_agencia'
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

  // Cargar mapping de nombres de facultades, programas y agencias
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
    import(`../data/id/id_agencia.json`)
      .then(module => {
        const names = {};
        module.default.forEach(item => { names[item.id] = item.nombre; });
        setAgencyNames(names);
      })
      .catch(err => console.error("Error loading id_agencia.json:", err));
  }, []);

  // Función para aplicar filtros al presionar "Filtrar"
  const applyFilters = useCallback(() => {
    let filtered = data;
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(item => values.includes(item[key]));
      }
    });
    setFilteredData(filtered);
  }, [data, filters]);

  // Al presionar "Limpiar" se borran los filtros y se limpia la tabla (filteredData queda vacío)
  const clearFilters = () => {
    const reset = {};
    Object.keys(filterOptions).forEach(key => { reset[key] = []; });
    setFilters(reset);
    setFilteredData([]);
  };

  // Helper para obtener el nombre de opciones (formación, nivel, metodología)
  const getOptionName = (field, id) => {
    if (filterOptions[field]) {
      const option = filterOptions[field].find(opt => opt.id === id);
      return option ? option.nombre : id;
    }
    return id;
  };

  // Función para agrupar la data por facultad
  const groupDataByFaculty = () => {
    const grouped = {};
    filteredData.forEach(item => {
      const faculty = facultyNames[item.id_facultad] || item.id_facultad || 'Sin Facultad';
      if (!grouped[faculty]) grouped[faculty] = [];
      grouped[faculty].push(item);
    });
    return grouped;
  };

  // Función para exportar la tabla a CSV
  const handleExportCSV = () => {
    const grouped = groupDataByFaculty();
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Facultad, SNIES, Programa, Certificación, Agencia, Formación, Nivel, Metodología\n";
    for (const [faculty, items] of Object.entries(grouped)) {
      csvContent += `${faculty}\n`;
      for (const item of items) {
        const snies = item.SNIES;
        const programa = programNames[item.id_programa] || item.id_programa;
        const certificacion = item.id_acreditacion === 1
          ? "Internacional"
          : item.id_acreditacion === 2
          ? "Alta Calidad"
          : item.id_acreditacion;
        const agencia = agencyNames[item.id_agencia] || item.id_agencia;
        const formacion = getOptionName('id_formacion', item.id_formacion);
        const nivel = getOptionName('id_nivel', item.id_nivel);
        const metodologia = getOptionName('id_metodologia', item.id_metodologia);
        csvContent += `,${snies},${programa},${certificacion},${agencia},${formacion},${nivel},${metodologia}\n`;
      }
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "programs_acredited.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para exportar la tabla a PDF (se abre en una nueva pestaña)
  const handleExportPDF = () => {
    const grouped = groupDataByFaculty();
    let htmlContent = `<html><head><title>Programs Accredited</title></head><body>`;
    htmlContent += `<h2>${title}</h2>`;
    htmlContent += `<table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">`;
    htmlContent += `<tr>
      <th>SNIES</th>
      <th>Programa</th>
      <th>Certificación</th>
      <th>Agencia</th>
      <th>Formación</th>
      <th>Nivel</th>
      <th>Metodología</th>
    </tr>`;
    for (const [faculty, items] of Object.entries(grouped)) {
      htmlContent += `<tr style="background-color:#f0f0f0;"><td colspan="7"><strong>${faculty}</strong></td></tr>`;
      for (const item of items) {
        const snies = item.SNIES;
        const programa = programNames[item.id_programa] || item.id_programa;
        const certificacion = item.id_acreditacion === 1
          ? "Internacional"
          : item.id_acreditacion === 2
          ? "Alta Calidad"
          : item.id_acreditacion;
        const agencia = agencyNames[item.id_agencia] || item.id_agencia;
        const formacion = getOptionName('id_formacion', item.id_formacion);
        const nivel = getOptionName('id_nivel', item.id_nivel);
        const metodologia = getOptionName('id_metodologia', item.id_metodologia);
        htmlContent += `<tr>
          <td>${snies}</td>
          <td>${programa}</td>
          <td>${certificacion}</td>
          <td>${agencia}</td>
          <td>${formacion}</td>
          <td>${nivel}</td>
          <td>${metodologia}</td>
        </tr>`;
      }
    }
    htmlContent += `</table></body></html>`;
    const pdfWindow = window.open("", "_blank");
    pdfWindow.document.open();
    pdfWindow.document.write(htmlContent);
    pdfWindow.document.close();
  };

  // Función para generar la tabla (se muestra sólo si filteredData tiene elementos)
  const renderTable = () => {
    const grouped = groupDataByFaculty();
    // Si no hay datos filtrados, no se muestra nada.
    if (Object.keys(grouped).length === 0) return null;
    return (
      <div className={styles.ptdaTableContainer}>
        <table className={styles.ptdaDataTable}>
          <thead>
            <tr>
              <th>SNIES</th>
              <th>Programa</th>
              <th>Certificación</th>
              <th>Agencia</th>
              <th>Formación</th>
              <th>Nivel</th>
              <th>Metodología</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([faculty, records]) => (
              <React.Fragment key={faculty}>
                <tr className={styles.ptdaFacultyRow}>
                  <td colSpan="7">{faculty}</td>
                </tr>
                {records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.SNIES}</td>
                    <td>{programNames[record.id_programa] || record.id_programa}</td>
                    <td>{record.id_acreditacion === 1 ? "Internacional" : record.id_acreditacion === 2 ? "Alta Calidad" : record.id_acreditacion}</td>
                    <td>{agencyNames[record.id_agencia] || record.id_agencia}</td>
                    <td>{getOptionName('id_formacion', record.id_formacion)}</td>
                    <td>{getOptionName('id_nivel', record.id_nivel)}</td>
                    <td>{getOptionName('id_metodologia', record.id_metodologia)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.ptdaContainer}>
      <Title3>{title}</Title3>
      {/* Sección de filtros y botones de acción */}
      <div className={styles.ptdaFilterAndButtonContainer}>
        <div className={styles.ptdaFilters}>
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className={styles.ptdaFilter}>
              <h3>{key.replace('id_', '')}</h3>
              <div className={styles.ptdaFilterItems}>
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
        <div className={styles.ptdaButtonContainer}>
          <button onClick={clearFilters}>Limpiar</button>
          <button onClick={applyFilters}>Filtrar</button>
        </div>
      </div>
      {/* Sólo se muestra la tabla si se han aplicado filtros */}
      {renderTable()}
      {/* Botones de exportación */}
      <div className={styles.ptdaExportButtons}>
        <button onClick={handleExportPDF}>Mostrar en PDF</button>
        <button onClick={handleExportCSV}>Descargar en Excel (CSV)</button>
      </div>
    </div>
  );
};

export default ProgramsTdAcredited;


