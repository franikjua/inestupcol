import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Title2 from '../../utils/Title2';
import Description from '../../utils/Description';
import ProgramsInfo from './Programs/ProgramsInfo';
import ProgramsGeneral from '../../utils/ProgramsGeneral'
import ProgramsFaculty from '../../utils/ProgramsFaculty'
import MapSedesCreadPrograms from '../../utils/MapSedesCreadPrograms'
import ProgramsTd from '../../utils/ProgramsTd';


const AcademicSection = ({ semester }) => {
  const { hash } = useLocation();
  
  useEffect(() => {
    if (hash) {
      const id = hash.substring(1); // elimina el '#' del hash
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);
  return (
    <section>
        <div id="info-programs">
                <Title2>Programas</Title2>
                <Description>
                        Los programas universitarios se estructuran en tres niveles principales: pregrado, posgrado y programas tecnológicos.
                </Description>
                <ProgramsInfo semester={semester} />
        </div>
        <div id="Distribucion-programas-metodologia">
        <       ProgramsGeneral jsonDataPath={`/data/${semester}/programs/programs_general.json`}
                        title="Distribución de programas por metodologia" />
        </div>
        <div id="Distribucion-programas-facultad">
                <ProgramsFaculty jsonDataPath={`/data/${semester}/programs/programs_general.json`}
                        title="Distribución de programas por facultad" />
        </div>
        <div id="mapa-programas-sede-cread">
                <MapSedesCreadPrograms programsJsonPath={`/data/${semester}/programs/programs_sedes_general.json`}
                        title="Distribución de programas por Sede y Cread" />
        </div>
        <div id="Tabla-programas"></div>
        <ProgramsTd jsonDataPath={`/data/${semester}/programs/programs_general.json`}
                title="Tabla de programas" />
       
        

        
    </section>
  );
};

export default AcademicSection;