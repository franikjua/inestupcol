import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Title3 from "../../../utils/Title3";
import styles from "./FacultyPrograms.module.css";

const colors = ["#2A9D8F", "#E9C16A", "#F4A261", "#E76F51", "#507DAF", "#C8875F", "#919B9B"];
const accreditationTypes = ["Internacional", "Alta Calidad", "Registro_Calificado"];

const FacultyPrograms = ({ semester }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [faculty, setFaculty] = useState("CIENCIAS ECONOMICAS Y EMPRESARIALES");
  const [formation, setFormation] = useState("");
  const [modality, setModality] = useState("");
  const [showPercentage, setShowPercentage] = useState(true);
  const tooltipRef = useRef();
  const svgRef = useRef();

  useEffect(() => {
    if (!semester) return;
    fetch(`/data/${semester}/programs/faculty_programs.json`)
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        setFilteredData(jsonData.filter(p => p.FACULTAD === faculty));
      })
      .catch((error) => console.error("Error cargando los datos:", error));
  }, [semester, faculty]);

  useEffect(() => {
    if (filteredData.length === 0) return;
    
    const width = 600;
    const height = 400;
    const margin = { top: 80, right: 30, bottom: 80, left: 60 };
    const svgWidth = width + margin.left + margin.right;
    const svgHeight = height + margin.top + margin.bottom;
    
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3
      .select(svgRef.current)
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const uniquePrograms = new Set(filteredData.map(p => p.PROGRAMA));
    const totalPrograms = uniquePrograms.size;
    
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("class", styles.totalProgramsLabel)
      .text(`Total Programas: ${totalPrograms}`);
    
    const accreditationCounts = accreditationTypes.map((type, index) => {
      const programs = new Set(
        filteredData.filter(program => program[type] === true).map(p => p.PROGRAMA)
      );
      return {
        type,
        count: programs.size,
        color: colors[index % colors.length],
        programs: [...programs]
      };
    });
    
    const xScale = d3.scaleBand()
      .domain(accreditationCounts.map(d => d.type))
      .range([0, width])
      .padding(0.4);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(accreditationCounts, d => d.count) || 1])
      .nice()
      .range([height, 0]);
    
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");
    
    svg.append("g").call(d3.axisLeft(yScale));
    
    svg.selectAll("rect")
      .data(accreditationCounts)
      .join("rect")
      .attr("x", d => xScale(d.type))
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.count))
      .attr("fill", d => d.color)
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.8);
        tooltipRef.current.style.visibility = "visible";
        tooltipRef.current.innerHTML = `<strong>${d.type}</strong><br/><ul style='text-align:left;'>${d.programs.map(p => `<li>${p}</li>`).join("")}</ul>`;
      })
      .on("mousemove", function (event) {
        tooltipRef.current.style.top = `${event.pageY + 10}px`;
        tooltipRef.current.style.left = `${event.pageX + 10}px`;
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        tooltipRef.current.style.visibility = "hidden";
      });
    
    svg.selectAll("text.label")
      .data(accreditationCounts)
      .join("text")
      .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.count) - 5)
      .attr("text-anchor", "middle")
      .text(d => showPercentage ? `${((d.count / totalPrograms) * 100).toFixed(1)}%` : d.count);
  }, [filteredData, showPercentage]);

  return (
    <div className={styles.container}>
      <Title3>Programas por Facultad, Formación y Metodología</Title3>
      <button className={styles.toggleButton} onClick={() => setShowPercentage(!showPercentage)}>
        {showPercentage ? "Ver Totales" : "Ver Porcentajes"}
      </button>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef} className={styles.tooltip}></div>
    </div>
  );
};

export default FacultyPrograms;














