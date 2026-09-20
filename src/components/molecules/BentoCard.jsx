import React from 'react';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import styles from '../../styles/molecules/BentoCard.module.css';

/**
 * Componente BentoCard (Molécula)
 * Representa una tarjeta flexible adaptada al Bento Grid de servicios de Bienestar.
 */
const BentoCard = ({
  title,
  description,
  icon,
  iconVariant = 'primary',
  badgeText,
  badgeVariant = 'primary',
  animatedBadge = false,
  spanColumns = 1,
  bgLow = false,
  image,
  linkText,
  linkHref = '#',
  buttonText,
  onButtonClick,
  statusFooter,
  className = ''
}) => {
  // Determinar clases de la tarjeta
  const cardClasses = [
    styles['bento-card'],
    spanColumns === 2 ? styles['span-2'] : '',
    bgLow ? styles['bg-low'] : '',
    image ? styles['horizontal'] : '',
    className
  ].filter(Boolean).join(' ');

  // Renderizar tarjeta horizontal (ej. Talleres con imagen lateral)
  if (image) {
    return (
      <div className={cardClasses}>
        <div className={styles['bento-card-image-wrapper']}>
          <img
            loading="lazy"
            src={image}
            alt={title}
            className={styles['bento-card-image']}
          />
        </div>
        <div className={styles['bento-card-horizontal-content']}>
          {badgeText && (
            <Badge
              text={badgeText}
              variant={badgeVariant}
              animated={animatedBadge}
              className="mb-3"
            />
          )}
          <h3 className={styles['bento-card-title']}>{title}</h3>
          <p className={styles['bento-card-description']}>{description}</p>

          {buttonText && (
            <button onClick={onButtonClick} className={styles['bento-card-btn-action']}>
              {buttonText}
              <Icon name="chevron_right" className="text-sm" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Renderizar tarjeta vertical estándar (ej. SAE, Enfermería, Nutrición)
  return (
    <div className={cardClasses}>
      {/* Fondo decorativo con degradado para tarjetas especiales */}
      {spanColumns === 2 && <div className={styles['bento-card-bg-gradient']} />}

      <div className={styles['bento-card-header']}>
        {icon && (
          <div className={`${styles['bento-card-icon-wrapper']} ${styles[iconVariant] || ''}`}>
            <Icon name={icon} filled={true} className="text-3xl" />
          </div>
        )}
        <h3 className={styles['bento-card-title']}>{title}</h3>
        <p className={styles['bento-card-description']}>{description}</p>
      </div>

      {/* Pie de página condicional */}
      {linkText && (
        <div className={styles['bento-card-footer']}>
          <a href={linkHref} className={styles['bento-card-link']}>
            {linkText}
            <Icon name="arrow_forward" className="text-sm" />
          </a>
        </div>
      )}

      {statusFooter && (
        <div className={styles['bento-card-status-footer']}>
          {statusFooter}
        </div>
      )}
    </div>
  );
};

export default BentoCard;
