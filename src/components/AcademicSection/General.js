import React from 'react';
import CertificationsChart from './charts/CertificationsChart';
import ProgramsChart from './charts/ProgramsChart';

const General = ({ semester }) => {
  return (
    <div>
      <h2>Certificaciones</h2>
      <CertificationsChart semester={semester} />
      <h2>Programas</h2>
      <ProgramsChart semester={semester} />
    </div>
  );
};

export default General;

