import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapSedesCreadPrograms.module.css";
import Title3 from "./Title3";

// Importación de los JSON para mapeo de IDs a nombres
import idProgramaData from "../data/id/id_programa.json";
import idFacultadData from "../data/id/id_facultad.json";
import idNivelData from "../data/id/id_nivel.json";
import idMetodologiaData from "../data/id/id_metodologia.json";
import idSedeCreadData from "../data/id/id_sede_cread.json";

const getProgramaNombre = (id) => {
  const found = idProgramaData.find((item) => item.id === id);
  return found ? found.nombre : id;
};

const getFacultadNombre = (id) => {
  const found = idFacultadData.find((item) => item.id === id);
  return found ? found.nombre : id;
};

const getNivelNombre = (id) => {
  const found = idNivelData.find((item) => item.id === id);
  return found ? found.nombre : id;
};

const getMetodologiaNombre = (id) => {
  const found = idMetodologiaData.find((item) => item.id === id);
  return found ? found.nombre : id;
};

const getSedeCreadNombre = (id) => {
  const found = idSedeCreadData.find((item) => item.id === id);
  return found ? found.nombre : id;
};

const MapSedesCreadPrograms = ({ programsJsonPath, title }) => {
  const [programs, setPrograms] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [groupedPrograms, setGroupedPrograms] = useState({});
  const [totalPrograms, setTotalPrograms] = useState(0);

  useEffect(() => {
    fetch(programsJsonPath)
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((item) => ({
          ...item,
          SNIES: item.SNIES,
          id_programa: item.id_programa,
          id_facultad: item.id_facultad,
          id_nivel: item.id_nivel,
          id_metodologia: item.id_metodologia,
          id_sede_cread: item.id_sede_cread,
        }));
        setPrograms(parsed);
        setTotalPrograms(parsed.length);
      })
      .catch((error) => console.error("Error loading programs:", error));
  }, [programsJsonPath]);

  useEffect(() => {
    import("../data/id/sedes_long_latitud.json")
      .then((module) => {
        setSedes(module.default);
      })
      .catch((error) => console.error("Error loading sedes:", error));
  }, []);

  useEffect(() => {
    const grouped = programs.reduce((acc, program) => {
      const sedeId = program.id_sede_cread;
      if (!acc[sedeId]) acc[sedeId] = [];
      acc[sedeId].push(program);
      return acc;
    }, {});
    setGroupedPrograms(grouped);
  }, [programs]);

  const getColorAndSize = (percentage) => {
    if (percentage <= 1) return { color: "#FF8000", size: 30 };
    if (percentage <= 3) return { color: "#E9C16A", size: 40 };
    if (percentage <= 10) return { color: "#FFF000", size: 50 };
    if (percentage <= 40) return { color: "#507DAF", size: 70 };
    return { color: "#Da3333", size: 80 };
  };

  return (
    <div className={styles.mscpMapContainer}>
      <Title3>{title}</Title3>
      <div className={styles.mscpTotalsWrapper}>
        <p className={styles.mscpTotalPrograms}>Total Programas: {totalPrograms}</p>
      </div>
      <MapContainer
        center={[4.5709, -74.2973]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "80vh", width: "100vw" }}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {sedes.map((sede, index) => {
          const sedePrograms = groupedPrograms[sede.id_sede_cread] || [];
          if (sedePrograms.length === 0) return null;
          const count = sedePrograms.length;
          const rawPercentage = totalPrograms > 0 ? (count / totalPrograms) * 100 : 0;
          const { color, size } = getColorAndSize(rawPercentage);
          const percentage = rawPercentage.toFixed(2);

          // Construcción del tooltip con una tabla compacta
          let tooltipContent = `
            <div class="${styles.mscpTooltipHeader}">
              <strong>${sede.tipo}: </strong>
              ${getSedeCreadNombre(sede.id_sede_cread)}
              <br>Total Programas: ${count}
            </div>
            <table class="${styles.mscpTooltipTable}">
              <thead>
                <tr>
                  <th>SNIES</th>
                  <th>Programa</th>
                  <th>Facultad</th>
                  <th>Nivel</th>
                  <th>Metodología</th>
                </tr>
              </thead>
              <tbody>`;
          sedePrograms.forEach((prog) => {
            tooltipContent += `
                <tr>
                  <td>${prog.SNIES}</td>
                  <td>${getProgramaNombre(prog.id_programa)}</td>
                  <td>${getFacultadNombre(prog.id_facultad)}</td>
                  <td>${getNivelNombre(prog.id_nivel)}</td>
                  <td>${getMetodologiaNombre(prog.id_metodologia)}</td>
                </tr>`;
          });
          tooltipContent += `</tbody>
            </table>
            <div class="${styles.mscpTooltipFooter}">
              
            </div>`;

          return (
            <Marker
              key={`${sede.id_sede_cread}-${index}`}
              position={[sede.latitud, sede.longitud]}
              icon={L.divIcon({
                className: styles.mscpCustomMarker,
                html: `<div class="${styles.mscpCityMarker}">
                         <div class="${styles.mscpCityCircle}" style="width: ${size}px; height: ${size}px; background-color: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                           <div style="text-align: center;">
                             <span class="${styles.mscpCityName}">${getSedeCreadNombre(sede.id_sede_cread)}</span><br>
                             <span class="${styles.mscpCityType}">${sede.tipo}</span><br>
                             <span class="${styles.mscpCityNumber}">${percentage}%</span>
                           </div>
                         </div>
                       </div>`,
                iconSize: [size, size],
              })}
            >
              <Tooltip direction="bottom" offset={[0, 10]} opacity={1}>
                <div dangerouslySetInnerHTML={{ __html: tooltipContent }} />
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapSedesCreadPrograms;

