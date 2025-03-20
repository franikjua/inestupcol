import React, { useState, useEffect } from "react";
import styles from "./DtProgramsOfferedLocations.module.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const DtProgramsOfferedLocations = ({ semester }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({ PROGRAMA: "", ACREDITACION: "", FACULTAD: "", FORMACION: "", NIVEL: "", METODOLOGIA: "", CIUDAD: "", ESTADO: "" });
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    if (!semester) return;
    fetch(`/data/${semester}/programs/programs_locations.json`)
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
      });
  }, [semester]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const applyFilters = () => {
    const result = data.filter((item) =>
      Object.keys(filters).every(key => !filters[key] || item[key] === filters[key])
    );
    setFilteredData(result);
    setIsFiltered(true);
  };

  const clearFilters = () => {
    setFilters({ PROGRAMA: "", ACREDITACION: "", FACULTAD: "", FORMACION: "", NIVEL: "", METODOLOGIA: "", CIUDAD: "", ESTADO: "" });
    setFilteredData([]);
    setIsFiltered(false);
  };

  const showPDFInNewTab = () => {
    const doc = new jsPDF();
    doc.text("Programas Ofrecidos por Ubicación", 14, 10);
    doc.autoTable({
      head: [["#", "PROGRAMA", "ACREDITACIÓN", "FACULTAD", "FORMACIÓN", "NIVEL", "METODOLOGÍA", "CIUDAD", "ESTADO"]],
      body: filteredData.map((item, index) => [
        index + 1, item.PROGRAMA, item.ACREDITACION, item.FACULTAD, item.FORMACION, item.NIVEL, item.METODOLOGIA, item.CIUDAD, item.ESTADO
      ]),
    });
    
    const pdfUrl = doc.output("bloburl");
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className={styles.container}>
      <h2>Programas Ofrecidos por Ubicación</h2>
      <div className={styles.filters}>
        {Object.keys(filters).map((filter) => (
          <select key={filter} name={filter} value={filters[filter]} onChange={handleFilterChange}>
            <option value="">Seleccione {filter.replace("_", " ")}</option>
            {[...new Set(data.map(item => item[filter]))].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ))}
        <button onClick={applyFilters}>Filtrar</button>
        <button onClick={clearFilters} className={styles.clearButton}>Limpiar</button>
      </div>
      {isFiltered && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                {Object.keys(filters).map((key) => (
                  <th key={key}>{key.replace("_", " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  {Object.keys(filters).map((key) => (
                    <td key={key}>{item[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={showPDFInNewTab} className={styles.exportButton}>Visualizar PDF</button>
        </>
      )}
    </div>
  );
};

export default DtProgramsOfferedLocations;

