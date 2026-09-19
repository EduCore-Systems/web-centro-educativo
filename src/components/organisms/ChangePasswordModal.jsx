import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../atoms/Icon';
import styles from '../../styles/organisms/ChangePasswordModal.module.css';

const ChangePasswordModal = () => {
  const { user, changePassword, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Solamente mostrar el modal si el usuario está autenticado y tiene pendiente el cambio de contraseña
  if (!user || !user.mustChangePassword) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(newPassword);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles['change-password-overlay']}>
      <div className={styles['change-password-modal']}>
        
        {/* Header Icon */}
        <div className={styles['modal-icon-container']}>
          <div className={`${styles['modal-icon-circle']} ${success ? styles['success'] : styles['pending']}`}>
            <Icon name={success ? 'check_circle' : 'lock_reset'} className="text-3xl" />
          </div>
        </div>

        {success ? (
          <div className={styles['modal-content-container']}>
            <h2 className={styles['modal-title']}>¡Contraseña Actualizada!</h2>
            <p className={styles['modal-description']}>
              Tu contraseña ha sido actualizada con éxito. Ya puedes comenzar a utilizar la plataforma con tus nuevas credenciales.
            </p>
            <div className={styles['modal-actions-group']}>
              <button
                onClick={() => window.location.reload()}
                className={styles['btn-modal-success']}
              >
                Comenzar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles['modal-form']}>
            <div className={styles['form-header-group']}>
              <h2 className={styles['modal-title']}>Actualizar Contraseña</h2>
              <p className={styles['modal-description']}>
                Has iniciado sesión con tu contraseña temporal (DNI). Por motivos de seguridad, debes establecer una nueva contraseña para continuar.
              </p>
            </div>

            <div className={styles['form-inputs-group']}>
              <div className={styles['input-field-group']}>
                <label className={styles['input-label']}>Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles['modal-input']}
                  required
                />
              </div>

              <div className={styles['input-field-group']}>
                <label className={styles['input-label']}>Confirmar Contraseña</label>
                <input
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles['modal-input']}
                  required
                />
              </div>
            </div>

            {error && (
              <p className={styles['modal-error-message']}>
                {error}
              </p>
            )}

            <div className={styles['modal-actions-group']}>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles['btn-modal-primary']}
              >
                {isSubmitting ? 'Guardando...' : 'Cambiar Contraseña'}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className={styles['btn-modal-secondary']}
              >
                Cerrar Sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
