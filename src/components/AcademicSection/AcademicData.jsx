import React from 'react';
import Title2 from '../../utils/Title2';
import Description from '../../utils/Description';

const AcademicData = ({ semester }) => {
  return (
    <section>        
        <Title2>Datos Académicos</Title2>
        <Description>
        El análisis del ingreso y la matrícula de estudiantes es fundamental para comprender la trayectoria académica y el perfil de nuestra población estudiantil. En este informe, se detallan datos clave como el promedio de ingreso, las transferencias (internas y externas), el promedio acumulado, su distribución, la modalidad académica y el semestre de grado, con el objetivo de ofrecer una visión completa de la situación actual.
        </Description>
        {/*<ProgramsInfo semester={semester} />*/}

        
    </section>
  );
};

export default AcademicData;