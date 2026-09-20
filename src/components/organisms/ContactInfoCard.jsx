import React from 'react';
import ContactInfoItem from '../molecules/ContactInfoItem';
import styles from '../../styles/Contact.module.css';

const ContactInfoCard = () => {
  return (
    <div className={styles['contact-info-card']}>
      <h2 className={styles['contact-info-card-title']}>Información de Contacto</h2>
      
      <div className={styles['contact-info-list']}>
        <ContactInfoItem 
          icon="location_on"
          iconVariant="primary"
          label="Ubicación"
          value={
            <p className={styles['contact-info-text']}>
              Av. Sarmiento 1234<br />
              Resistencia, Chaco
            </p>
          }
        />

        <ContactInfoItem 
          icon="mail"
          iconVariant="secondary"
          label="Correo Electrónico"
          value={
            <a href="mailto:hola@educarparatransformar.edu.ar" className={styles['contact-info-link']}>
              hola@educarparatransformar.edu.ar
            </a>
          }
        />

        <ContactInfoItem 
          icon="phone"
          iconVariant="tertiary"
          label="Teléfono"
          value={
            <a href="tel:+5436241234567" className={styles['contact-info-link']}>
              +54 362 4123-4567
            </a>
          }
        />
      </div>
    </div>
  );
};

export default ContactInfoCard;
