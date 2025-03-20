import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Title3 from "../../utils/Title3";
import styles from "./InternationalAccreditationDonutChart.module.css";

/**
 * Componente InternationalAccreditationDonutChart
 * Muestra un gráfico de dona con la distribución de certificaciones por facultad.
 * Incluye un tooltip flotante para mostrar detalles al pasar el mouse.
 *
 * @param {string} semester - El semestre para cargar los datos correspondientes.
 */
const colors = ["#2A9D8F", "#E9C16A", "#F4A261", "#E76F51", "#507DAF", "#C8875F", "#919B9B"];

const InternationalAccreditationDonutChart = ({ semester }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCertifications, setTotalCertifications] = useState(0);
  const [hoveredData, setHoveredData] = useState(null);
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!semester) return;

    fetch(`/data/${semester}/programs/acred_facul_prog.json`)
      .then((response) => response.json())
      .then((jsonData) => {
        const groupedData = {};
        jsonData.forEach(({ Facultad, Agencia, nombre_programa, nivel }) => {
          if (!groupedData[Facultad]) {
            groupedData[Facultad] = { Facultad, Agencia, programas: [] };
          }
          groupedData[Facultad].programas.push({ nombre_programa, nivel });
        });

        const formattedData = Object.values(groupedData).map((item) => ({
          ...item,
          total: item.programas.length,
        }));

        setData(formattedData);
        setTotalCertifications(formattedData.reduce((acc, cur) => acc + cur.total, 0));
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
    const pie = d3.pie().value((d) => d.total).sort(null);
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
      .text((d) => `${((d.data.total / totalCertifications) * 100).toFixed(0)}%`)
      .style("fill", "white");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-15px")
      .attr("class", styles.donutTotalText)
      .style("font-size", "40px")
      .text(totalCertifications);

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "20px")
      .attr("class", styles.donutProgramsLabel)
      .style("font-size", "14px")
      .text("Internacional");
  }, [data, totalCertifications]);

  return (
    <div className={styles.chartContainer}>
      <Title3>Facultades y Programas Acreditados Internacionalmente</Title3>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className={styles.chartContent}>
          <div className={styles.legendContainer}>
            {data.map((d, i) => (
              <div key={i} className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: colors[i] }}></span>
                <span>{d.Facultad}</span>
              </div>
            ))}
          </div>
          <svg ref={svgRef}></svg>
          <div ref={tooltipRef} className={styles.tooltipBox}>
            {hoveredData && (
              <>
                <h4>{hoveredData.Agencia}</h4>
                {hoveredData.programas.map((p, index) => (
                  <p key={index}>
                    <strong>{p.nombre_programa}</strong> - {p.nivel}
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

export default InternationalAccreditationDonutChart;

