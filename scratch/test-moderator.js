require('dotenv').config({ path: '../backend/.env' });
const moderatorService = require('../backend/services/moderator.service');

async function runTests() {
  console.log('=== Iniciando pruebas de moderador ===\n');

  const testCases = [
    { text: 'Espero que te recuperes pronto, te mando un abrazo.', expected: false, label: 'Mensaje de apoyo legítimo' },
    { text: '¿Por qué no te callas?', expected: true, label: 'Frase tóxica con callate' },
    { text: 'Es una estupidez enorme.', expected: true, label: 'Insulto explícito' },
    { text: 'Qué bueno, te lo mereces.', expected: true, label: 'Mensaje pasivo-agresivo (te lo mereces)' },
    { text: 'Este computador funciona muy bien.', expected: false, label: 'Palabra legítima que contiene puta (computador)' },
  ];

  for (const testCase of testCases) {
    try {
      const result = await moderatorService.isToxic(testCase.text);
      const passed = result === testCase.expected;
      console.log(`${passed ? '✅' : '❌'} [${testCase.label}]`);
      console.log(`  Texto: "${testCase.text}"`);
      console.log(`  Resultado: ${result ? 'TÓXICO' : 'SEGURO'} (Esperado: ${testCase.expected ? 'TÓXICO' : 'SEGURO'})`);
    } catch (err) {
      console.log(`💥 Error en el caso [${testCase.label}]:`, err.message);
    }
    console.log('');
  }
}

runTests();
