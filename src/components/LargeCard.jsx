import React from 'react';
import styles from '../styles/LargeCard.module.css';

const LargeCard = ({ image, title, subtitle, label, buttonText, onClick }) => {
  return (
    <article className={styles['large-card']} onClick={onClick} onKeyUp={onClick}>
      {image && (
        <img
          loading="lazy"
          alt={title}
          className={styles['large-card-image']}
          src={image}
        />
      )}
      <div className={styles['large-card-overlay']}></div>

      <div className={styles['large-card-content']}>
        {label && <span className={styles['large-card-label']}>{label}</span>}
        {title && <h2 className={styles['large-card-title']}>{title}</h2>}
        {subtitle && <p className={styles['large-card-subtitle']}>{subtitle}</p>}

        {buttonText && (
          <button
            className={styles['large-card-button']}
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            {buttonText}{' '}
            <span className={`material-symbols-outlined ${styles['icon']}`}>→</span>
          </button>
        )}
      </div>
    </article>
  );
};

export default LargeCard;
