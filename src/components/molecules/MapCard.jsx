import React from 'react';
import Icon from '../atoms/Icon';
import styles from '../../styles/Contact.module.css';

const MapCard = ({
  locationName = "Av. Sarmiento 1234, Resistencia, Chaco",
  mapsUrl = "https://maps.google.com/?q=Av.+Sarmiento+1234,+Resistencia,+Chaco"
}) => {
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(locationName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={`${styles['contact-map-card']} group`}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        title={`Mapa con la ubicación de ${locationName}`}
        className={styles['contact-map-iframe']}
      />
      <div className={styles['contact-map-overlay']} />
      <a 
        href={mapsUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles['contact-map-badge']}
        aria-label={`Ver ubicación de ${locationName} en Google Maps`}
      >
        <Icon name="map" className="text-sm" />
        <span className={styles['contact-map-badge-text']}>Ver en Google Maps</span>
      </a>
    </div>
  );
};

export default MapCard;
