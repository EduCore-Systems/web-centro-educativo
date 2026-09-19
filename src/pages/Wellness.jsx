import React from 'react';
import Navbar from '../components/Navbar';
import WellnessHero from '../components/organisms/WellnessHero';
import ServicesBento from '../components/organisms/ServicesBento';
import styles from '../styles/Wellness.module.css';

const Wellness = () => {
  return (
    <div className={styles['wellness-page-container']}>
      <Navbar />
      <main className={styles['wellness-main-content']}>
        <WellnessHero 
          onScheduleClick={() => alert('¡Redireccionando al sistema de turnos de Bienestar!')}
          onEmergencyClick={() => alert('Llamando a la línea de emergencias médicas del campus: +54 362 4XXXXXX')}
        />

        <ServicesBento />
      </main>
    </div>
  );
};

export default Wellness;

