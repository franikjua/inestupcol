import React from 'react';
import '../styles/Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content"> {/* Agrupa el texto y los iconos */}
        <div className="contact-info">
          <p>Vicerrectoría de Bienestar y Extensión</p>
          <p>Email: <a href="mailto:viceextension@unipamplona.edu.co">viceextension@unipamplona.edu.co</a></p>
        </div>
        <div className="social-icons">
          <a href="https://www.facebook.com/unipamplona" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faFacebook} size="2x" />
          </a>
          <a href="https://www.instagram.com/unipamplona" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faInstagram} size="2x" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
