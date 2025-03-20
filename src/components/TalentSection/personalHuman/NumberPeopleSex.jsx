import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { FaMale, FaFemale } from "react-icons/fa";
import Title3 from "../../../utils/Title3";
import styles from "./NumberPeopleSex.module.css";

const NumberPeopleSex = ({ semester }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!semester) return;

        fetch(`/data/${semester}/human_talent/pers_compotition.json`)
            .then((response) => response.json())
            .then((jsonData) => {
                const formattedData = Object.entries(jsonData[0]).map(([key, value]) => ({
                    label: key,
                    value: value,
                }));
                setData(formattedData);
                setLoading(false);
            })
            .catch((error) => console.error("Error loading data:", error));
    }, [semester]);

    useEffect(() => {
        if (loading || data.length === 0) return;

        const width = 400;
        const height = 400;
        const radius = Math.min(width, height) / 2;

        d3.select(svgRef.current).selectAll("*").remove();
        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3
            .scaleOrdinal()
            .domain(data.map((d) => d.label))
            .range(["#507DAF", "#F4A261"]);

        const pie = d3.pie().value((d) => d.value).sort(null);

        const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);

        const arcs = svg.selectAll("arc").data(pie(data)).enter().append("g");

        const tooltip = d3.select(tooltipRef.current);

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", (d) => color(d.data.label))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .classed("visible", true)
                    .html(`<strong>${d.data.label}:</strong> ${d.data.value} personas `);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX}px`).style("top", `${event.pageY - 40}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0).classed("visible", false);
            });

        arcs.append("text")
            .attr("transform", (d) => `translate(${arc.centroid(d)})`)
            .attr("dy", "0.35em")
            .style("fill", "white")
            .style("font-size", "1rem")
            .style("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text((d) => `${Math.round((d.data.value / d3.sum(data, (d) => d.value)) * 100)}%`);

        const total = d3.sum(data, (d) => d.value);
        svg.append("text")
            .attr("class", `${styles.npsDonutTotalText} center-text label-text`)
            .attr("text-anchor", "middle")
            .attr("dy", "-1rem")
            .text(total);

        svg.append("text")
            .attr("class", `${styles.npsDonutProgramsLabel} center-text label-text`)
            .attr("text-anchor", "middle")
            .attr("dy", "1rem")
            .text("Personas");
    }, [loading, data]);

    return (
        <div className={styles.npsContainer}>
            <Title3>Composición de Personal</Title3>

            <div className={styles.npsLegend}>
                <div className={styles.npsLegendItem}>
                    <FaFemale className={styles.npsIcon} style={{ color: "#F4A261" }} size={40} />
                    Mujeres
                </div>
                <div className={styles.npsLegendItem}>
                    <FaMale className={styles.npsIcon} style={{ color: "#507DAF" }} size={40} />
                    Hombres
                </div>
            </div>

            <svg ref={svgRef} className={styles.npsChartContainer}></svg>
            <div ref={tooltipRef} className={`${styles.npsTooltip}`}></div>
        </div>
    );
};

export default NumberPeopleSex;
//----------------------------------------------------------------------
