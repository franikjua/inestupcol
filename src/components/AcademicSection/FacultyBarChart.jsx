import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Title3 from "../../utils/Title3";
import "./FacultyBarChart.css";

const FacultyBarChart = ({ semester }) => {
  const [data, setData] = useState([]);
  const svgRef = useRef();

  useEffect(() => {
    if (!semester) return;

    fetch(`/data/${semester}/programs/programas.json`)
      .then((response) => response.json())
      .then((jsonData) => {
        // Filtrar SNIES únicos
        const uniquePrograms = Array.from(new Map(jsonData.map(item => [item.snies, item])).values());

        // Agrupar por Facultad y contar por tipo de acreditación
        const groupedData = d3.rollups(
          uniquePrograms,
          (v) =>
            d3.rollup(
              v,
              (g) => g.length,
              (d) => d.Acreditacion || "Sin Acreditación"
            ),
          (d) => d.Facultad || "Sin Facultad"
        );

        // Formatear los datos con el orden correcto
        const formattedData = groupedData.map(([facultad, accMap]) => {
          return {
            facultad,
            "Internacional": accMap.get("Internacional") || 0,
            "Alta Calidad": accMap.get("Alta Calidad") || 0,
            "Registro Calificado": accMap.get("Registro Calificado") || 0,
            total:
              (accMap.get("Internacional") || 0) +
              (accMap.get("Alta Calidad") || 0) +
              (accMap.get("Registro Calificado") || 0),
          };
        });

        setData(formattedData);
      })
      .catch((error) => console.error("Error cargando los datos:", error));
  }, [semester]);

  useEffect(() => {
    if (data.length === 0) return;

    const margin = { top: 40, right: 30, bottom: 100, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Definir el orden de las acreditaciones
    const accTypes = ["Internacional", "Alta Calidad", "Registro Calificado"];

    const color = d3
      .scaleOrdinal()
      .domain(accTypes)
      .range(["#2A9D8F", "#F4A261", "#507DAF"]); // Colores específicos

    // Escalas
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.facultad))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total)])
      .nice()
      .range([height, 0]);

    // Datos apilados
    const stackedData = d3.stack().keys(accTypes)(data);

    // Dibujar las barras apiladas
    svg
      .selectAll("g.series")
      .data(stackedData)
      .join("g")
      .attr("class", "series")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.facultad))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());

    // Ejes
    svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).selectAll("text").attr("transform", "rotate(-45)").style("text-anchor", "end");

    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    // Leyenda
    const legend = svg
      .selectAll(".legend")
      .data(accTypes)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${i * 150}, -30)`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", (d) => color(d));

    legend.append("text").attr("x", 25).attr("y", 15).text((d) => d).style("font-size", "12px");
  }, [data]);

  return (
    <div className="chart-container">
      <Title3>Distribución de Acreditaciones por Facultad</Title3>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default FacultyBarChart;


