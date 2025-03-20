import React from 'react';
import Title1 from '../../utils/Title1';
import NumberPeopleSex from './personalHuman/NumberPeopleSex';

const TalentSection = ({ semester }) => {
  return (
    <section className="talentSection">
      <Title1>Talento Humano {semester}</Title1>
      <p>Mostrando datos de Talento humano para el semestre: <strong>{semester}</strong></p>
      <ul>
      <NumberPeopleSex semester={semester} />
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
