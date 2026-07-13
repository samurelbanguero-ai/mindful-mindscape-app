const nodemailer = require('nodemailer');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class MailerClient {
  constructor() {
    this.host = env.SMTP_HOST;
    this.port = env.SMTP_PORT ? Number(env.SMTP_PORT) : null;
    this.user = env.SMTP_USER;
    this.pass = env.SMTP_PASSWORD;
    this.from = env.SMTP_FROM || 'no-reply@emowave.app';
    this.transporter = null;

    this.initTransporter();
  }

  initTransporter() {
    if (this.host && this.user && this.pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: this.host,
          port: this.port || 587,
          secure: this.port === 465, // true para 465, false para otros
          auth: {
            user: this.user,
            pass: this.pass
          }
        });
        logger.info(`Nodemailer SMTP inicializado correctamente para: ${this.host}`);
      } catch (err) {
        logger.error('Error al configurar Nodemailer SMTP transporter', { error: err.message });
      }
    } else {
      logger.warn('SMTP no está completamente configurado en las variables de entorno. Los correos se simularán imprimiendo en los logs en consola.');
    }
  }

  async sendMail({ to, subject, text, html }) {
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: this.from,
          to,
          subject,
          text,
          html
        });
        logger.info(`Correo real enviado con éxito a: ${to} | ID: ${info.messageId}`);
        return true;
      } catch (err) {
        logger.error(`Error al enviar correo SMTP real a ${to}`, { error: err.message });
        // Fallback para no tumbar la app
        this.logMailContent(to, subject, text);
        return false;
      }
    } else {
      this.logMailContent(to, subject, text);
      return true;
    }
  }

  logMailContent(to, subject, text) {
    logger.audit('--------------------------------------------------');
    logger.audit('📧 [CORREO ELECTRÓNICO SIMULADO]');
    logger.audit(`Destinatario: ${to}`);
    logger.audit(`Asunto:       ${subject}`);
    logger.audit(`Contenido:    ${text}`);
    logger.audit('--------------------------------------------------');
  }
}

module.exports = new MailerClient();
