import React, { useState, useEffect } from "react";
import "../styles/Banner.css"; 
import NavBar from "./NavBar"; 
import Logo from "./Logo"; 
import SemesterSelector from "./SemesterSelector"; // ✅ Ahora se importa

const Banner = ({ selectedSemester, onSemesterChange }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`banner ${scrolled ? "scrolled" : ""}`}>
      <div className="logo-title-selector">
        <Logo />
        <div className="title">INEST</div>
        <SemesterSelector selectedSemester={selectedSemester} onChange={onSemesterChange} />
        </div>
        <div className="navbar-background">
          <NavBar />
        </div>
    </div>
  );
};

export default Banner;

