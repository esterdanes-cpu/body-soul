const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Get all classes tomorrow with their enrolled students
    const { data: inscripciones, error } = await supabase
      .from('inscripciones')
      .select(`
        *,
        profiles (nombre, email),
        clases (nombre, fecha, hora)
      `)
      .eq('estado', 'confirmada')
      .eq('clases.fecha', tomorrowStr);

    if (error) throw error;

    const results = [];

    for (const inscripcion of (inscripciones || [])) {
      if (!inscripcion.profiles || !inscripcion.clases) continue;

      const fecha = new Date(inscripcion.clases.fecha).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long'
      });

      await resend.emails.send({
        from: 'Body & Soul <onboarding@resend.dev>',
        to: inscripcion.profiles.email,
        subject: `🔔 Recordatorio – ${inscripcion.clases.nombre} mañana a las ${inscripcion.clases.hora?.slice(0,5)}h`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px 24px;background:#f7f3ee">
            <div style="background:#4e6e52;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
              <div style="font-size:48px;margin-bottom:8px">🌿</div>
              <h1 style="color:white;font-size:28px;font-weight:300;margin:0;letter-spacing:2px">Body & Soul</h1>
              <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0;letter-spacing:3px">CLUB DE BIENESTAR · ROCHE</p>
            </div>
            <div style="background:white;border-radius:16px;padding:28px">
              <h2 style="color:#2c2420;font-size:22px;font-weight:400;margin:0 0 8px">¡Tu clase es mañana! 🔔</h2>
              <p style="color:#7a6e68;font-size:15px;margin:0 0 20px">Hola ${inscripcion.profiles.nombre}, te recordamos que tienes una clase reservada.</p>
              <div style="background:#f0f7f1;border-radius:12px;padding:16px 20px;border-left:4px solid #4e6e52">
                <div style="font-size:18px;font-weight:500;color:#2c2420;margin-bottom:8px">${inscripcion.clases.nombre}</div>
                <div style="font-size:14px;color:#7a6e68">📅 ${fecha}</div>
                <div style="font-size:14px;color:#7a6e68;margin-top:4px">🕐 ${inscripcion.clases.hora?.slice(0,5)}h</div>
              </div>
              <p style="color:#7a6e68;font-size:13px;margin:20px 0 0">¡Te esperamos! Si no puedes venir, cancela tu plaza desde la app.</p>
            </div>
            <p style="text-align:center;color:#a8c5ac;font-size:12px;margin-top:20px">Body & Soul · Roche</p>
          </div>
        `,
      });

      results.push(inscripcion.profiles.email);
    }

    res.status(200).json({ success: true, enviados: results.length, emails: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
