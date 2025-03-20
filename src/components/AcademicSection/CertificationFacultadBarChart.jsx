import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Title3 from "../../utils/Title3";
import "./CertificationFacultadBarChart.css";

const CertificationFacultadBarChart = ({ semester }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredData, setHoveredData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef();

  useEffect(() => {
    if (!semester) return;

    fetch(`/data/${semester}/programs/prog_certification.json`)
      .then((response) => response.json())
      .then((jsonData) => {
        const groupedData = {};
        jsonData.forEach(({ Facultad, num_prog, agency }) => {
          if (!groupedData[Facultad]) {
            groupedData[Facultad] = { Facultad, agencies: [], total: 0 };
          }
          groupedData[Facultad].total += parseInt(num_prog, 10);
          groupedData[Facultad].agencies.push(agency);
        });

        const formattedData = Object.values(groupedData);
        setData(formattedData);
        setLoading(false);
      })
      .catch((error) => console.error("Error cargando los datos:", error));
  }, [semester]);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 600;
    const height = 400;
    const margin = { top: 50, right: 30, bottom: 70, left: 50 };

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.Facultad))
      .range([0, width - margin.left - margin.right])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total)])
      .nice()
      .range([height - margin.top - margin.bottom, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeSet2);

    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => xScale(d.Facultad))
      .attr("y", (d) => yScale(d.total))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - margin.top - margin.bottom - yScale(d.total))
      .attr("fill", (d, i) => colorScale(i))
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.7);
        setHoveredData(d);
        setTooltipPosition({ x: event.pageX + 10, y: event.pageY + 10 });
      })
      .on("mousemove", function (event) {
        setTooltipPosition({ x: event.pageX + 10, y: event.pageY + 10 });
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        setHoveredData(null);
      });

    svg.append("g").attr("transform", `translate(0, ${height - margin.top - margin.bottom})`).call(d3.axisBottom(xScale)).selectAll("text").attr("transform", "rotate(-25)").style("text-anchor", "end");
    svg.append("g").call(d3.axisLeft(yScale));
  }, [data]);

  return (
    <div className="cert-bar-chart-container">
      <Title3>Distribución de Certificaciones por Facultad</Title3>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="cert-bar-chart-content">
          <svg ref={svgRef}></svg>
          {hoveredData && (
            <div className="cert-bar-tooltip" style={{ top: tooltipPosition.y, left: tooltipPosition.x }}>
              <h4>Certificación</h4>
              <p><strong>{hoveredData.Facultad}</strong></p>
              <p><strong>Total programas:</strong> {hoveredData.total}</p>
              <p><strong>Agencias:</strong> {hoveredData.agencies.join(", ")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificationFacultadBarChart;






