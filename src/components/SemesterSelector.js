import React from "react";

// Función para generar la lista de semestres dinámicamente
const generateSemesters = (startYear = 2019, endYear = 2024) => {
  const semesters = [];
  for (let year = endYear; year >= startYear; year--) {
    semesters.push(`${year}-2`, `${year}-1`);
  }
  return semesters;
};

// Componente de selección de semestre
const SemesterSelector = ({ selectedSemester, onChange }) => (
  <select value={selectedSemester} onChange={(e) => onChange(e.target.value)}>
    {generateSemesters(2019, 2024).map((semester) => (
      <option key={semester} value={semester}>
        {semester}
      </option>
    ))}
  </select>
);

export default SemesterSelector;
