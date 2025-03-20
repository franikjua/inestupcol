import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Title3 from "../../utils/Title3"; // Componente de título
import "./MethodologyDonutChart.css";

const MethodologyDonutChart = ({ semester }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrograms, setTotalPrograms] = useState(0);
  const svgRef = useRef();

  useEffect(() => {
    if (!semester) return;

    fetch(`/data/${semester}/programs/programas.json`)
      .then((response) => response.json())
      .then((jsonData) => {
        // Filtrar por metodología y contar programas
        const methodologies = jsonData.reduce((acc, program) => {
          const metodologia = program.Metodologia
            ? program.Metodologia.trim().toLowerCase() // Convertimos a minúsculas
            : "sin metodología";

          acc[metodologia] = (acc[metodologia] || 0) + 1;
          return acc;
        }, {});

        // Convertir el objeto en un array de objetos para D3
        let formattedData = Object.keys(methodologies).map((metodologia) => ({
          metodologia: metodologia.charAt(0).toUpperCase() + metodologia.slice(1), // Capitaliza la primera letra
          value: methodologies[metodologia],
        }));

        // Ordenar de mayor a menor porcentaje
        formattedData.sort((a, b) => b.value - a.value);

        setData(formattedData);
        setTotalPrograms(jsonData.length);
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

    const colorScale = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.metodologia))
      .range(d3.schemeSet2);

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

    svg
      .selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.data.metodologia))
      .on("mouseover", function () {
        d3.select(this).style("opacity", 0.8);
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
      });

    svg
      .selectAll("text")
      .data(pie(data))
      .join("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("class", "donut-chart-text")
      .text((d) => `${((d.data.value / totalPrograms) * 100).toFixed(0)}%`)
      .style("fill", "#fff");
  }, [data, totalPrograms]);

  return (
    <div className="chart-table-wrapper">
      <Title3>Distribución de Programas por Metodología</Title3>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="donut-chart-container">
          <svg ref={svgRef}></svg>
          <div className="info-table">
            <table>
              <thead>
                <tr>
                  <th>Color</th>
                  <th>Metodología</th>
                  <th>Número de Programas</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          width: "20px",
                          height: "20px",
                          backgroundColor: d3.schemeSet2[i],
                        }}
                      ></span>
                    </td>
                    <td>{d.metodologia}</td>
                    <td>{d.value}</td>
                  </tr>
                ))}
                {/* Última fila con el total */}
                <tr className="total-row">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td><strong>{totalPrograms}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MethodologyDonutChart;

