const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tipo, email, nombre, clase, fecha, hora } = req.body;

  if (!email || !tipo) return res.status(400).json({ error: 'Faltan datos' });

  let subject = '';
  let html = '';

  if (tipo === 'confirmacion') {
    subject = `✅ Plaza confirmada – ${clase}`;
    html = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px 24px;background:#f7f3ee">
        <div style="background:#4e6e52;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
          <div style="font-size:48px;margin-bottom:8px">🌿</div>
          <h1 style="color:white;font-size:28px;font-weight:300;margin:0;letter-spacing:2px">Body & Soul</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0;letter-spacing:3px">CLUB DE BIENESTAR · ROCHE</p>
        </div>
        <div style="background:white;border-radius:16px;padding:28px">
          <h2 style="color:#2c2420;font-size:22px;font-weight:400;margin:0 0 8px">¡Plaza confirmada! ✅</h2>
          <p style="color:#7a6e68;font-size:15px;margin:0 0 20px">Hola ${nombre}, tu reserva está confirmada.</p>
          <div style="background:#f0f7f1;border-radius:12px;padding:16px 20px;border-left:4px solid #4e6e52">
            <div style="font-size:18px;font-weight:500;color:#2c2420;margin-bottom:8px">${clase}</div>
            <div style="font-size:14px;color:#7a6e68">📅 ${fecha}</div>
            <div style="font-size:14px;color:#7a6e68;margin-top:4px">🕐 ${hora}</div>
          </div>
          <p style="color:#7a6e68;font-size:13px;margin:20px 0 0">Recibirás un recordatorio 24h antes de la clase. Si necesitas cancelar tu plaza, hazlo con antelación desde la app.</p>
        </div>
        <p style="text-align:center;color:#a8c5ac;font-size:12px;margin-top:20px">Body & Soul · Roche</p>
      </div>
    `;
  }

  if (tipo === 'recordatorio') {
    subject = `🔔 Recordatorio – ${clase} mañana a las ${hora}`;
    html = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px 24px;background:#f7f3ee">
        <div style="background:#4e6e52;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
          <div style="font-size:48px;margin-bottom:8px">🌿</div>
          <h1 style="color:white;font-size:28px;font-weight:300;margin:0;letter-spacing:2px">Body & Soul</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0;letter-spacing:3px">CLUB DE BIENESTAR · ROCHE</p>
        </div>
        <div style="background:white;border-radius:16px;padding:28px">
          <h2 style="color:#2c2420;font-size:22px;font-weight:400;margin:0 0 8px">¡Tu clase es mañana! 🔔</h2>
          <p style="color:#7a6e68;font-size:15px;margin:0 0 20px">Hola ${nombre}, te recordamos que tienes una clase reservada.</p>
          <div style="background:#f0f7f1;border-radius:12px;padding:16px 20px;border-left:4px solid #4e6e52">
            <div style="font-size:18px;font-weight:500;color:#2c2420;margin-bottom:8px">${clase}</div>
            <div style="font-size:14px;color:#7a6e68">📅 ${fecha}</div>
            <div style="font-size:14px;color:#7a6e68;margin-top:4px">🕐 ${hora}</div>
          </div>
          <p style="color:#7a6e68;font-size:13px;margin:20px 0 0">¡Te esperamos! Si no puedes venir, cancela tu plaza desde la app para que otra alumna pueda apuntarse.</p>
        </div>
        <p style="text-align:center;color:#a8c5ac;font-size:12px;margin-top:20px">Body & Soul · Roche</p>
      </div>
    `;
  }

  if (tipo === 'lista_espera') {
    subject = `⏳ Estás en lista de espera – ${clase}`;
    html = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px 24px;background:#f7f3ee">
        <div style="background:#4e6e52;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
          <div style="font-size:48px;margin-bottom:8px">🌿</div>
          <h1 style="color:white;font-size:28px;font-weight:300;margin:0;letter-spacing:2px">Body & Soul</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0;letter-spacing:3px">CLUB DE BIENESTAR · ROCHE</p>
        </div>
        <div style="background:white;border-radius:16px;padding:28px">
          <h2 style="color:#2c2420;font-size:22px;font-weight:400;margin:0 0 8px">En lista de espera ⏳</h2>
          <p style="color:#7a6e68;font-size:15px;margin:0 0 20px">Hola ${nombre}, la clase está llena pero te hemos apuntado a la lista de espera.</p>
          <div style="background:#fff8ee;border-radius:12px;padding:16px 20px;border-left:4px solid #c9a96e">
            <div style="font-size:18px;font-weight:500;color:#2c2420;margin-bottom:8px">${clase}</div>
            <div style="font-size:14px;color:#7a6e68">📅 ${fecha}</div>
            <div style="font-size:14px;color:#7a6e68;margin-top:4px">🕐 ${hora}</div>
          </div>
          <p style="color:#7a6e68;font-size:13px;margin:20px 0 0">Si se libera una plaza te avisaremos por email inmediatamente.</p>
        </div>
        <p style="text-align:center;color:#a8c5ac;font-size:12px;margin-top:20px">Body & Soul · Roche</p>
      </div>
    `;
  }

  if (tipo === 'plaza_liberada') {
    subject = `🎉 ¡Se ha liberado una plaza! – ${clase}`;
    html = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px 24px;background:#f7f3ee">
        <div style="background:#4e6e52;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
          <div style="font-size:48px;margin-bottom:8px">🌿</div>
          <h1 style="color:white;font-size:28px;font-weight:300;margin:0;letter-spacing:2px">Body & Soul</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0;letter-spacing:3px">CLUB DE BIENESTAR · ROCHE</p>
        </div>
        <div style="background:white;border-radius:16px;padding:28px">
          <h2 style="color:#2c2420;font-size:22px;font-weight:400;margin:0 0 8px">¡Plaza confirmada! 🎉</h2>
          <p style="color:#7a6e68;font-size:15px;margin:0 0 20px">Hola ${nombre}, se ha liberado una plaza y eres la siguiente en la lista de espera. ¡Ya estás apuntada!</p>
          <div style="background:#f0f7f1;border-radius:12px;padding:16px 20px;border-left:4px solid #4e6e52">
            <div style="font-size:18px;font-weight:500;color:#2c2420;margin-bottom:8px">${clase}</div>
            <div style="font-size:14px;color:#7a6e68">📅 ${fecha}</div>
            <div style="font-size:14px;color:#7a6e68;margin-top:4px">🕐 ${hora}</div>
          </div>
          <p style="color:#7a6e68;font-size:13px;margin:20px 0 0">¡Te esperamos! Si no puedes venir, cancela tu plaza desde la app.</p>
        </div>
        <p style="text-align:center;color:#a8c5ac;font-size:12px;margin-top:20px">Body & Soul · Roche</p>
      </div>
    `;
  }

  try {
    const data = await resend.emails.send({
      from: 'Body & Soul <onboarding@resend.dev>',
      to: email,
      subject,
      html,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
