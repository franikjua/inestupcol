import React from 'react';
import '../../styles/Title.css';

const Title = ({ title, subtitle, description }) => {
  return (
    <div className="title-container">
      <h1 className="main-title">{title}</h1>
      <h2 className="subtitle">{subtitle}</h2>
      <h3 className="description">{description}</h3>
    </div>
  );
};

export default Title;
