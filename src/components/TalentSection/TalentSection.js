import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Title1 from '../../utils/Title1';
import Description from '../../utils/Description';
import DocentesSex from '../../utils/DocentesSex'


const TalentSection = ({ semester }) => {
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
        <Title1>Talento Humano {semester}</Title1>
        <Description>
        La diversidad de nuestra comunidad docente es un pilar esencial para entender la calidad y el impacto de nuestra institución. En este informe, se examinan datos que reflejan la variedad de perfiles del cuerpo profesoral, desde su formación académica y experiencia profesional, hasta su vinculación contractual y áreas de especialización. Además, se incluyen análisis sobre la participación en proyectos de investigación, la producción académica y el compromiso con la inclusión y la responsabilidad social, brindando así una visión integral de su aporte al desarrollo académico e institucional.
        </Description>
      </div>
      
      <div id="docentes-sexo">
        <DocentesSex jsonDataPath={`/data/${semester}/ht/docentes.json`}
        title="Distribución docentes por genero" />
      </div>

     
      
      <p>Mostrando datos de Talento humano para el semestre: <strong>{semester}</strong></p>
      <ul>
      
        <li>Grado de Escolaridad</li>
        <li>Docentes</li>
        <li>Edad docente</li>
        <li>Escalafon Profesional</li>
        <li>Directivos</li>

      </ul>
    </section>
  );
};

export default TalentSection;
