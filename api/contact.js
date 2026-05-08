// Vercel serverless — SauceForge
let nodemailer;
try { nodemailer = require('nodemailer'); } catch(e) { nodemailer = null; }
const FROM = '"SauceForge" <crazycompanyincmail@gmail.com>';
const TO = 'crazycompanyincmail@gmail.com';
async function sendMail(t, opts) { return t.sendMail({ from: FROM, ...opts }); }
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, email, empresa, message, type } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email requerido' });
  if (!nodemailer) return res.status(500).json({ error: 'Servicio no disponible' });
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) return res.status(500).json({ error: 'Servicio no configurado' });
  try {
    const t = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 587, secure: false, auth: { user: 'crazycompanyincmail@gmail.com', pass } });
    if (type === 'contact') {
      if (!name || !message) return res.status(400).json({ error: 'Nombre y mensaje requeridos' });
      await sendMail(t, { to: TO, replyTo: email, subject: `[Contacto] ${name}`, text: `Nombre: ${name}\nEmail: ${email}\nEmpresa: ${empresa||'N/A'}\n\n${message}` });
      return res.status(200).json({ ok: true });
    }
    if (type === 'lead') {
      await sendMail(t, { to: email, subject: 'Tus 30 prompts para crear platos con IA', text: 'Los mejores prompts para generar recetas, menús y descripciones gastronómicas.\n\nAccede al sistema completo en: https://sauceforge.vercel.app' });
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: 'Tipo no valido' });
  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};