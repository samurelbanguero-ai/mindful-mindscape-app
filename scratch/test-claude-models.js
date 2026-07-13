require('dotenv').config();
const env = require('../backend/config/env');

const apiKey = env.ANTHROPIC_API_KEY;
console.log('API Key cargada:', apiKey ? `${apiKey.slice(0, 10)}...` : 'undefined');

const models = [
  'claude-3-5-sonnet-latest',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-haiku-20241022',
  'claude-3-haiku-20240307'
];

async function testModel(modelName) {
  console.log(`\nProbando modelo: ${modelName}...`);
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hola' }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.log(`❌ Fallo en ${modelName}:`, JSON.stringify(data));
    } else {
      console.log(`✅ Éxito en ${modelName}! Respuesta:`, data?.content?.[0]?.text);
    }
  } catch (err) {
    console.log(`💥 Excepción en ${modelName}:`, err.message);
  }
}

async function run() {
  for (const model of models) {
    await testModel(model);
  }
}

run();
