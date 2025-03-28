import React from 'react';
import InfoCard from './InfoCard';
import './InfoCardList.css'; // Importa el archivo CSS

const InfoCardList = ({ cards }) => {
  return (
    <div className="info-card-list">
      {cards.map((card, index) => (
        <InfoCard key={index} {...card} />
      ))}
    </div>
  );
};

export default InfoCardList;

