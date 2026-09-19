import React from 'react';
import Icon from '../atoms/Icon';
import styles from '../../styles/Contact.module.css'; // Compartirá los estilos generales de Contact

/**
 * Molécula ContactInfoItem
 * Renderiza una fila de datos de contacto con un icono circular a la izquierda.
 */
const ContactInfoItem = ({
  icon,
  iconVariant = 'primary',
  label,
  value
}) => {
  return (
    <div className={styles['contact-info-item']}>
      <div className={`${styles['contact-info-icon-wrapper']} ${styles[iconVariant] || ''}`}>
        <Icon name={icon} filled={true} className="text-2xl" />
      </div>
      <div className={styles['contact-info-text-container']}>
        <h3 className={styles['contact-info-label']}>{label}</h3>
        <div className={styles['contact-info-value']}>{value}</div>
      </div>
    </div>
  );
};

export default ContactInfoItem;
