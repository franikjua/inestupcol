import React, { useEffect, useState } from 'react';
import Matriculates from './Matriculates';

const MainComponent = () => {
  const [jsonData, setJsonData] = useState({});
  const jsonFiles = [
    'matriculados',
    'id_sede_cread',
    'id_dpto',
    'id_pais',
    'id_metodologia',
    'id_formacion',
    'id_nivel',
    'id_facultad',
    'snies',
    'id_zona',
    'estrato',
    'edades'
  ];

  useEffect(() => {
    const loadJsonFiles = async () => {
      try {
        const data = {};
        for (let file of jsonFiles) {
          const response = await fetch(`/data/${file}.json`);
          const json = await response.json();
          data[file] = json;
        }
        setJsonData(data);
      } catch (error) {
        console.error('Error cargando archivos JSON:', error);
      }
    };
    loadJsonFiles();
  }, []);

  return (
    <div>
      {Object.keys(jsonData).length === jsonFiles.length ? (
        <Matriculates jsonData={jsonData} />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default MainComponent;
