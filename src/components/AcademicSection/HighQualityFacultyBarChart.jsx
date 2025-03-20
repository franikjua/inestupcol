import React, { useState, useEffect, useRef, useCallback } from "react"; // Eliminado useMemo
import * as d3 from "d3";
import Title3 from "../../utils/Title3";
import styles from "./HighQualityFacultyBarChart.module.css";

const colors = ["#2A9D8F", "#E9C16A", "#F4A261", "#E76F51", "#507DAF", "#C8875F", "#919B9B"];

const HighQualityFacultyBarChart = ({ semester }) => {
  const [data, setData] = useState([]);
  const [totalPrograms, setTotalPrograms] = useState(0);
  const [showPercentage, setShowPercentage] = useState(true);
  const tooltipRef = useRef();
  const svgRef = useRef();

  useEffect(() => {
    if (!semester) return;

    fetch(`/data/${semester}/programs/prog_cert_alta_cali.json`)
      .then((response) => response.json())
      .then((jsonData) => {
        if (!jsonData || jsonData.length === 0) {
          console.warn("Datos vacíos o estructura incorrecta.");
          setData([]);
          setTotalPrograms(0);
          return;
        }

        const groupedData = jsonData.reduce((acc, { Facultad, nombre_programa, nivel }) => {
          if (!acc[Facultad]) acc[Facultad] = { Facultad, Agencia: "CNA", programas: [] };
          acc[Facultad].programas.push({ nombre_programa, nivel });
          return acc;
        }, {});

        const formattedData = Object.values(groupedData)
          .map((item, index) => ({
            ...item,
            total: item.programas.length,
            color: colors[index % colors.length],
          }))
          .sort((a, b) => a.total - b.total);

        setData(formattedData);
        setTotalPrograms(formattedData.reduce((acc, cur) => acc + cur.total, 0));
      })
      .catch((error) => console.error("Error cargando los datos:", error));
  }, [semester]);

  const handleMouseOver = useCallback((event, d) => {
    d3.select(event.currentTarget).style("opacity", 0.8);
    tooltipRef.current.style.visibility = "visible";
    tooltipRef.current.innerHTML = `${d.programas
      .map((p) => `<p>${p.nombre_programa} - ${p.nivel}</p>`)
      .join("")}`;
  }, []);

  const handleMouseMove = useCallback((event) => {
    tooltipRef.current.style.top = `${event.pageY + 10}px`;
    tooltipRef.current.style.left = `${event.pageX + 10}px`;
  }, []);

  const handleMouseOut = useCallback((event) => {
    d3.select(event.currentTarget).style("opacity", 1);
    tooltipRef.current.style.visibility = "hidden";
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 600, height = 400;
    const margin = { top: 80, right: 30, bottom: 80, left: 60 };
    const svgWidth = width + margin.left + margin.right;
    const svgHeight = height + margin.top + margin.bottom;

    d3.select(svgRef.current)
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .selectAll("*")
      .remove();

    const g = d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    g.append("text")
      .attr("x", width / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("class", styles.totalProgramsLabel)
      .text(`Total Programas Acreditados - CNA: ${totalPrograms}`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.Facultad))
      .range([0, width])
      .padding(0.4);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total)])
      .nice()
      .range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    g.append("g").call(d3.axisLeft(yScale));

    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => xScale(d.Facultad))
      .attr("y", (d) => yScale(d.total))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.total))
      .attr("fill", (d) => d.color)
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut);

    g.selectAll("text.label")
      .data(data)
      .join("text")
      .attr("class", styles.barLabel)
      .attr("x", (d) => xScale(d.Facultad) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.total) - 5)
      .attr("text-anchor", "middle")
      .text((d) => showPercentage ? `${((d.total / totalPrograms) * 100).toFixed(1)}%` : d.total);
  }, [data, totalPrograms, showPercentage, handleMouseOver, handleMouseMove, handleMouseOut]);

  return (
    <div className={styles.chartContainer}>
      <Title3>Acreditación Alta Calidad por Facultad y Programas</Title3>
      <button className={styles.toggleButton} onClick={() => setShowPercentage((prev) => !prev)}>
        {showPercentage ? "Ver Total" : "Ver Porcentaje"}
      </button>
      <div className={styles.chartContent}>
        <svg ref={svgRef}></svg>
        <div ref={tooltipRef} className={styles.tooltipBox}></div>
      </div>
    </div>
  );
};

export default HighQualityFacultyBarChart;

/*---------------------------------------------*/




