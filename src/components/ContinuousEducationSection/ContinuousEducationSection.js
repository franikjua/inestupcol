import React from 'react';
import Title1 from '../../utils/Title1';

const ContinuousEducationSection = ({ semester }) => {
  return (
    <section className="continuousEducationSection">
      <Title1>Educacion Continua {semester}</Title1>
      <p>Mostrando datos de Educacion Continua para el semestre: <strong>{semester}</strong></p>
      <ul>
        <li>Programas de Educación Continua</li>
        <li>Resumen de Programas Ofertados</li>
      </ul>
    </section>
  );
};

export default ContinuousEducationSection;
