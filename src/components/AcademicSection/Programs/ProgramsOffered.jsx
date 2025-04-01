import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Title3 from "../../../utils/Title3";
import styles from "./ProgramsOffered.module.css";

/**
 * Componente ProgramsOffered.module
 * Muestra un gráfico de dona con la distribución de certificaciones de programas.
 * Incluye un tooltip flotante para mostrar detalles al pasar el mouse.
 *
 * @param {string} semester - El semestre para cargar los datos correspondientes.
 */
const colors = ["#2A9D8F", "#E9C16A", "#F4A261", "#E76F51", "#507DAF", "#C8875F", "#919B9B"];

const ProgramsOffered = ({ semester }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrograms, setTotalPrograms] = useState(0);
  const [hoveredData, setHoveredData] = useState(null);
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!semester) return;

    fetch(`/data/${semester}/programs/programs_certification.json`)
      .then((response) => response.json())
      .then((jsonData) => {
        const mergedData = {};
        jsonData.forEach(({ num_prog, certification, agency }) => {
          const key = certification.includes("Internacional") ? "Internacional" : certification;
          if (!mergedData[key]) {
            mergedData[key] = { certification: key, agencies: [], num_prog: 0 };
          }
          mergedData[key].num_prog += parseInt(num_prog, 10);
          mergedData[key].agencies.push({ num_prog, agency });
        });

        const formattedData = Object.values(mergedData);
        setData(formattedData);
        setTotalPrograms(formattedData.reduce((acc, cur) => acc + cur.num_prog, 0));
        setLoading(false);
      })
      .catch((error) => console.error("Error cargando los datos:", error));
  }, [semester]);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const colorScale = d3.scaleOrdinal(colors);
    const pie = d3.pie().value((d) => d.num_prog).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

    svg
      .selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d, i) => colorScale(i))
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.8);
        setHoveredData(d.data);
        if (tooltipRef.current) {
          tooltipRef.current.style.display = "block";
        }
      })
      .on("mousemove", function (event) {
        if (tooltipRef.current) {
          tooltipRef.current.style.top = `${event.pageY + 10}px`;
          tooltipRef.current.style.left = `${event.pageX + 10}px`;
        }
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        setHoveredData(null);
        if (tooltipRef.current) {
          tooltipRef.current.style.display = "none";
        }
      });

    svg
      .selectAll("text")
      .data(pie(data))
      .join("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("class", styles.donutChartText)
      .text((d) => `${((d.data.num_prog / totalPrograms) * 100).toFixed(0)}%`)
      .style("fill", "white");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-10px")
      .attr("class", styles.donutTotalText)
      .style("font-size", "24px")
      .text(totalPrograms);

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "15px")
      .attr("class", styles.donutProgramsLabel)
      .text("Programas");

    console.log("✅ Gráfico actualizado correctamente.");
  }, [data, totalPrograms]);

  return (
    <div className={styles.chartContainer}>
      <Title3>Distribución de Acreditaciones por Programas</Title3>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className={styles.chartContent}>
          <div className={styles.legendContainer}>
            {data.map((d, i) => (
              <div key={i} className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: d3.schemeSet2[i] }}></span>
                <span>{d.certification}</span>
              </div>
            ))}
          </div>
          <svg ref={svgRef}></svg>
          <div ref={tooltipRef} className={styles.tooltipBox}>
            {hoveredData && (
              <>
                <h4>{hoveredData.certification}</h4>
                <p><strong>Total programas:</strong> {hoveredData.num_prog}</p>
                {hoveredData.agencies.map((a, index) => (
                  <p key={index}>
                    <strong>{a.num_prog} Programas</strong> || <strong>Agencia:</strong> {a.agency}
                  </p>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsOffered;
//-------------------------------------
