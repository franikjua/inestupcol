import React from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para la navegación
import "../styles/Logo.css";
import logo from '../images/logoinest.png'; // Importa la imagen

const Logo = () => {
  return (
    <Link to="/" className="logo-link"> {/* Hace que el logo sea un enlace */}
      <img src={logo} alt="INEST Logo" className="logo-img" />
    </Link>
  );
};

export default Logo;
