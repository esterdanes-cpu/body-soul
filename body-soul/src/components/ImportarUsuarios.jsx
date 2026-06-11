import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const PARTICIPANTES = [
  { nombre: 'Ester Danes', email: 'ester.danes@roche.com' },
  { nombre: 'Maria Trigueros', email: 'maria.trigueros@roche.com' },
  { nombre: 'Marta Cabezuelo', email: 'marta.cabezuelo_rodriguez@roche.com' },
  { nombre: 'Claudia Miralles', email: 'claudia.miralles_estrada@roche.com' },
  { nombre: 'Asun Perez', email: 'asun.perez@roche.com' },
  { nombre: 'Maria Garcia', email: 'marina.garcia_jimenez@roche.com' },
  { nombre: 'Daniel Morales', email: 'daniel.morales_fernandez@roche.com' },
  { nombre: 'Paula Cid', email: 'paula.cid_martinez@roche.com' },
  { nombre: 'Alba Barreiro', email: 'alba.barreiro@roche.com' },
  { nombre: 'Maribel Perez', email: 'maribel.perez-quilez@roche.com' },
  { nombre: 'Ester Valverde', email: 'ester.valverde@roche.com' },
  { nombre: 'Maria Casas', email: 'maria.casas_garcia@roche.com' },
  { nombre: 'Ana Garcia', email: 'ana.garcia_pardo@roche.com' },
  { nombre: 'Gemma Masclans', email: 'gemma.masclans@roche.com' },
  { nombre: 'Gisela Lopez', email: 'gisela.lopez_prieto@external.roche.com' },
  { nombre: 'Julia Castella', email: 'julia.castella_llort@roche.com' },
  { nombre: 'Anna Romero', email: 'anna.romero@roche.com' },
  { nombre: 'Surbhi Modi', email: 'surbhi.modi@roche.com' },
  { nombre: 'Andrea Cervera', email: 'andrea.cervera_forner@roche.com' },
  { nombre: 'Sofia Brunori', email: 'sofia.brunori@roche.com' },
  { nombre: 'Miguel Martin', email: 'miguel.martin_clemente@roche.com' },
  { nombre: 'Catalina Lopez', email: 'catalina.lopez@roche.com' },
  { nombre: 'Marta Isern', email: 'marta.isern_capella@roche.com' },
  { nombre: 'Isabel Jane', email: 'isabel.jane@roche.com' },
  { nombre: 'Naziha Fikari', email: 'naziha.fikari_archich@roche.com' },
  { nombre: 'Maria Valles', email: 'maria.valles_llabres@contractors.roche.com' },
  { nombre: 'Alba Marin', email: 'alba.marin_martinez@roche.com' },
  { nombre: 'Beatriz Torres', email: 'beatriz.torres_herrero@roche.com' },
  { nombre: 'Isabel Saez', email: 'isabel.saez@external.roche.com' },
  { nombre: 'Caroline Iannace', email: 'caroline.iannace_roche@roche.com' },
  { nombre: 'Raquel Cobo', email: 'raquel.cobo@roche.com' },
  { nombre: 'Helena Martinez', email: 'helena.martinez_morato@roche.com' },
  { nombre: 'Maria Plana', email: 'maria.plana@contractors.roche.com' },
  { nombre: 'Chahinaz El Baraky', email: 'chahinaz.el_baraky@roche.com' },
  { nombre: 'Ricard Alegre', email: 'ricard.alegre-castilla@roche.com' },
  { nombre: 'Nuria Orive', email: 'nuria.orive_milla@roche.com' },
  { nombre: 'Jose Antonio', email: 'jose_antonio.canizares@roche.com' },
  { nombre: 'Michael Skobierski', email: 'michael.skobierski@roche.com' },
  { nombre: 'Silvia Perez', email: 'silvia.perez@roche.com' },
  { nombre: 'Laura Vidal', email: 'laura.vidal_borrell@roche.com' },
  { nombre: 'Adria Tortajada', email: 'adria.tortajada_gros@roche.com' },
  { nombre: 'David Gallardo', email: 'david.gallardo@roche.com' },
  { nombre: 'Carlota de Miquel', email: 'carlota.de_miquel_bleier@roche.com' },
  { nombre: 'Ana de la Mano', email: 'ana.de_la_mano@roche.com' },
  { nombre: 'Brice Chiapale', email: 'brice.chiapale@roche.com' },
  { nombre: 'Carmen Pazos', email: 'carmen.pazos@roche.com' },
  { nombre: 'Beatriz Cabanillas', email: 'beatriz.cabanillas_sanchez@roche.com' },
  { nombre: 'Balaji Markante', email: 'balaji.markante@roche.com' },
  { nombre: 'Juan Pares', email: 'juan.pares@roche.com' },
  { nombre: 'Mireia Arnal', email: 'mireia.arnal_avalo@roche.com' },
  { nombre: 'Naiara Muro', email: 'naiara.muro@roche.com' },
  { nombre: 'Anna Serra', email: 'anna.serra@roche.com' },
  { nombre: 'Marta Gonzalez', email: 'marta.gonzalez_carod@roche.com' },
  { nombre: 'Aurora Martinez', email: 'aurora.martinez@roche.com' },
  { nombre: 'Krisia Zuniga', email: 'krisia.zuniga_guzman@roche.com' },
  { nombre: 'Alba Gomez', email: 'alba.gomez_roca@roche.com' },
  { nombre: 'Saioa Villodas', email: 'saioa.villodas_arechavaleta@roche.com' },
  { nombre: 'Cristina Marti', email: 'cristina.marti_rossell@roche.com' },
  { nombre: 'Noora Isokoski', email: 'noora.isokoski@roche.com' },
  { nombre: 'Laura Sagarribay', email: 'laura.sagarribay_fabrega@roche.com' },
  { nombre: 'Leticia Garcia', email: 'leticia.garcia_romero@roche.com' },
  { nombre: 'Patricia Gutierrez', email: 'patricia.gutierrez.pg2@roche.com' },
  { nombre: 'Jennifer Escudero', email: 'jennifer.escudero@roche.com' },
  { nombre: 'Marta Cambra', email: 'marta.cambra@roche.com' },
  { nombre: 'Claudia Carraretto', email: 'claudia.carraretto@roche.com' },
  { nombre: 'Soledad Cabanas', email: 'soledad.cabanas@roche.com' },
  { nombre: 'Eva Tarres', email: 'eva.tarres_comas@roche.com' },
  { nombre: 'Laura Vila', email: 'laura.vila-moreno@roche.com' },
  { nombre: 'Sergio Rodriguez', email: 'sergio.rodriguez_perez@roche.com' },
  { nombre: 'Paula Serra', email: 'paula.serra_robres@roche.com' },
  { nombre: 'Ana Villar', email: 'ana.villar@roche.com' },
  { nombre: 'Laura Martinez', email: 'laura.martinez_serra@roche.com' },
  { nombre: 'Marta Vilalta', email: 'marta.vilalta_cabezas@roche.com' },
  { nombre: 'Maria Esteve', email: 'maria.esteve_garcia@roche.com' },
  { nombre: 'Marta Relancio', email: 'marta.relancio@roche.com' },
  { nombre: 'Ainara Morera', email: 'ainara.morera@roche.com' },
  { nombre: 'Margalida Genovart', email: 'margalida.genovart@roche.com' },
  { nombre: 'Helena Izquierdo', email: 'helena.izquierdo_gonzalez@roche.com' },
  { nombre: 'Noa Callol', email: 'noa.callol@roche.com' },
  { nombre: 'Min Yong Yoon', email: 'min_yong.yoon@roche.com' },
  { nombre: 'Nathalia Fraga', email: 'nathalia.fraga@roche.com' },
  { nombre: 'Carlota Marti', email: 'carlota.marti@roche.com' },
  { nombre: 'Ewa Mazanka', email: 'ewa.mazanka@roche.com' },
  { nombre: 'Silvia Estudillo', email: 'silvia.estudillo_marin@roche.com' },
  { nombre: 'Teresa Vela', email: 'teresa.vela@roche.com' },
  { nombre: 'Ares Fernandez', email: 'ares.fernandez_batlle@roche.com' },
  { nombre: 'Lorena Jud', email: 'lorena.jud@roche.com' },
  { nombre: 'Barbara Ibanez', email: 'barbara.ibanez_casado@roche.com' },
  { nombre: 'Anna Perearnau', email: 'anna.perearnau@roche.com' },
  { nombre: 'Claudia Massana', email: 'claudia.massana@roche.com' },
  { nombre: 'Aitana Pascual', email: 'aitana.pascual@roche.com' },
  { nombre: 'Giuliana Buogo', email: 'giuliana.buogo@roche.com' },
  { nombre: 'Mariana Carrillo', email: 'mariana.carrillo_vazquez@roche.com' },
  { nombre: 'Cinta Gisbert', email: 'cinta.gisbert_bouzas@roche.com' },
  { nombre: 'Emilia Cornet', email: 'emilia.cornet@roche.com' },
  { nombre: 'Judith Bertomeu', email: 'judith.bertomeu@roche.com' },
  { nombre: 'Monica Garcia', email: 'monica.garcia_mateu@roche.com' },
  { nombre: 'Natalia Hernandez', email: 'natalia.hernandez_retana@roche.com' },
  { nombre: 'Isabel Andreu', email: 'isabel.andreu_lopez@roche.com' },
  { nombre: 'Mar Pascual', email: 'mar.pascual@roche.com' },
  { nombre: 'Anna Gisbert', email: 'anna.gibert@roche.com' },
  { nombre: 'Laura Aivar', email: 'laura.aivar@roche.com' },
  { nombre: 'Enric Alegret', email: 'enric.alegret@roche.com' },
  { nombre: 'Maria Jose', email: 'maria_jose.sanchez_pena@roche.com' },
  { nombre: 'Marta Pique', email: 'marta.pique-gili@roche.com' },
]

