import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './images/logoinest.png';
import './App.css';
import Banner from './components/Banner';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import CountersContainer from './components/CountersContainer';

// Secciones dinámicas
import Academic from './components/AcademicSection/Academic';
import AcademicAccreditation from './components/AcademicSection/AcademicAccreditation';
import AcademicPrograms from './components/AcademicSection/AcademicPrograms';
import ProgramsInfo from './components/AcademicSection/Programs/ProgramsInfo';
import ProgramsCurrentOffered from './components/AcademicSection/Programs/ProgramsCurrentOffered';
import ProgramsOffered from './components/AcademicSection/Programs/ProgramsOffered';
import AcademicStudents from './components/AcademicSection/AcademicStudents';
import AcademicTeaching from './components/AcademicSection/AcademicTeaching';
import AcademicData from './components/AcademicSection/AcademicData';

import RSUSection from './components/RSUSection/RSUSection';
import TalentSection from './components/TalentSection/TalentSection';
import GraduatesSection from './components/GraduatesSection/GraduatesSection';
import ContinuousEducationSection from './components/ContinuousEducationSection/ContinuousEducationSection';
import MobilitySection from './components/MobilitySection/MobilitySection';

function App() {
  // Cargar el semestre desde localStorage o usar uno por defecto
  const [selectedSemester, setSelectedSemester] = useState(
    localStorage.getItem('selectedSemester') || '2024-2'
  );

  // Guardar el semestre en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('selectedSemester', selectedSemester);
  }, [selectedSemester]);

  return (
    <Router>
      <div className="App">
        <header>
          <Banner selectedSemester={selectedSemester} onSemesterChange={setSelectedSemester} />
        </header>

        <NavBar />

        <main>
          <div className="title-container">
            <div className="title-content">
              <img src={logo} alt="Logo" className="title-logo" />
              <h1>INEST</h1>
            </div>
            <h2>Indicadores Estadísticos de Responsabilidad Social</h2>
            <h3>- Universidad de Pamplona -</h3>
          </div>

          <Routes>
            <Route path="/" element={<CountersContainer />} />

            {/* Rutas Académicas */}
            <Route path="/academic" element={<Academic semester={selectedSemester} />} />
            <Route path="/academic/accreditation" element={<AcademicAccreditation semester={selectedSemester} />} />
            <Route path="/academic/programs" element={<AcademicPrograms semester={selectedSemester} />} />
            <Route path="/academic/programs/info" element={<ProgramsInfo semester={selectedSemester} />} />
            <Route path="/academic/programs/current" element={<ProgramsCurrentOffered semester={selectedSemester} />} />
            <Route path="/academic/programs/prog" element={<ProgramsOffered semester={selectedSemester} />} />
            <Route path="/academic/students" element={<AcademicStudents semester={selectedSemester} />} />
            <Route path="/academic/teaching" element={<AcademicTeaching semester={selectedSemester} />} />
            <Route path="/academic/data" element={<AcademicData semester={selectedSemester} />} />

            {/* Otras secciones */}
            <Route path="/rsu" element={<RSUSection semester={selectedSemester} />} />
            
            <Route path="/talento-humano" element={<TalentSection semester={selectedSemester} />} />
            <Route path="/graduados" element={<GraduatesSection semester={selectedSemester} />} />
            <Route path="/educacion-continua" element={<ContinuousEducationSection semester={selectedSemester} />} />
            <Route path="/movilidad" element={<MobilitySection semester={selectedSemester} />} />

            {/* Ruta para páginas no encontradas */}
            <Route path="*" element={<div>Página no encontrada</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

