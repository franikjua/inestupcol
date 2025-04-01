import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavBar.css';
import { path } from 'd3';

const menuItems = [
  {
    name: 'ACADEMICO',
    subMenus: [
      {
        name: 'Acreditación',
        items: [
          { label: 'Información', path: '/academic/accreditation#info-acreditaciones' },
          { label: 'Distribución', path: '/academic/accreditation#distribucion-acreditaciones' },
          { label: 'Facultades', path: '/academic/accreditation#Facultades-Programas-Acreditados' },
          { label: 'Tabla de datos', path: '/academic/accreditation#Tabla-Acreditaciones' }
        ]
      },
      {
        name: 'Programas',
        items: [          
          { label: 'Información', path: '/academic/programs#info-programs' },
          { label: 'metodología', path: '/academic/programs#Distribucion-programas-metodologia' },
          { label: 'Facultades', path: '/academic/programs#Distribucion-programas-facultad' },
          { label: 'Mapa sedes', path: '/academic/programs#mapa-programas-sede-cread' },
          { label: 'Tabla de datos', path: '/academic/programs#Tabla-programas' }
        ]
      },
      {
        name: 'Estudiantes',
        items: [
          { label: 'intro matriculados', path: '/academic/students#estudiantes-info' },
          { label: 'Genero', path: '/academic/students#estudiantes-matriculados-Genero' },
          { label: 'Facultad', path: '/academic/students#estudiantes-matriculados-facultad' },
          { label: 'Mapa dpto pais', path: '/academic/students#estudiantes-dpto-pais-procedencia' },
          { label: 'Tabla de datos', path: '/academic/students#tabla-estudiantes' }
        ]
      },
      {
        name: 'Datos Académicos',
        items: [
          { label: 'Doble Programa', path: '/academic/data' },
          { label: 'Datos de Ingreso y Matrícula', path: '/academic/data' }
        ]
      }
    ]
  },
  {
    name: 'RSU-Responsabilidad Social Universitaria',
    subMenus: [
      {
        name: null,
        items: [
          { label: 'Trabajo Social', path: '/rsu' },
          { label: 'Inclusión Social', path: '/rsu' }
        ]
      }
    ]
  },
  {
    name: 'TALENTO HUMANO',
    subMenus: [
      {
        name: null,
        items: [
          { label: 'Descripción', path: '/talento-humano/#descripcion-docente'},
          { label: 'Datos de Personal', path: '/talento-humano' },
          { label: 'Genero', path: '/talento-humano#docentes-sexo'},
          { label: 'Escolaridad', path: '/talento-humano#docentes-escolaridad-sexo' }
        ]
      }
    ]
  },
  {
    name: 'GRADUADOS',
    subMenus: [
      {
        name: null,
        items: [{ label: 'Facultad', path: '/graduados' }]
      }
    ]
  },
  {
    name: 'EDUCACIÓN CONTINUA',
    subMenus: [
      {
        name: null,
        items: [{ label: 'Programas Educación Continua', path: '/educacion-continua' }]
      }
    ]
  },
  {
    name: 'MOVILIDAD',
    subMenus: [
      {
        name: null,
        items: [{ label: 'Nacionales', path: '/movilidad' }]
      }
    ]
  }
];

const NavBar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  //const [activeSubMenu, setActiveSubMenu] = useState(null);

  return (
    <nav className="navbar">
      {menuItems.map((menu) => (
        <div
          className="nav-item"
          key={menu.name}
          onMouseEnter={() => setActiveMenu(menu.name)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <button className="nav-button">{menu.name}</button>
          {activeMenu === menu.name && (
            <div className="dropdown-menu">
              {menu.subMenus.map((subMenu, index) => (
                <div className="sub-menu-container" key={index}>
                  {subMenu.name && <span className="sub-menu-title">{subMenu.name}</span>}
                  <ul>
                    {subMenu.items.map((item, idx) => (
                      <li key={idx}>
                        <Link to={item.path} className="nav-link">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default NavBar;

// Aquí el código de la Navbar.js se encuentra en la carpeta components/NavBar.js, en el proyecto inest-indicadores.

