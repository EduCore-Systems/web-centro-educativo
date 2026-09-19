import React from 'react';
import Navbar from '../components/Navbar';
import ContactInfoCard from '../components/organisms/ContactInfoCard';
import MapCard from '../components/molecules/MapCard';
import ContactForm from '../components/organisms/ContactForm';
import styles from '../styles/Contact.module.css';

const Contact = () => {
  return (
    <div className={styles['contact-page-container']}>
      <Navbar />
      
      <main className={styles['contact-main-content']}>
        <div className={styles['contact-header']}>
          <h1 className={styles['contact-title']}>Estamos aquí para ayudarte</h1>
          <p className={styles['contact-subtitle']}>
            Conéctate con nosotros para cualquier consulta, inscripción o simplemente para conocer más sobre nuestro enfoque educativo vibrante en Resistencia.
          </p>
        </div>

        <div className={styles['contact-grid']}>
          <div className={styles['contact-left-col']}>
            <ContactInfoCard />
            <MapCard />
          </div>

          <div className={styles['contact-right-col']}>
            <ContactForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;

