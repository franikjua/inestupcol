import React from 'react';
import Title1 from '../../utils/Title1';

const MobilitySection = ({ semester }) => {
  return (
    <section className="mobilitySection">
      <Title1>Movilidad {semester}</Title1>
      <p>Mostrando datos de Movilidades para el semestre: <strong>{semester}</strong></p>
      <ul>
        <li>Estudiantes en movilidad internacional</li>
        <li>Estudiantes en movilidad nacional</li>
        <li>Convenios de intercambio</li>
        <li></li>
        <li></li>
      </ul>
    </section>
  );
};

export default MobilitySection;
