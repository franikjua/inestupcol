import React from 'react';
import Title1 from '../../utils/Title1';

const GraduatesSection = ({ semester }) => {
  return (
    <section className="graduatesSection">
      <Title1>Graduados {semester}</Title1>
      <p>Mostrando datos de Graduados para el semestre: <strong>{semester}</strong></p>
      <ul>
        <li>Facultad</li>
        <li>Graduados</li>
        <li>Genero</li>
      </ul>
    </section>
  );
};

export default GraduatesSection;
