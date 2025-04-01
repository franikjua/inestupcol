import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapStudentDptoPais.module.css";
import Title3 from "./Title3";

const MapStudentDptoPais = ({ dataJsonPath, title }) => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("Dpto"); // Valor inicial: "Dpto" o "Pais"
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [totalHombres, setTotalHombres] = useState(0);
  const [totalMujeres, setTotalMujeres] = useState(0);

  useEffect(() => {
    fetch(dataJsonPath)
      .then((res) => res.json())
      .then((rawData) => {
        // Aseguramos que los valores numéricos sean números y definimos un id único
        const parsedData = rawData.map((item) => ({
          ...item,
          id: item.id || item.name,
          hombres: parseInt(item.hombres, 10) || 0,
          mujeres: parseInt(item.mujeres, 10) || 0,
        }));
        setData(parsedData);
      })
      .catch((error) => console.error("Error loading data:", error));
  }, [dataJsonPath]);

  // Filtramos según el tipo ("Dpto" o "Pais")
  const filteredData = data.filter((item) => item.tipo === filter);

  // Calculamos totales del conjunto filtrado
  useEffect(() => {
    const total = filteredData.reduce((sum, item) => sum + item.hombres + item.mujeres, 0);
    const totalH = filteredData.reduce((sum, item) => sum + item.hombres, 0);
    const totalM = filteredData.reduce((sum, item) => sum + item.mujeres, 0);
    setTotalFiltered(total);
    setTotalHombres(totalH);
    setTotalMujeres(totalM);
  }, [filteredData]);

  // Función para determinar color y tamaño según el porcentaje del total filtrado
  const getColorAndSize = (percentage) => {
    if (percentage <= 1) return { color: "#FFF000", size: 30 };
    if (percentage <= 3) return { color: "#E9C16A", size: 50 };
    if (percentage <= 5) return { color: "#FF8000", size: 70 };
    if (percentage <= 10) return { color: "#FFFF00", size: 80 };
    return { color: "#32CD32", size: 90 };
  };

  // Definimos center y zoom según el filtro actual
  const mapProps =
    filter === "Dpto"
      ? { center: [4.5709, -74.2973], zoom: 6 }
      : { center: [20, 0], zoom: 2 };

  // Toggle: si el filtro actual es "Dpto", al pulsar se cambia a "Pais", y viceversa.
  const toggleFilter = () => {
    setFilter((prev) => (prev === "Dpto" ? "Pais" : "Dpto"));
  };

  return (
    <div className={styles.msdpMapContainer}>
      <Title3>{title}</Title3>

      {/* Botón de toggle único */}
      <div className={styles.msdpToggleWrapper}>
        <button className={styles.msdpToggleButton} onClick={toggleFilter}>
          {filter === "Dpto" ? "Visualizar por Pais" : "Visualizar por Dpto"}
        </button>
      </div>

      {/* Totales filtrados */}
      <div className={styles.msdpTotalsWrapper}>
        <p className={styles.msdpTotalStudents}>Total Estudiantes: {totalFiltered}</p>
        <div className={styles.msdpGenderTotals}>
          <p>Total Mujeres: {totalMujeres}</p>
          <p>Total Hombres: {totalHombres}</p>
        </div>
      </div>

      <MapContainer
        center={mapProps.center}
        zoom={mapProps.zoom}
        scrollWheelZoom={true}
        style={{ height: "80vh", width: "100vw" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {filteredData.map((item, index) => {
          const totalItem = item.hombres + item.mujeres;
          const rawPercentage =
            totalFiltered > 0 ? (totalItem / totalFiltered) * 100 : 0;
          const { color, size } = getColorAndSize(rawPercentage);
          const percentage = rawPercentage.toFixed(2);

          return (
            <Marker
              key={`${item.id}-${index}`}
              position={[item.latitud, item.longitud]}
              icon={L.divIcon({
                className: styles.msdpCustomMarker,
                html: `<div class="${styles.msdpCityMarker}">
                         <div class="${styles.msdpCityCircle}" style="width: ${size}px; height: ${size}px; background-color: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                           <div style="text-align: center;">
                             <span class="${styles.msdpCityName}">${item.name}</span><br>
                             <span class="${styles.msdpCityNumber}">${percentage}%</span>
                           </div>
                         </div>
                       </div>`,
                iconSize: [size, size],
              })}
            >
              <Tooltip direction="bottom" offset={[0, 10]} opacity={1}>
                <table>
                  <tbody>
                    <tr>
                      <th>Tipo:</th>
                      <td>{item.tipo}: {item.name}</td>
                    </tr>
                    <tr>
                      <th>Total</th>
                      <td>{totalItem}</td>
                    </tr>
                    <tr>
                      <th>Mujeres</th>
                      <td>{item.mujeres}</td>
                    </tr>
                    <tr>
                      <th>Hombres</th>
                      <td>{item.hombres}</td>
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

export default MapStudentDptoPais;

