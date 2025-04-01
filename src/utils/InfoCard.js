import React from 'react';
import './InfoCard.css';

const InfoCard = ({ title, description, image, reverse }) => {
  return (
    <div className="info-card">
      <h3>{title}</h3>
      <div className="content-container" style={{ flexDirection: reverse ? 'row-reverse' : 'row' }}>
        <img src={image} alt={title} />
        <p>{description}</p>
      </div>
    </div>
  );
};

export default InfoCard;

