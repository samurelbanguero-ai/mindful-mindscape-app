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
      logger.info("Cuentas auto-verificadas para desarrollo.");
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
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Administrador';

    if (!adminPassword) {
      logger.warn('ADMIN_PASSWORD no definido en .env — el administrador no se sembrará automáticamente.');
      return;
    }

    if (adminPassword.length < 12 || ['123456', 'admin', 'password'].includes(adminPassword)) {
      logger.error('ADMIN_PASSWORD es demasiado corta o insegura (mínimo 12 caracteres): no se sembró el administrador.');
      return;
    }

    // Se busca solo una cuenta que ya sea admin. Buscar también por username/email
    // convertiría en administrador a cualquier usuario que se hubiera registrado con
    // ese nombre o correo.
    const adminRecord = db.prepare(
      "SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1"
    ).get();

    const conflict = db.prepare(
      "SELECT id FROM users WHERE (username = ? OR email = ?) AND role != 'admin'"
    ).get(adminUsername, adminEmail);
    if (conflict) {
      logger.error(`No se sembró el administrador: el usuario o correo de ADMIN_USERNAME/ADMIN_EMAIL ya pertenece a otra cuenta (id ${conflict.id}).`);
      return;
    }

    const hash = bcrypt.hashSync(adminPassword, 10);

    if (adminRecord) {
      // Mantiene el perfil del admin; solo sincroniza credenciales con el .env
      db.prepare(`
        UPDATE users
        SET email = ?, username = ?, password_hash = ?, name = ?, email_verified = 1
        WHERE id = ?
      `).run(adminEmail, adminUsername, hash, adminName, adminRecord.id);
      logger.info('Usuario administrador actualizado en la base de datos.');
    } else {
      db.prepare(`
        INSERT INTO users (email, username, password_hash, name, role, visibility, alias, profile_data, email_verified)
        VALUES (?, ?, ?, ?, 'admin', 'publico', 'Admin', '{}', 1)
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
