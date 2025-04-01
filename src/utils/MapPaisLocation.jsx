import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapSedeLocation.module.css";
import Title3 from "./Title3";

const MapSedeLocation = ({ citiesJsonPath, title, tooltipTitle }) => {
  const [data, setData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalHombres, setTotalHombres] = useState(0);
  const [totalMujeres, setTotalMujeres] = useState(0);

  useEffect(() => {
    fetch(citiesJsonPath)
      .then((res) => res.json())
      .then((cityData) => {
        console.log("Datos cargados:", cityData);
        setData(cityData);
        const total = cityData.reduce((sum, item) => sum + item.hombres + item.mujeres, 0);
        const totalH = cityData.reduce((sum, item) => sum + item.hombres, 0);
        const totalM = cityData.reduce((sum, item) => sum + item.mujeres, 0);
        setTotalStudents(total);
        setTotalHombres(totalH);
        setTotalMujeres(totalM);
      })
      .catch((error) => console.error("Error loading data:", error));
  }, [citiesJsonPath]);

  const getColorAndSize = (percentage) => {
    if (percentage <= 1) return { color: "#FFF000", size: 30 };
    if (percentage <= 3) return { color: "#E9C16A", size: 50 };
    if (percentage <= 5) return { color: "#FF8000", size: 70 };
    if (percentage <= 10) return { color: "#FFFF00", size: 80 };
    return { color: "#32CD32", size: 90 };
  };

  return (
    <div className={styles.mapslMapContainer}>
      <Title3>{title}</Title3>
      <div className={styles.mapsTotalsWrapper}>
        <p className={styles.mapsTotalStudents}>Total Estudiantes: {totalStudents}</p>
        <div className={styles.mapsGenderTotals}>
          <p>Total Hombres: {totalHombres}</p>
          <p>Total Mujeres: {totalMujeres}</p>
        </div>
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
        {data.map((item) => {
          const totalDept = item.hombres + item.mujeres;
          const rawPercentage = totalStudents > 0 ? (totalDept / totalStudents) * 100 : 0;
          const { color, size } = getColorAndSize(rawPercentage);
          const percentage = rawPercentage.toFixed(2);
          return (
            <Marker
              key={item.id}
              position={[item.latitud, item.longitud]}
              icon={L.divIcon({
                className: styles.mapslCustomMarker,
                html: `
                  <div class="${styles.mapslCityMarker}">
                    <div class="${styles.mapslCityCircle}" 
                      style="width: ${size}px; height: ${size}px; background-color: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <div style="text-align: center;">
                        <span class="${styles.mapslCityName}">${item.name}</span><br>
                        <span class="${styles.mapslCityNumber}">${percentage}%</span>
                      </div>
                    </div>
                  </div>
                `,
                iconSize: [size, size],
              })}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                <table>
                  <tbody>
                    <tr>
                      <th>{tooltipTitle}</th>
                      <td>{item.name}</td>
                    </tr>
                    <tr>
                      <th>Total</th>
                      <td>{totalDept}</td>
                    </tr>
                    <tr>
                      <th>Hombres</th>
                      <td>{item.hombres}</td>
                    </tr>
                    <tr>
                      <th>Mujeres</th>
                      <td>{item.mujeres}</td>
                    </tr>
                  </tbody>
                </table>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapSedeLocation;


