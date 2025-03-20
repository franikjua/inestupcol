import React from 'react';
import Title2 from '../../utils/Title2';
import Description from '../../utils/Description';
import NumberPeopleSex from '../../utils/NumberPeopleSex';
import MapSedeLocation from '../../utils/MapSedeLocation';

const AcademicTeaching = ({ semester }) => {
  return (
    <section>        
        <Title2>Docentes </Title2>
        <Description>
        La diversidad de nuestra comunidad docente es un pilar esencial para entender la calidad y el impacto de nuestra institución. En este informe, se examinan datos que reflejan la variedad de perfiles del cuerpo profesoral, desde su formación académica y experiencia profesional, hasta su vinculación contractual y áreas de especialización. Además, se incluyen análisis sobre la participación en proyectos de investigación, la producción académica y el compromiso con la inclusión y la responsabilidad social, brindando así una visión integral de su aporte al desarrollo académico e institucional.
        </Description>
        <NumberPeopleSex jsonDataPath={`/data/${semester}/programs/number_teaching.json`} />
        <MapSedeLocation
                citiesJsonPath={`/data/${semester}/programs/dpto_student.json`} 
                geoJsonPath="/data/colombia.geo.json"
                title="Distribución de Estudiantes por Departamento de Procedencia"
            />

        {/*<ProgramsInfo semester={semester} />*/}

        
    </section>
  );
};

export default AcademicTeaching;