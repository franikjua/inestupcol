import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Title2 from '../../utils/Title2';
import Description from '../../utils/Description';
import NumberPeopleSex from '../../utils/NumberPeopleSex';
import DocentesEscolaridad from '../../utils/DocentesEscolaridad';

const AcademicTeaching = ({ semester }) => {
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
      <div id="descripcion-docente">
        <Title2>Docentes </Title2>
        <Description>
        La diversidad de nuestra comunidad docente es un pilar esencial para entender la calidad y el impacto de nuestra institución. En este informe, se examinan datos que reflejan la variedad de perfiles del cuerpo profesoral, desde su formación académica y experiencia profesional, hasta su vinculación contractual y áreas de especialización. Además, se incluyen análisis sobre la participación en proyectos de investigación, la producción académica y el compromiso con la inclusión y la responsabilidad social, brindando así una visión integral de su aporte al desarrollo académico e institucional.
        </Description>
      </div>            
        
      <NumberPeopleSex jsonDataPath={`/data/${semester}/programs/number_teaching.json`} />
        {/*<MapSedeLocation
                citiesJsonPath={`/data/${semester}/programs/dpto_student.json`} 
                geoJsonPath="/data/colombia.geo.json"
                title="Distribución de Estudiantes por Departamento de Procedencia"
        />*/}
      <div id="docentes-escolaridad-sexo">
        <DocentesEscolaridad jsonDataPath={`/data/${semester}/ht/docentes.json`}
        title="Distribución Genero por Escolaridad" />
        </div>
        {/*<ProgramsInfo semester={semester} />*/}

        
    </section>
  );
};

export default AcademicTeaching;