import React from 'react';
import InfoCard from './InfoCardList';
import './InfoCard.css';

const InfoCardList = ({ cards }) => {
  return (
    <div className="info-cards-wrapper">
      {cards.reduce((rows, card, index) => {
        if (index % 2 === 0) {
          rows.push([card]);
        } else {
          rows[rows.length - 1].push(card);
        }
        return rows;
      }, []).map((row, rowIndex) => (
        <div className="info-cards-row" key={rowIndex}>
          {row.map((card, index) => (
            <InfoCard
              key={index}
              title={card.title}
              description={card.description}
              image={card.image}
              reverse={index % 2 !== 0} // Alterna la posición de la imagen
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default InfoCardList;

