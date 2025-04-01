import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from "d3";
import styles from "./ColombiaMap.module.css";
import Title3 from "./Title3";

const ColombiaMap = ({ svgFilePath, jsonDataPath, title }) => {
    const mapRef = useRef(null);
    const [data, setData] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [mapSvg, setMapSvg] = useState(null);

    useEffect(() => {
        fetch(svgFilePath)
            .then((response) => response.text())
            .then(setMapSvg)
            .catch((error) => console.error("❌ Error cargando el SVG:", error));
    }, [svgFilePath]);

    useEffect(() => {
        fetch(jsonDataPath)
            .then((response) => response.json())
            .then((jsonData) => {
                console.log(" Datos cargados:", jsonData);
                setData(jsonData);
                setTotalStudents(d3.sum(jsonData, (d) => +d.Estudiantes));
            })
            .catch((error) => console.error("❌ Error cargando los datos:", error));
    }, [jsonDataPath]);

    const getColor = useCallback((students) => {
        if (!students) return "#ccc";
        const maxStudents = d3.max(data, (d) => +d.Estudiantes);
        const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, maxStudents]);
        return colorScale(students);
    }, [data]);

    useEffect(() => {
        if (!mapSvg || !data.length || !mapRef.current) return;

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(mapSvg, "image/svg+xml");
        const svgElement = svgDoc.documentElement;

        mapRef.current.innerHTML = new XMLSerializer().serializeToString(svgElement);

        setTimeout(() => {
            console.log(" Reasignando eventos después de insertar el SVG");

            const svg = d3.select(mapRef.current).select("svg");

            svg.selectAll("g")
                .each(function () {
                    const deptoId = this.getAttribute("id")?.trim();
                    const deptoData = data.find((d) => d.id.trim() === deptoId);

                    if (!deptoData) return;

                    console.log(`🟢 Evento asignado a: ${deptoId}`);

                    d3.select(this)
                        .select("circle")
                        .attr("fill", getColor(+deptoData.Estudiantes))
                        .attr("stroke", "#000")
                        .attr("cursor", "pointer")
                        .attr("class", styles.colmapCircle);

                    const xPos = this.getAttribute("cx") || "50";
                    const yPos = this.getAttribute("cy") || "50";
                    console.log(` Agregando texto en (${xPos}, ${yPos}) para ${deptoData.nombre}`);

                    d3.select(mapRef.current).select("svg").append("text")
                        .attr("x", xPos)
                        .attr("y", yPos)
                        .attr("text-anchor", "middle")
                        .attr("fill", "#000")
                        .attr("font-size", "12px")
                        .text(`${deptoData.nombre} (${((deptoData.Estudiantes / totalStudents) * 100).toFixed(1)}%)`);

                    svg.append("text")
                        .attr("x", this.getBBox().x + this.getBBox().width / 2)
                        .attr("y", this.getBBox().y + this.getBBox().height / 2)
                        .attr("text-anchor", "middle")
                        .attr("fill", "#000")
                        .attr("font-size", "12px")
                        .text(`${deptoData.nombre} (${((deptoData.Estudiantes / totalStudents) * 100).toFixed(1)}%)`);

                    d3.select(this)
                        .on("mouseover", (event) => {
                            console.log(`🟢 Hover sobre: ${deptoId}`);
                            setHoverInfo({
                                nombre: deptoData.nombre,
                                estudiantes: deptoData.Estudiantes,
                                x: event.pageX,
                                y: event.pageY,
                            });
                        })
                        .on("mouseout", () => {
                            console.log(` Saliendo de: ${deptoId}`);
                            setHoverInfo(null);
                        });
                });
            svg.attr("class", styles.colmapSvg);
            d3.select("#colombia-map").attr("class", styles.colmapColombiaMap)
        }, 100);
    }, [mapSvg, data, totalStudents, getColor]);

    return (
        <div className={styles.colmapMapContainer}>
            <Title3>{title}</Title3>
            <div ref={mapRef} id="colombia-map"></div>

            {hoverInfo && (
                <div
                    className={styles.colmapTooltip}
                    style={{
                        left: hoverInfo.x + "px",
                        top: hoverInfo.y + "px",
                        visibility: hoverInfo.visibility,
                    }}
                >
                    <strong>{hoverInfo.nombre}</strong>
                    <br />
                    Estudiantes: {hoverInfo.estudiantes}
                </div>
            )}
        </div>
    );
};

export default ColombiaMap;
