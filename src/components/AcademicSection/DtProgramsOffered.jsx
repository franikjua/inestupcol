import React, { useState, useEffect } from "react";
import styles from "./DtProgramsOffered.module.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Title3 from "../../utils/Title3";

const DtProgramsOffered = ({ semester }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({ facultad: "", programa: "", nivel: "", modalidad: "", acreditacion: "" });
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    if (!semester) return;
    fetch(`/data/${semester}/programs/programs_offered.json`)
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
    const result = data.filter((item) => {
      const acreditaciones = Object.entries(item.acreditacion)
        .filter(([key, value]) => value)
        .map(([key]) => key);
      
      return (
        (!filters.facultad || item.Facultad === filters.facultad) &&
        (!filters.programa || item.programa === filters.programa) &&
        (!filters.nivel || item.nivel === filters.nivel) &&
        (!filters.modalidad || item.modalidad[filters.modalidad]) &&
        (!filters.acreditacion || (filters.acreditacion === "Registro_Calificado" ? acreditaciones.length === 1 && acreditaciones.includes("Registro_Calificado") : acreditaciones.includes(filters.acreditacion)))
      );
    });
    setFilteredData(result);
    setIsFiltered(true);
  };

  const clearFilters = () => {
    setFilters({ facultad: "", programa: "", nivel: "", modalidad: "", acreditacion: "" });
    setFilteredData([]);
    setIsFiltered(false);
  };

  const showPDFInNewTab = () => {
    const doc = new jsPDF();
    doc.text("Programas Ofrecidos", 14, 10);
    doc.autoTable({
      head: [["#", "Nombre Programa", "Facultad", "Programa", "Nivel", "Modalidad", "Acreditación"]],
      body: filteredData.map((item, index) => [
        index + 1,
        item.nombre_programa, 
        item.Facultad, 
        item.programa, 
        item.nivel, 
        Object.keys(item.modalidad).filter(key => item.modalidad[key]).join(", "), 
        Object.entries(item.acreditacion).filter(([key, value]) => value).map(([key]) => key).join(", ")
      ]),
    });
    
    const pdfUrl = doc.output("bloburl");
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className={styles.container}>
      <Title3>Programas Ofrecidos</Title3>
      <div className={styles.filters}>
        <select name="facultad" value={filters.facultad} onChange={handleFilterChange}>
          <option value="">Seleccione Facultad</option>
          {[...new Set(data.map(item => item.Facultad))].map((facultad) => (
            <option key={facultad} value={facultad}>{facultad}</option>
          ))}
        </select>
        <select name="programa" value={filters.programa} onChange={handleFilterChange}>
          <option value="">Seleccione Programa</option>
          {[...new Set(data.map(item => item.programa))].map((prog) => (
            <option key={prog} value={prog}>{prog}</option>
          ))}
        </select>
        <select name="nivel" value={filters.nivel} onChange={handleFilterChange}>
          <option value="">Seleccione Nivel</option>
          {[...new Set(data.map(item => item.nivel))].map((nivel) => (
            <option key={nivel} value={nivel}>{nivel}</option>
          ))}
        </select>
        <select name="modalidad" value={filters.modalidad} onChange={handleFilterChange}>
          <option value="">Seleccione Modalidad</option>
          {["Presencial", "Distancia", "Virtual"].map((mod) => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
        <select name="acreditacion" value={filters.acreditacion} onChange={handleFilterChange}>
          <option value="">Seleccione Acreditación</option>
          {["Registro_Calificado", "Alta_Calidad", "Internacional"].map((acredit) => (
            <option key={acredit} value={acredit}>{acredit.replace("_", " ")}</option>
          ))}
        </select>
        <button onClick={applyFilters}>Filtrar</button>
        <button onClick={clearFilters} className={styles.clearButton}>Limpiar</button>
      </div>
      {isFiltered && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre Programa</th>
                <th>Facultad</th>
                <th>Programa</th>
                <th>Nivel</th>
                <th>Modalidad</th>
                <th>Acreditación</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.nombre_programa}</td>
                  <td>{item.Facultad}</td>
                  <td>{item.programa}</td>
                  <td>{item.nivel}</td>
                  <td>{Object.keys(item.modalidad).filter(key => item.modalidad[key]).join(", ")}</td>
                  <td>{Object.entries(item.acreditacion).filter(([key, value]) => value).map(([key]) => key).join(", ")}</td>
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

export default DtProgramsOffered;




