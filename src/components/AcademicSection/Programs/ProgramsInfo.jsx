import React, { useState, useEffect } from "react";
import styles from "./ProgramsInfo.module.css";

const ProgramsInfo = ({ semester }) => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetch(`/data/${semester}/programs/programs_information.json`)
      .then((response) => response.json())
      .then((data) => setPrograms(data))
      .catch((error) => console.error("Error cargando los datos:", error));
  }, [semester]);

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Información Programas</h2>
      <div className={styles.programList}>
        {programs.map((program, index) => (
          <article key={index} className={styles.programCard}>
            {/* Bloque 1: Imagen */}
            <div className={styles.imageContainer}>
              <img
                src={require("../../../images/virreteSf.png")} 
                alt="Imagen representativa"
                className={styles.image}
              />
            </div>

            {/* Bloque 2: Programa y Descripción */}
            <div className={styles.programDetails}>
              <h3 className={styles.programTitle}>{program.programa}</h3>
              <p className={styles.description}>{program.descripcion}</p>
            </div>

            {/* Bloque 3: Modalidades */}
            <div className={styles.stats}>
              {program.presencial !== "0" && (
                <div className={styles.statItem}>
                  <strong>{program.presencial}</strong>
                  <span>Presencial</span>
                </div>
              )}
              {program.distancia !== "0" && (
                <div className={styles.statItem}>
                  <strong>{program.distancia}</strong>
                  <span>Distancia</span>
                </div>
              )}
              {program.virtual !== "0" && (
                <div className={styles.statItem}>
                  <strong>{program.virtual}</strong>
                  <span>Virtual</span>
                </div>
              )}
            </div>

            {/* Bloque 4: Total de Programas */}
            <div className={styles.totalContainer}>
                <p className={styles.totalLabel}>Total de Programas</p>
                <p className={styles.totalCount}>{parseInt(program.presencial) + parseInt(program.distancia) + parseInt(program.virtual)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProgramsInfo;


