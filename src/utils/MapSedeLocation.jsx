import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapSedeLocation.module.css";
import Title3 from "./Title3";

const MapSedeLocation = ({ citiesJsonPath, geoJsonPath, title }) => {
    const [data, setData] = useState([]);
    const [geoData, setGeoData] = useState(null);

    useEffect(() => {
        Promise.all([
            fetch(citiesJsonPath).then((res) => res.json()),
            fetch(geoJsonPath).then((res) => res.json()),
        ])
            .then(([cityData, geoJson]) => {
                setData(cityData);
                setGeoData(geoJson);
                console.log("Datos cargados:", cityData);
            })
            .catch((error) => console.error("Error loading data:", error));
    }, [citiesJsonPath, geoJsonPath]);

    const onEachFeature = (feature, layer) => {
        layer.setStyle({
            fillColor: "#cccccc",
            fillOpacity: 0.5,
            weight: 1,
            color: "#333",
        });
    };

    const getColor = (numero) => {
        if (numero <= 50) return "#FFF000";
        if (numero <= 200) return "#E9C16A";
        if (numero > 200 && numero <= 800) return "#FF8000";
        if (numero > 800 && numero <= 1000) return "#FFFF00";
        return "#32CD32";
    };

    const getCircleSize = (numero) => {
        if (numero <= 50) return 30; // Tamaño pequeño
        if (numero <= 200) return 50; // Tamaño mediano
        if (numero > 200 && numero <= 800) return 70; // Tamaño grande
        if (numero > 800) return 90; // Tamaño muy grande
        return 110; // Tamaño máximo
    };

    return (
        <div className={styles.mapslMapContainer}>
            <Title3>{title}</Title3>

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

                {geoData && <GeoJSON data={geoData} onEachFeature={onEachFeature} />}

                {data.map((item, index) => (
                    <Marker
                        key={index}
                        position={[item.latitud, item.longitud]}
                        icon={L.divIcon({
                            className: styles.mapslCustomMarker,
                            html: `
                                <div class="${styles.mapslCityMarker}">
                                    <div class="${styles.mapslCityCircle}" style="width: ${getCircleSize(item.numero)}px; height: ${getCircleSize(item.numero)}px; background-color: ${getColor(item.numero)}">
                                        <span class="${styles.mapslCityName}">${item.NOMBRE_DPT}</span>
                                        <span class="${styles.mapslCityNumber}">${item.numero}</span>
                                    </div>
                                </div>
                            `,
                            iconSize: [40, 40],
                        })}
                    >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                            {`${item.NOMBRE_DPT}: ${item.numero}`}
                        </Tooltip>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapSedeLocation;