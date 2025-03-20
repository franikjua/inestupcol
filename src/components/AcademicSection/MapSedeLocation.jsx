import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapSedeLocation.module.css";
import Title3 from "../../utils/Title3";

const MapSedeLocation = () => {
  const [cities, setCities] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(6);

  useEffect(() => {
    Promise.all([
      fetch("/data/cities.json").then((res) => res.json()),
      fetch("/data/colombia.geo.json").then((res) => res.json()),
    ])
      .then(([cityData, geoJson]) => {
        setCities(cityData);
        setGeoData(geoJson);
      })
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  function ZoomHandler() {
    useMapEvents({
      zoomend: (e) => setZoomLevel(e.target.getZoom()),
    });
    return null;
  }

  const getColor = (tipo) => (tipo === "SEDE" ? "#FF0000" : "#0000FF");

  const onEachFeature = (feature, layer) => {
    layer.setStyle({
      fillColor: "#cccccc",
      fillOpacity: 0.5,
      weight: 1,
      color: "#333",
    });
  };

  return (
    <div className={styles.mapContainer}>
      <Title3>Presencia Nacional</Title3>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendCircle} style={{ backgroundColor: "#FF0000" }}></span>
          <span className={styles.legendText}>SEDE</span>
          <span className={styles.legendCircle} style={{ backgroundColor: "#FFFF00" }}></span>
          <span className={styles.legendText}>CREAD</span>
        </div>
      </div>

      <MapContainer 
        center={[4.5709, -74.2973]} 
        zoom={6} 
        scrollWheelZoom={true} 
        style={{ height: "80vh", width: "100vw" }}
      >
        <ZoomHandler />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {geoData && <GeoJSON data={geoData} onEachFeature={onEachFeature} />}

        {cities.map((city, index) => (
          <Marker
            key={index}
            position={[city.latitud, city.longitud]}
            icon={L.divIcon({
              className: styles.customMarker,
              html: `
                <div class="${styles.cityMarker}">
                  <div class="${styles.cityCircle}" style="background-color:${getColor(city.tipo)};"></div>
                  ${zoomLevel >= 7 ? `
                    <div class="${styles.cityInfo}" style="color:${getColor(city.tipo)};">
                      <span class="${styles.cityType}">${city.tipo}</span>
                      <span class="${styles.cityName}">${city.ciudad}</span>
                    </div>
                  ` : ""}
                </div>
              `,
              iconSize: [40, 40],
            })}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
              {city.address}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapSedeLocation;


