const bcrypt = require('bcryptjs');
const db = require('./connection');
const schema = require('./schema');
const logger = require('../utils/logger');

function initDatabase() {
  try {
    // 1. Ejecutar creación de tablas
    db.exec(schema.tables);
    // 2. Ejecutar creación de índices
    db.exec(schema.indexes);
    logger.info('Tablas e índices de base de datos validados.');

    // 3. Ejecutar migraciones
    for (const query of schema.migrations) {
      try {
        db.exec(query);
      } catch (err) {
        if (!err.message.includes('duplicate column name') && !err.message.includes('already exists')) {
          logger.warn(`Advertencia al ejecutar migración: ${query} | Error: ${err.message}`);
        }
      }
    }

    // 4. Sembrar administrador inicial
    seedAdminUser();

    // Auto-verificar cuentas existentes en desarrollo si no hay SMTP configurado
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      db.prepare("UPDATE users SET email_verified = 1").run();
      logger.info("Modo desarrollo: Cuentas locales existentes auto-verificadas (sin SMTP).");
    }

    // 5. Iniciar limpieza periódica automática de registros expirados (cada 30 minutos)
    const authRepository = require('../repositories/auth.repository');
    setInterval(() => {
      try {
        const stats = authRepository.clearExpiredRecords();
        logger.info('Limpieza automática de base de datos ejecutada con éxito', stats);
      } catch (err) {
        logger.error('Error al ejecutar la limpieza automática de la base de datos', { error: err.message });
      }
    }, 30 * 60 * 1000);

    logger.info('Base de datos inicializada exitosamente.');
  } catch (err) {
    logger.error('Fallo crítico al inicializar la base de datos', { error: err.message, stack: err.stack });
    throw err;
  }
}

function seedAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@emowave.app';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    let adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Administrador';

    if (!adminPassword) {
      logger.warn('ADMIN_PASSWORD no definido en .env — el administrador no se sembrará automáticamente.');
      return;
    }

    if (adminPassword.length < 8 || adminPassword === '123456' || adminPassword === 'admin') {
      const crypto = require('crypto');
      const generatedPassword = crypto.randomBytes(12).toString('base64url');
      logger.warn(`⚠️ ADVERTENCIA DE SEGURIDAD: La contraseña de administrador en .env es demasiado corta o insegura. Por seguridad, se ha generado una contraseña aleatoria de un solo uso para esta sesión: ${generatedPassword}`);
      adminPassword = generatedPassword;
    }

    const adminRecord = db.prepare(
      "SELECT id FROM users WHERE role = 'admin' OR username = ? OR email = ?"
    ).get(adminUsername, adminEmail);

    const hash = bcrypt.hashSync(adminPassword, 10);

    if (adminRecord) {
      db.prepare(`
        UPDATE users
        SET email = ?, username = ?, password_hash = ?, name = ?,
            role = 'admin', visibility = 'publico', alias = 'Admin', profile_data = '{}'
        WHERE id = ?
      `).run(adminEmail, adminUsername, hash, adminName, adminRecord.id);
      logger.info('Usuario administrador actualizado en la base de datos.');
    } else {
      db.prepare(`
        INSERT INTO users (email, username, password_hash, name, role, visibility, alias, profile_data)
        VALUES (?, ?, ?, ?, 'admin', 'publico', 'Admin', '{}')
      `).run(adminEmail, adminUsername, hash, adminName);
      logger.info('Usuario administrador creado en la base de datos.');
    }
  } catch (err) {
    logger.error('Error al sembrar usuario administrador', { error: err.message });
  }
}

module.exports = {
  initDatabase
};
