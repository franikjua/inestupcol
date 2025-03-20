import React, { useEffect, useState } from "react";
import L from "leaflet";
import Title3 from "../../utils/Title3";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as d3 from "d3";

const StudentMap = ({ semester }) => {
  const [geoData, setGeoData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    // Cargar datos geoJSON y de estudiantes
    Promise.all([
      fetch(`/data/colombia.geo.json`).then((res) => res.json()),
      fetch(`/data/${semester}/estudent_dpto.json`).then((res) => res.json()),
    ]).then(([geoJson, students]) => {
      setGeoData(geoJson);
      setStudentData(students);
      
      const total = students.reduce((sum, d) => sum + d.students, 0);
      setTotalStudents(total);
    });
  }, [semester]);

  const getColor = (percentage) => {
    return d3.scaleThreshold()
      .domain([1, 5, 10, 15, 20])
      .range(["#d3e5ff", "#98c5ff", "#4a90e2", "#005bb5", "#003f7f"])(percentage);
  };

  const onEachFeature = (feature, layer) => {
    if (!studentData) return;
    
    const deptoName = feature.properties.NOMBRE_DPT;
    const studentInfo = studentData.find(d => d.department === deptoName);
    const students = studentInfo ? studentInfo.students : 0;
    const percentage = ((students / totalStudents) * 100).toFixed(2);
    
    layer.setStyle({ fillColor: getColor(percentage), fillOpacity: 0.7, weight: 1, color: "#fff" });
    
    layer.bindTooltip(`${deptoName}: ${students} estudiantes (${percentage}%)`, {
      permanent: false,
      direction: "top"
    });
  };

  return (
    <div>
      <Title3>Distribución de Estudiantes por Departamento ({semester})</Title3>
      <MapContainer center={[4.5, -73.0]} zoom={5} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geoData && <GeoJSON data={geoData} onEachFeature={onEachFeature} />}
      </MapContainer>
      <h4>Total de estudiantes: {totalStudents.toLocaleString()}</h4>
    </div>
  );
};

export default StudentMap;




