import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Title3 from "../../../utils/Title3";
import styles from "./ProgramsCurrentOffered.module.css";

const colors = ["#2A9D8F", "#E9C16A", "#F4A261"];

const ProgramsCurrentOffered = ({ semester }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const [currentData, setCurrentData] = useState("ofertados");
    const [hoveredData, setHoveredData] = useState(null);

    useEffect(() => {
        if (!semester) return;

        fetch(`/data/${semester}/programs/values_programs_current_offered.json`)
            .then(response => response.json())
            .then(jsonData => {
                updateChart(jsonData.find(d => d.programas === currentData));
            });
    }, [semester, currentData]);

    const updateChart = (dataset) => {
        if (!dataset) return;

        const { tecnologicos, pregrado, posgrado } = dataset;
        const total = tecnologicos + pregrado + posgrado;

        const pieData = [
            { name: "Tecnológicos", value: tecnologicos, color: colors[0] },
            { name: "Pregrado", value: pregrado, color: colors[1] },
            { name: "Posgrado", value: posgrado, color: colors[2] }
        ];

        d3.select(svgRef.current).selectAll("*").remove();

        const width = 350, height = 350, radius = Math.min(width, height) / 2;
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const arc = d3.arc().innerRadius(80).outerRadius(radius);
        const pie = d3.pie().value(d => d.value);

        svg.selectAll("path")
            .data(pie(pieData))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .attr("stroke", "#fff")
            .style("stroke-width", "2px")
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget).style("opacity", 0.8);
                setHoveredData(d.data);
                if (tooltipRef.current) {
                    tooltipRef.current.style.display = "block";
                }
            })
            .on("mousemove", (event) => {
                if (tooltipRef.current) {
                    tooltipRef.current.style.top = `${event.clientY - 30}px`;
                    tooltipRef.current.style.left = `${event.clientX + 10}px`;
                }
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget).style("opacity", 1);
                setHoveredData(null);
                if (tooltipRef.current) {
                    tooltipRef.current.style.display = "none";
                }
            });

        svg.selectAll("text")
            .data(pie(pieData))
            .enter()
            .append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("fill", "#fff")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text(d => d.data.value > 0 ? `${((d.data.value / total) * 100).toFixed(1)}%` : "");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -10)
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .text(total);

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 15)
            .style("font-size", "14px")
            .style("fill", "#555")
            .text("Programas");
    };

    return (
        <div className={styles.pcoContainer}>
            <Title3 text="Programas ofertados & vigentes" />
            <button
                className={styles.pcoToggleButton}
                onClick={() => setCurrentData(currentData === "ofertados" ? "vigentes" : "ofertados")}
            >
                Mostrar {currentData === "ofertados" ? "Vigentes" : "Ofertados"}
            </button>

            <div className={styles.pcoChartContainer}>
                <svg ref={svgRef} className={styles.pcoSvg}></svg>
            </div>

            <div className={styles.pcoLegendContainer}>
                <div className={styles.pcoLegendItem}>
                    <span className={styles.pcoColorBox} style={{ backgroundColor: colors[0] }}></span>
                    Tecnológicos
                </div>
                <div className={styles.pcoLegendItem}>
                    <span className={styles.pcoColorBox} style={{ backgroundColor: colors[1] }}></span>
                    Pregrado
                </div>
                <div className={styles.pcoLegendItem}>
                    <span className={styles.pcoColorBox} style={{ backgroundColor: colors[2] }}></span>
                    Posgrado
                </div>
            </div>

            <div ref={tooltipRef} className={styles.pcoTooltip}>
                {hoveredData && (
                    <>
                        <h4>{hoveredData.name}</h4>
                        <p><strong>Total programas:</strong> {hoveredData.value}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProgramsCurrentOffered;