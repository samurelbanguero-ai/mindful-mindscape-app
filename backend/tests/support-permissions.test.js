const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canAccessRequest, canClaimRequest } = require('../shared/support-permissions');

const estudiante = { id: 1, role: 'usuario' };
const otroEstudiante = { id: 2, role: 'usuario' };
const psicologaA = { id: 10, role: 'psicologo' };
const psicologoB = { id: 11, role: 'psicologo' };
const admin = { id: 99, role: 'admin' };

const pendiente = { id: 5, user_id: 1, psychologist_id: null, status: 'pending' };
const asignadoA = { id: 6, user_id: 1, psychologist_id: 10, status: 'active' };

test('el estudiante accede solo a su propio caso', () => {
  assert.equal(canAccessRequest(estudiante, asignadoA), true);
  assert.equal(canAccessRequest(otroEstudiante, asignadoA), false);
});

test('un psicólogo solo accede a los casos asignados a él', () => {
  assert.equal(canAccessRequest(psicologaA, asignadoA), true);
  assert.equal(canAccessRequest(psicologoB, asignadoA), false);
});

test('un caso pendiente sin asignar no da acceso completo a ningún psicólogo', () => {
  assert.equal(canAccessRequest(psicologaA, pendiente), false);
  assert.equal(canAccessRequest(psicologoB, pendiente), false);
});

test('el administrador accede a todos los casos', () => {
  assert.equal(canAccessRequest(admin, pendiente), true);
  assert.equal(canAccessRequest(admin, asignadoA), true);
});

test('solo se puede tomar un caso pendiente sin asignar, y solo un profesional', () => {
  assert.equal(canClaimRequest(psicologoB, pendiente), true);
  assert.equal(canClaimRequest(admin, pendiente), true);
  assert.equal(canClaimRequest(estudiante, pendiente), false);
  assert.equal(canClaimRequest(psicologoB, asignadoA), false);
  assert.equal(canClaimRequest(psicologoB, { ...pendiente, status: 'resolved' }), false);
});
