import React from 'react';
import Title1 from '../../utils/Title1';

const RSUSection = ({ semester }) => {
  return (
    <section className="rsu-section">
      <Title1>Responsabilidad Social Universitaria {semester}</Title1>
      <p>Mostrando datos de RSU para el semestre: <strong>{semester}</strong> </p>
      <ul>
        <li>Proyectos de RSU</li>
        <li>Impacto en la comunidad</li>
        <li>Colaboraciones sociales</li>
      </ul>
    </section>
  );
};

export default RSUSection;
