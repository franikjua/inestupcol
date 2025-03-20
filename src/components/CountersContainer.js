import React from 'react';
import Counters from './Counters';
import '../styles/CountersContainer.css';

const CountersContainer = () => {
  return (
    <div className="counters-container">
      <Counters endValue={6} label="de cada 10 Graduados cambian su realidad SOCIAL y ECONÓMICA a partir de 5 años." />
      <Counters endValue={2030} label="Estudiantes de PRIMERA GENERACIÓN que ingresan estudios universitarios." showPlus={true} />
      <Counters endValue={1} label="de cada 2 estudiantes es CIUDADANO DE REGIÓN." />
    </div>
  );
};

export default CountersContainer;
