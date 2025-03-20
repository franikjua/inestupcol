import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Title2 from '../../utils/Title2';
import Description from '../../utils/Description';
import NumberPeopleSex from '../../utils/NumberPeopleSex';
import StudentFaculty from '../../utils/StudentFaculty';
import MapSedeLocation from '../../utils/MapSedeLocation';
import DtEnrolledStudents from '../../utils/DtEnrolledStudents';

const Academicstudents = ({ semester }) => {
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
        <div id="estudiantes-info">       
                <Title2>Estudiantes </Title2>
                <Description>
                        La diversidad de nuestra comunidad estudiantil es un factor fundamental para comprender su riqueza y complejidad. En este informe, exploramos datos que revelan la heterogeneidad de nuestros estudiantes, desde su nivel de estudios (pregrado y posgrado) y procedencia, hasta su condición socioeconómica y modalidad de grado. Asimismo, se analizan datos específicos de programas como Trabajo Social e Inclusión Social, y se complementa con información académica relevante.
                </Description>
        </div>
        <div id="estudiantes-matriculados-Genero"> 
                <NumberPeopleSex jsonDataPath={`/data/${semester}/programs/matriculados_programas.json`}
                        title="Estudiantes matriculados por Genero" />
        </div>
        <div id="estudiantes-matriculados-facultad">        
                <StudentFaculty jsonDataPath={`/data/${semester}/programs/matriculados_programas.json`}
                        title="Estudiantes matriculados por Facultad" />
        </div>
        <div id="estudiantes-departamento-procedencia">
                <MapSedeLocation
                        citiesJsonPath={`/data/${semester}/programs/dpto_student.json`} 
                        geoJsonPath="/data/colombia.geo.json"
                        title="Distribución de Estudiantes por Departamento de Procedencia"
                />
        </div>
        <div id="tabla-estudiantes">            
        <DtEnrolledStudents jsonDataPath={`/data/${semester}/programs/matriculados_programas.json`} 
                title="Tabla de Estudiantes matriculados" />

        </div>

        
    </section>
  );
};

export default Academicstudents;