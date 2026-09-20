import React from 'react';
import Icon from '../../atoms/Icon';

const AdminEditProfileModal = ({ editingUser, onClose, onChangeField, onSubmit }) => {
  if (!editingUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-8 animate-scale-in text-left">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h3 className="font-headline text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Icon name="edit" className="text-orange-500" />
            <span>
              Editar {editingUser.type === 'student' ? 'Estudiante' :
                editingUser.type === 'parent' ? 'Tutor' : 'Personal'}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors cursor-pointer border-none"
          >
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {editingUser.type === 'student' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  value={editingUser.fields.nombre || ''}
                  onChange={(e) => onChangeField('nombre', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">DNI</label>
                <input
                  type="text"
                  value={editingUser.fields.dni || ''}
                  onChange={(e) => onChangeField('dni', e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={editingUser.fields.fechaNacimiento || ''}
                  onChange={(e) => onChangeField('fechaNacimiento', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nivel Educativo</label>
                <select
                  value={editingUser.fields.nivel || 'inicial'}
                  onChange={(e) => onChangeField('nivel', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                  required
                >
                  <option value="inicial">Nivel Inicial</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Género</label>
                <select
                  value={editingUser.fields.genero || 'Masculino'}
                  onChange={(e) => onChangeField('genero', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                  required
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro / No Binario</option>
                </select>
              </div>
            </>
          )}

          {(editingUser.type === 'parent' || editingUser.type === 'administrative') && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  value={editingUser.fields.nombre || ''}
                  onChange={(e) => onChangeField('nombre', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">DNI</label>
                <input
                  type="text"
                  value={editingUser.fields.dni || ''}
                  onChange={(e) => onChangeField('dni', e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
                <input
                  type="email"
                  value={editingUser.fields.email || ''}
                  onChange={(e) => onChangeField('email', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              {editingUser.type === 'administrative' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rol Institucional</label>
                  <select
                    value={editingUser.fields.role || 'Staff'}
                    onChange={(e) => onChangeField('role', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all text-sm appearance-none"
                    required
                  >
                    <option value="Staff">Docente / Staff</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="user_admin">Administrador General</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors cursor-pointer border-none"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProfileModal;
