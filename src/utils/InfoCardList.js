import React from 'react';
import './InfoCardList.css';

const InfoCard = ({ title, description, image, index }) => {
  return (
    <div className={`info-card ${index % 2 !== 0 ? 'reverse' : ''}`}>
      {image && <img src={image} alt={title} className="info-card-image" />}
      <div className="info-card-content">
        <h3 className="info-card-title">{title}</h3>
        <p className="info-card-description">{description}</p>
      </div>
    </div>
  );
};

export default InfoCard;

