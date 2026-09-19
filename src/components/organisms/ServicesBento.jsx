import React from 'react';
import BentoCard from '../molecules/BentoCard';
import Badge from '../atoms/Badge';
import styles from '../../styles/organisms/ServicesBento.module.css';

const ServicesBento = ({
  onMindfulnessClick = () => alert('Inscripción al taller realizada con éxito. ¡Te esperamos!'),
}) => {
  return (
    <section className={styles['services-section']}>
      <h2 className={styles['services-section-title']}>Nuestros Servicios de Apoyo</h2>
      
      <div className={styles['services-bento-grid']}>
        <BentoCard 
          spanColumns={2}
          bgLow={true}
          icon="psychology"
          iconVariant="primary"
          title="Servicio de Apoyo Estudiantil (SAE)"
          description="Espacios de escucha activa, orientación psicológica y acompañamiento académico para superar cualquier desafío personal o educativo."
          linkText="Conoce al equipo"
          linkHref="#sae-team"
          className="group"
        />

        <BentoCard 
          spanColumns={1}
          icon="medical_services"
          iconVariant="secondary"
          title="Enfermería Escolar"
          description="Atención de primeros auxilios, seguimiento de tratamientos y promoción de la salud física en el campus."
          statusFooter={
            <Badge 
              text="Abierto ahora • 8:00 a 16:00" 
              variant="secondary" 
              animated={true} 
            />
          }
        />

        <BentoCard 
          spanColumns={1}
          icon="restaurant_menu"
          iconVariant="tertiary"
          title="Asesoría Nutricional"
          description="Consejos para una alimentación balanceada que potencie tu energía y concentración en clases."
        />

        <BentoCard 
          spanColumns={2}
          bgLow={true}
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuBDSAGXAawjefJfjPoQG_aaopUDiHVdwgIIaM80_CKU7K3QVZ69CGbmit0-DvRNAth4yj91b7E-Psy-NVfQJtiEwVhfMoQCPhBkB83d4GSlvuRZq924NRMRLO__kAu_PgxqtcpOtjNxIUJo7yKnByVnJECeR8GIMmLg4CV2amoGHnac4KRYJea2OVGYafhpHQHkzZTejwNdU3M1qxuZRMHfDbyDxo7ZhtcdLdhhGXwPxHGjoD-WkfIoqs7_ZRTG7FTxEKE5lgP5nLU"
          badgeText="Novedad"
          badgeVariant="tertiary"
          title="Talleres de Mindfulness y Manejo del Estrés"
          description="Sesiones semanales diseñadas para enseñarte técnicas prácticas de relajación y enfoque antes de los exámenes."
          buttonText="Inscribirse al próximo taller"
          onButtonClick={onMindfulnessClick}
        />
      </div>
    </section>
  );
};

export default ServicesBento;