export default function ImportarUsuarios({ profile }) {
  const [resultados, setResultados] = useState([])
  const [progreso, setProgreso] = useState(0)
  const [ejecutando, setEjecutando] = useState(false)
  const [finalizado, setFinalizado] = useState(false)

  if (!profile?.es_admin) return null

  const importar = async () => {
    setEjecutando(true)
    setResultados([])
    setProgreso(0)
    setFinalizado(false)

    const nuevosResultados = []

    for (let i = 0; i < PARTICIPANTES.length; i++) {
      const p = PARTICIPANTES[i]
      try {
        const { error } = await supabase.auth.admin.inviteUserByEmail(p.email, {
          data: { nombre: p.nombre }
        })
        nuevosResultados.push({
          nombre: p.nombre,
          email: p.email,
          ok: !error,
          msg: error ? error.message : '✅ Invitación enviada'
        })
      } catch (e) {
        nuevosResultados.push({
          nombre: p.nombre,
          email: p.email,
          ok: false,
          msg: '❌ ' + e.message
        })
      }
      setProgreso(i + 1)
      setResultados([...nuevosResultados])
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300))
    }

    setEjecutando(false)
    setFinalizado(true)
  }

  const exitosos = resultados.filter(r => r.ok).length
  const fallidos = resultados.filter(r => !r.ok).length
  const pct = Math.round((progreso / PARTICIPANTES.length) * 100)

  const s = {
    wrapper: { padding: '24px', maxWidth: '600px', margin: '0 auto' },
    title: { fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', marginBottom: '4px' },
    sub: { fontSize: '13px', color: '#7a6e68', marginBottom: '24px' },
    card: { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 24px rgba(44,36,32,0.08)', marginBottom: '16px' },
    statsRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
    stat: (color) => ({ flex: 1, background: color, borderRadius: '12px', padding: '14px', textAlign: 'center' }),
    statNum: { fontSize: '28px', fontWeight: 700, color: '#4e6e52' },
    statLabel: { fontSize: '12px', color: '#7a6e68', marginTop: '2px' },
    barBg: { background: '#ede6da', borderRadius: '8px', height: '12px', marginBottom: '8px', overflow: 'hidden' },
    barFill: { height: '100%', background: '#4e6e52', borderRadius: '8px', transition: 'width 0.3s' },
    barText: { fontSize: '13px', color: '#7a6e68', textAlign: 'center', marginBottom: '16px' },
    btn: { width: '100%', padding: '14px', background: ejecutando ? '#a8c5ac' : '#4e6e52', color: 'white', border: 'none', borderRadius: '12px', cursor: ejecutando ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: 500 },
    resultRow: (ok) => ({ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f0ebe4', fontSize: '13px' }),
    dot: (ok) => ({ width: '8px', height: '8px', borderRadius: '50%', background: ok ? '#4e6e52' : '#c47b6a', flexShrink: 0 }),
    warning: { background: '#fff8ee', border: '1px solid #c9a96e', borderRadius: '12px', padding: '16px', marginBottom: '16px', fontSize: '13px', color: '#6b5344' },
  }

  return (
    <div style={s.wrapper}>
      <h2 style={s.title}>Importar participantes</h2>
      <p style={s.sub}>Envía invitaciones a los 105 participantes del grupo</p>

      <div style={s.warning}>
        ⚠️ <strong>Importante:</strong> Cada participante recibirá un email en inglés de Supabase con un enlace para crear su contraseña. El enlace caduca en 24h. Asegúrate de avisarles por WhatsApp o email antes de ejecutar.
      </div>

      <div style={s.card}>
        <div style={s.statsRow}>
          <div style={s.stat('#f0f7f1')}>
            <div style={s.statNum}>{PARTICIPANTES.length}</div>
            <div style={s.statLabel}>Total participantes</div>
          </div>
          <div style={s.stat('#f0f7f1')}>
            <div style={{ ...s.statNum, color: '#4e6e52' }}>{exitosos}</div>
            <div style={s.statLabel}>Invitaciones enviadas</div>
          </div>
          <div style={s.stat('#fdf0ed')}>
            <div style={{ ...s.statNum, color: fallidos > 0 ? '#c47b6a' : '#a8c5ac' }}>{fallidos}</div>
            <div style={s.statLabel}>Errores</div>
          </div>
        </div>

        {ejecutando || finalizado ? (
          <>
            <div style={s.barBg}>
              <div style={{ ...s.barFill, width: `${pct}%` }} />
            </div>
            <p style={s.barText}>{progreso} de {PARTICIPANTES.length} procesados ({pct}%)</p>
          </>
        ) : null}

        <button style={s.btn} onClick={importar} disabled={ejecutando || finalizado}>
          {finalizado ? '✅ Importación completada' : ejecutando ? `Enviando... ${progreso}/${PARTICIPANTES.length}` : '📧 Enviar invitaciones a todos'}
        </button>

        {finalizado && fallidos > 0 && (
          <p style={{ fontSize: '13px', color: '#c47b6a', marginTop: '12px', textAlign: 'center' }}>
            {fallidos} invitaciones fallaron — probablemente ya tenían cuenta. Puedes ignorarlo.
          </p>
        )}
      </div>

      {resultados.length > 0 && (
        <div style={s.card}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', marginBottom: '16px', color: '#4e6e52' }}>Resultados</h3>
          {resultados.map((r, i) => (
            <div key={i} style={s.resultRow(r.ok)}>
              <div style={s.dot(r.ok)} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500 }}>{r.nombre}</span>
                <span style={{ color: '#7a6e68' }}> · {r.email}</span>
              </div>
              <span style={{ color: r.ok ? '#4e6e52' : '#c47b6a', fontSize: '12px' }}>{r.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
