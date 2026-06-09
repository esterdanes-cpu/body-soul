import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SENSACIONES = [
  { emoji: '😌', label: 'Relajada' },
  { emoji: '💪', label: 'Fuerte' },
  { emoji: '🧠', label: 'En calma' },
  { emoji: '😴', label: 'Cansada' },
]

export default function EncuestaTab({ session, showToast }) {
  const [clasesPendientes, setClasesPendientes] = useState([])
  const [current, setCurrent] = useState(null)
  const [estrellas, setEstrellas] = useState(0)
  const [sensacion, setSensacion] = useState('')
  const [comentario, setComentario] = useState('')
  const [recomendaria, setRecomendaria] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { loadPendientes() }, [])

  const loadPendientes = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    // Past classes I attended but haven't rated yet
    const { data: inscripciones } = await supabase
      .from('inscripciones')
      .select('*, clases(*)')
      .eq('user_id', session.user.id)
      .eq('estado', 'confirmada')
      .lt('clases.fecha', today)

    const { data: encuestasHechas } = await supabase
      .from('encuestas')
      .select('clase_id')
      .eq('user_id', session.user.id)

    const hechasIds = (encuestasHechas || []).map(e => e.clase_id)
    const pendientes = (inscripciones || [])
      .filter(i => i.clases && !hechasIds.includes(i.clase_id))

    setClasesPendientes(pendientes)
    if (pendientes.length > 0) setCurrent(pendientes[0])
    setLoading(false)
  }

  const resetForm = () => {
    setEstrellas(0); setSensacion(''); setComentario(''); setRecomendaria(null); setSubmitted(false)
  }

  const handleSubmit = async () => {
    if (!estrellas) { showToast('⚠️ Selecciona una valoración con estrellas'); return }
    const { error } = await supabase.from('encuestas').insert({
      user_id: session.user.id,
      clase_id: current.clase_id,
      estrellas,
      sensacion,
      comentario,
      recomendaria,
    })
    if (error) { showToast('❌ Error enviando encuesta'); return }
    showToast('⭐ ¡Gracias por tu valoración!')
    setSubmitted(true)
    setTimeout(() => {
      resetForm()
      const resto = clasesPendientes.filter(c => c.clase_id !== current.clase_id)
      setClasesPendientes(resto)
      setCurrent(resto[0] || null)
    }, 1500)
  }

  const s = {
    title: { fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, marginBottom: '4px' },
    sub: { fontSize: '13px', color: '#7a6e68', marginBottom: '20px' },
    card: { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 24px rgba(44,36,32,0.08)', marginBottom: '16px' },
    classTitleArea: { marginBottom: '20px' },
    h3: { fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', marginBottom: '4px' },
    meta: { fontSize: '13px', color: '#7a6e68' },
    label: { fontSize: '13px', fontWeight: 500, color: '#7a6e68', display: 'block', marginBottom: '8px' },
    stars: { display: 'flex', gap: '8px', margin: '8px 0 16px' },
    star: (active) => ({ fontSize: '32px', cursor: 'pointer', transition: 'transform 0.1s', transform: active ? 'scale(1.2)' : 'scale(1)', filter: active ? 'none' : 'grayscale(0.5)' }),
    emojiRow: { display: 'flex', gap: '10px', margin: '8px 0 16px', flexWrap: 'wrap' },
    emojiOpt: (active) => ({
      flex: '1 1 70px', padding: '12px 8px', border: `1.5px solid ${active ? '#7a9e7e' : '#e8e0d8'}`,
      borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
      background: active ? '#f0f7f1' : 'white', fontSize: '12px', transition: 'all 0.2s',
    }),
    emoji: { fontSize: '24px', display: 'block', marginBottom: '4px' },
    textarea: {
      width: '100%', padding: '12px 16px', border: '1.5px solid #e8e0d8',
      borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '80px',
      marginTop: '4px',
    },
    btnRow: { display: 'flex', gap: '10px', marginTop: '16px' },
    btnPrimary: { flex: 1, padding: '12px', background: '#4e6e52', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 },
    btnSecondary: { flex: 1, padding: '12px', background: 'transparent', border: '1.5px solid #7a9e7e', color: '#4e6e52', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
    btnSubmit: { width: '100%', padding: '14px', background: submitted ? '#a8c5ac' : '#4e6e52', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 500, marginTop: '16px' },
    emptyState: { textAlign: 'center', padding: '48px 24px', color: '#7a6e68' },
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#7a6e68' }}>Cargando...</div>

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <h2 style={s.title}>Valora tu clase</h2>
      <p style={s.sub}>Tu opinión nos ayuda a mejorar</p>

      {current && (
        <div style={s.card}>
          <div style={s.classTitleArea}>
            <h3 style={s.h3}>{current.clases.nombre}</h3>
            <p style={s.meta}>{new Date(current.clases.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} · {current.clases.hora?.slice(0,5)}h</p>
          </div>

          <label style={s.label}>Valoración general</label>
          <div style={s.stars}>
            {[1,2,3,4,5].map(n => (
              <span key={n} style={s.star(n <= estrellas)} onClick={() => setEstrellas(n)}>⭐</span>
            ))}
          </div>

          <label style={s.label}>¿Cómo te sentiste?</label>
          <div style={s.emojiRow}>
            {SENSACIONES.map(sen => (
              <div key={sen.label} style={s.emojiOpt(sensacion === sen.label)} onClick={() => setSensacion(sen.label)}>
                <span style={s.emoji}>{sen.emoji}</span>{sen.label}
              </div>
            ))}
          </div>

          <label style={s.label}>¿Qué podemos mejorar?</label>
          <textarea style={s.textarea} placeholder="Comparte tu experiencia con nosotras..." value={comentario} onChange={e => setComentario(e.target.value)} />

          <label style={{ ...s.label, marginTop: '16px' }}>¿Recomendarías esta clase?</label>
          <div style={s.btnRow}>
            <button style={{ ...s.btnPrimary, background: recomendaria === true ? '#4e6e52' : '#a8c5ac' }} onClick={() => setRecomendaria(true)}>👍 Sí, totalmente</button>
            <button style={{ ...s.btnSecondary, borderColor: recomendaria === false ? '#c47b6a' : '#7a9e7e', color: recomendaria === false ? '#c47b6a' : '#4e6e52' }} onClick={() => setRecomendaria(false)}>No del todo</button>
          </div>

          <button style={s.btnSubmit} onClick={handleSubmit} disabled={submitted}>
            {submitted ? '✅ ¡Enviada!' : 'Enviar valoración ✓'}
          </button>
        </div>
      )}

      {!current && !loading && (
        <div style={s.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌿</div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', marginBottom: '8px' }}>¡Todo al día!</p>
          <p>No tienes clases pendientes de valorar.<br />¡Gracias por tu feedback!</p>
        </div>
      )}
    </div>
  )
}
