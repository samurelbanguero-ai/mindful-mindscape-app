// Reglas de acceso a los casos de apoyo psicológico (sin base de datos, para poder probarlas).
//
// - El estudiante solo accede a su propio caso.
// - El administrador accede a todos.
// - El psicólogo accede a los casos asignados a él. Los casos pendientes sin
//   asignar los ve en una cola con datos mínimos y puede tomarlos.

function isProfessional(user) {
  return !!user && (user.role === 'psicologo' || user.role === 'admin');
}

function isUnassignedPending(request) {
  return !!request && request.psychologist_id == null && request.status === 'pending';
}

/** Acceso completo al caso: mensajes, diario compartido, indicador y resolver. */
function canAccessRequest(user, request) {
  if (!user || !request) return false;
  if (request.user_id === user.id) return true;
  if (user.role === 'admin') return true;
  return user.role === 'psicologo' && request.psychologist_id === user.id;
}

/** Un profesional puede tomar un caso pendiente que nadie ha tomado. */
function canClaimRequest(user, request) {
  return isProfessional(user) && isUnassignedPending(request);
}

module.exports = {
  isProfessional,
  isUnassignedPending,
  canAccessRequest,
  canClaimRequest
};
