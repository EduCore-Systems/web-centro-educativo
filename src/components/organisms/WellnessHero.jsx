import React from 'react';
import Badge from '../atoms/Badge';
import Icon from '../atoms/Icon';
import styles from '../../styles/organisms/WellnessHero.module.css';


const WellnessHero = ({
  badgeText = "Tu Salud Importa",
  description = "En Educar para Transformar, creemos que un estudiante feliz y saludable es la clave para un aprendizaje significativo. Nuestro equipo está aquí para apoyarte en cada paso.",
  imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDG1jIZyVztod0W8PK69_ZZFZ3NyLVMkAOYCqZ4qkYB7sW2N996WMUdassqCQfZFn22zAl5dJ6f8ZwE6AMakHGmhXig2p5eM0Z7c4o2hATDYGIEwSuRZoENUNPOn9i43SYyQKXWN8WsUg0tShkMv9M8-OqG1xmVcfCApTmPdpw31QVuqjgbxto9IcsH-qho2ZUeGxdGX9FBmTfcDgn_0L-BhcINIqyXe3PFwP9ypEalV8Yhh3rPCYvyE7jpAaPaD0E5Z8VUJqCL2Lw",
  onScheduleClick = () => console.log('Agendar Cita clicked'),
  onEmergencyClick = () => console.log('Emergencia clicked')
}) => {
  return (
    <section className={styles['wellness-hero']}>
      <div className={styles['hero-decorator-1']} />
      <div className={styles['hero-decorator-2']} />

      <div className={styles['wellness-hero-content']}>
        <Badge text={badgeText} variant="secondary" className="mb-4" />

        <h1 className={styles['wellness-hero-title']}>
          Cuidando el <span className={styles['text-gradient']}>Bienestar</span> de
          Nuestra Comunidad
        </h1>

        <p className={styles['wellness-hero-description']}>{description}</p>

        <div className={styles['wellness-hero-actions']}>
          <button className={styles['hero-btn-primary']} onClick={onScheduleClick}>
            <Icon name="calendar_month" className="text-xl" />
            <span>Agendar Cita</span>
          </button>

          <button className={styles['hero-btn-secondary']} onClick={onEmergencyClick}>
            <Icon name="call" className="text-xl" />
            <span>Emergencias</span>
          </button>
        </div>
      </div>

      <div className={styles['wellness-hero-image-container']}>
        <img
          loading="lazy"
          src={imageUrl}
          alt="Estudiantes sonriendo en el campus"
          className={styles['wellness-hero-image']}
        />
      </div>
    </section>
  );
};

export default WellnessHero;
