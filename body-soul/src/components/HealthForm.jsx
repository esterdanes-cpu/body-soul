import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const CONDICIONES = ['Lesión de espalda', 'Rodilla / cadera', 'Hombro / cuello', 'Embarazo', 'Postparto', 'Ninguna']
const ENFERMEDADES = ['Hipertensión', 'Diabetes', 'Problemas cardíacos', 'Ansiedad / estrés', 'Osteoporosis', 'Ninguna']
const NIVELES = ['principiante', 'basico', 'intermedio', 'avanzado']
const NIVELES_LABEL = { principiante: 'Principiante – nunca he hecho yoga', basico: 'Básico – alguna clase suelta', intermedio: 'Intermedio – practico regularmente', avanzado: 'Avanzado – llevo años practicando' }

export default function HealthForm({ session, onComplete, showToast }) {
  const [condiciones, setCondiciones] = useState([])
  const [enfermedades, setEnfermedades] = useState([])
  const [nivel, setNivel] = useState('principiante')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)

  const toggle = (arr, setArr, val) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  const handleSave = async () => {
    if (!session) { showToast('⚠️ Sesión no válida'); return }
    setLoading(true)
    const nombre = sessionStorage.getItem('bs_nombre') || session.user.email.split('@')[0]
    const avatarLetra = nombre.charAt(0).toUpperCase()

    const { data, error } = await supabase.from('profiles').insert({
      id: session.user.id,
      nombre,
      email: session.user.email,
      avatar_letra: avatarLetra,
      condiciones_fisicas: condiciones,
      enfermedades,
      nivel_experiencia: nivel,
      notas_salud: notas,
      es_admin: false,
    }).select().single()

    setLoading(false)
    if (error) { showToast('❌ Error guardando ficha: ' + error.message); return }
    sessionStorage.removeItem('bs_nombre')
    onComplete(data)
  }

  const s = {
    screen: { minHeight: '100vh', background: '#f7f3ee' },
    header: {
      background: 'linear-gradient(135deg, #4e6e52, #7a9e7e)',
      padding: '48px 24px 32px', textAlign: 'center', color: 'white',
    },
    icon: { fontSize: '48px', marginBottom: '12px', display: 'block' },
    h2: { fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300, color: 'white' },
    sub: { opacity: 0.85, fontSize: '14px', marginTop: '6px', color: 'white' },
    body: { padding: '32px 24px', maxWidth: '500px', margin: '0 auto' },
    section: { background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 4px 24px rgba(44,36,32,0.08)' },
    h3: { fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#4e6e52', marginBottom: '16px' },
    chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    chip: (active) => ({
      padding: '8px 14px', border: `1.5px solid ${active ? '#7a9e7e' : '#e8e0d8'}`,
      borderRadius: '20px', cursor: 'pointer', fontSize: '13px',
      background: active ? '#7a9e7e' : 'white',
      color: active ? 'white' : '#2c2420',
      transition: 'all 0.2s',
    }),
    select: {
      width: '100%', padding: '12px 16px', border: '1.5px solid #e8e0d8',
      borderRadius: '10px', fontSize: '15px', outline: 'none', marginBottom: '16px',
    },
    textarea: {
      width: '100%', padding: '12px 16px', border: '1.5px solid #e8e0d8',
      borderRadius: '10px', fontSize: '15px', outline: 'none',
      resize: 'vertical', minHeight: '80px',
    },
    label: { display: 'block', fontSize: '12px', fontWeight: 500, color: '#7a6e68', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
    btn: {
      width: '100%', padding: '14px', background: loading ? '#a8c5ac' : '#4e6e52',
      color: 'white', border: 'none', borderRadius: '12px',
      fontSize: '15px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
      marginTop: '8px',
    },
  }

  return (
    <div style={s.screen}>
      <div style={s.header}>
        <span style={s.icon}>🏥</span>
        <h2 style={s.h2}>Tu ficha de salud</h2>
        <p style={s.sub}>Para cuidarte mejor, necesitamos saber un poco sobre ti</p>
      </div>
      <div style={s.body}>
        <div style={s.section}>
          <h3 style={s.h3}>¿Tienes alguna condición física?</h3>
          <div style={s.chips}>
            {CONDICIONES.map(c => (
              <span key={c} style={s.chip(condiciones.includes(c))} onClick={() => toggle(condiciones, setCondiciones, c)}>{c}</span>
            ))}
          </div>
        </div>
        <div style={s.section}>
          <h3 style={s.h3}>¿Alguna enfermedad o condición médica?</h3>
          <div style={s.chips}>
            {ENFERMEDADES.map(e => (
              <span key={e} style={s.chip(enfermedades.includes(e))} onClick={() => toggle(enfermedades, setEnfermedades, e)}>{e}</span>
            ))}
          </div>
        </div>
        <div style={s.section}>
          <h3 style={s.h3}>Nivel de experiencia</h3>
          <label style={s.label}>Nivel</label>
          <select style={s.select} value={nivel} onChange={e => setNivel(e.target.value)}>
            {NIVELES.map(n => <option key={n} value={n}>{NIVELES_LABEL[n]}</option>)}
          </select>
          <label style={s.label}>¿Algo más que debamos saber?</label>
          <textarea style={s.textarea} placeholder="Otras condiciones, medicación, preferencias..." value={notas} onChange={e => setNotas(e.target.value)} />
        </div>
        <button style={s.btn} onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar y entrar al club ✓'}
        </button>
      </div>
    </div>
  )
}
