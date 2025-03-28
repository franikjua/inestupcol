import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Title1 from '../../utils/Title1';
import Title2 from '../../utils/Title2';
import Description from '../../utils/Description';
import InfoCardList from '../../utils/InfoCardList';

import ProgramsAcredited from '../../utils/ProgramsAcredited';
import ProgramsAcreditedFaculty from '../../utils/ProgramsAcreditedFaculty';
import ProgramsTdAcredited from '../../utils/ProgramsTdAcredited';

const infoCardsData1 = [
  {
    title: "Acreditación Internacional:EQUAA & ENAEE",
    description: " La Universidad de Pamplona, con la Acreditación Internacional EQUAA-Education Quality Accreditation Agency y ENAEE-European Network for Accreditation of Engineering Educatio, garantiza la calidad de sus programas, abriendo puertas globales a estudiantes y graduados. Este reconocimiento impulsa la investigación, la extensión y la internacionalización, facilitando su movilidad y desarrollo profesional.",
    image: require('../../images/logo_acre_internacional.png'),
    reverse: false,
  },
  {
    title: "Acreditación de Alta Calidad: CNA",
    description: "La Universidad de Pamplona, acreditada en Alta Calidad por el CNA-Consejo Nacional de Acreditación, fundamentada bajo los principios de integralidad, calidad y excelencia. Ofrece una formación integral que se distingue por su calidad académica, infraestructura de vanguardia, gestión eficiente, impacto social positivo y resultados sobresalientes. Contribuyendo al mejoramiento del sistema de educación superior colombiano y de las instituciones que lo integran para aportar al desarrollo económico, social, cultural, tecnológico y ambiental. ",
    image: require('../../images/logo_acre_alta_calidad.png'),
    reverse: true,
  },
];
const infoCardsData2 = [
  {
    title: "Registro Calificado: MEN",
    description: "Los programas con Registro Calificado del MEN-Ministerio de Educación Nacional, garantiza a sus estudiantes una formación de excelencia. Esto se traduce en un plan de estudios pertinente, infraestructura moderna, profesores expertos, recursos educativos completos y un sistema de seguimiento personalizado para su éxito académico.",
    image: require('../../images/logo_MEN_reg_calificado.png'),
    reverse: false,
  },
  {
    title: "Acreditación No discriminación",
    description: "La Universidad de Pamplona, acreditada por el Ministerio del Interior e ICONTEC con el sello de No Discriminación, reafirma su compromiso con la inclusión y la formación de profesionales íntegros, que promueven la inclusión y la equidad en todos los ámbitos.",
    image: require('../../images/sello_no_discriminacion.png'),
    reverse: true,
  },
];

const AcademicAccreditation = ({ semester }) => {
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
      <Title1>ACADÉMICO {semester}</Title1>
      <div id="info-acreditaciones">
        <Title2>Aseguramiento de la Calidad</Title2>
        <Description>
        Las Certificaciones son el instrumento del Sistema de Aseguramiento de la Calidad de la Educación Superior, mediante el cual se verifica el cumplimiento de las condiciones de calidad por parte de las instituciones de educación superior. Todos nuestros programas tienen en primera instancia Registro Calificado.
        </Description>
        <InfoCardList cards={infoCardsData1} />
        <InfoCardList cards={infoCardsData2} />
      </div>

      {/* Sección para "Distribución de Acreditaciones" */}
      <div id="distribucion-acreditaciones">
        <ProgramsAcredited 
          jsonDataPath={`/data/${semester}/programs/programs_acreditados.json`}
          title="Distribución de Acreditaciones" 
        />
      </div>

      {/* Sección para "Facultades y Programas Acreditados" */}
      <div id="Facultades-Programas-Acreditados">
        <ProgramsAcreditedFaculty 
          jsonDataPath={`/data/${semester}/programs/programs_acreditados.json`}
          title="Facultades y Programas Acreditados" 
        />
      </div>

      {/* Sección para "Tabla Acreditación" */}
      <div id="Tabla-Acreditaciones">
        <ProgramsTdAcredited 
          jsonDataPath={`/data/${semester}/programs/programs_acreditados.json`}
          title="Tabla Acreditación" 
        />
      </div>
    </section>
  );
};

export default AcademicAccreditation;

