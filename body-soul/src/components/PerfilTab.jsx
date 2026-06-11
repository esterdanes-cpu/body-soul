import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const CONDICIONES = ['Lesión de espalda', 'Rodilla / cadera', 'Hombro / cuello', 'Embarazo', 'Postparto', 'Ninguna']
const ENFERMEDADES = ['Hipertensión', 'Diabetes', 'Problemas cardíacos', 'Ansiedad / estrés', 'Osteoporosis', 'Ninguna']

export default function PerfilTab({ profile, setProfile, session, clasesUsadas, onLogout, showToast }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    condiciones_fisicas: profile?.condiciones_fisicas || [],
    enfermedades: profile?.enfermedades || [],
    nivel_experiencia: profile?.nivel_experiencia || 'principiante',
    notas_salud: profile?.notas_salud || '',
  })
  const [saving, setSaving] = useState(false)

  const toggle = (key, val) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val]
    }))
  }

  const saveProfile = async () => {
    setSaving(true)
    const { data, error } = await supabase.from('profiles').update(form).eq('id', session.user.id).select().single()
    setSaving(false)
    if (error) { showToast('❌ Error guardando'); return }
    setProfile(data)
    setEditando(false)
    showToast('✅ Ficha actualizada')
  }

  const quotePct = Math.min(100, (clasesUsadas / 2) * 100)
  const circum = 251
  const offset = circum - (circum * quotePct / 100)

  const s = {
    header: {
      background: 'linear-gradient(135deg, #4e6e52, #7a9e7e)',
      margin: '-24px -24px 24px', padding: '40px 24px 32px',
      textAlign: 'center', color: 'white',
    },
    bigAvatar: {
      width: '80px', height: '80px', borderRadius: '50%',
      background: 'rgba(255,255,255,0.25)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: '36px',
      margin: '0 auto 12px', border: '3px solid rgba(255,255,255,0.5)',
    },
    name: { fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: 'white' },
    sub: { opacity: 0.8, fontSize: '14px', color: 'white' },
    ringArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' },
    ringContainer: { position: 'relative', width: '100px', height: '100px' },
    ringText: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' },
    ringBig: { fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: '#4e6e52', lineHeight: 1 },
    ringSmall: { fontSize: '11px', color: '#7a6e68' },
    section: { background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 4px 24px rgba(44,36,32,0.08)' },
    h3: { fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#4e6e52', marginBottom: '16px' },
    chips: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
    chip: (active, editable) => ({
      padding: '7px 14px', border: `1.5px solid ${active ? '#7a9e7e' : '#e8e0d8'}`,
      borderRadius: '20px', fontSize: '13px',
      background: active ? '#7a9e7e' : 'white',
      color: active ? 'white' : '#2c2420',
      cursor: editable ? 'pointer' : 'default',
      transition: 'all 0.2s',
    }),
    label: { fontSize: '12px', fontWeight: 500, color: '#7a6e68', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
    select: { width: '100%', padding: '11px 14px', border: '1.5px solid #e8e0d8', borderRadius: '10px', fontSize: '14px', outline: 'none', marginBottom: '14px' },
    textarea: { width: '100%', padding: '11px 14px', border: '1.5px solid #e8e0d8', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '70px' },
    settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0ebe4' },
    settingLabel: { fontSize: '14px' },
    settingVal: { fontSize: '13px', color: '#4e6e52', fontWeight: 500 },
    divider: { height: '1px', background: '#ede6da', margin: '16px 0' },
    btnEdit: { padding: '9px 20px', background: 'transparent', border: '1.5px solid #7a9e7e', color: '#4e6e52', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' },
    btnSave: { padding: '9px 20px', background: '#4e6e52', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
    btnLogout: { width: '100%', padding: '12px', background: 'transparent', border: '1.5px solid #c47b6a', color: '#c47b6a', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', marginTop: '8px' },
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={s.header}>
        <div style={s.bigAvatar}>🌿</div>
        <h2 style={s.name}>{profile?.nombre}</h2>
        <p style={s.sub}>Participante desde {new Date(profile?.created_at || Date.now()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Quota ring */}
      <div style={s.ringArea}>
        <div style={s.ringContainer}>
          <svg style={{ transform: 'rotate(-90deg)' }} width="100" height="100" viewBox="0 0 100 100">
            <circle fill="none" stroke="#ede6da" strokeWidth="8" cx="50" cy="50" r="40" />
            <circle fill="none" stroke="#7a9e7e" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circum} strokeDashoffset={offset}
              cx="50" cy="50" r="40" style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div style={s.ringText}>
            <div style={s.ringBig}>{clasesUsadas}</div>
            <div style={s.ringSmall}>de 2</div>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#7a6e68', marginTop: '8px' }}>Clases usadas este mes</p>
      </div>

      {/* Health form */}
      <div style={s.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ ...s.h3, marginBottom: 0 }}>Mi ficha de salud</h3>
          {!editando
            ? <button style={s.btnEdit} onClick={() => setEditando(true)}>✏️ Editar</button>
            : <div style={{ display: 'flex', gap: '8px' }}>
                <button style={s.btnSave} onClick={saveProfile} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                <button style={s.btnEdit} onClick={() => { setEditando(false); setForm({ condiciones_fisicas: profile?.condiciones_fisicas || [], enfermedades: profile?.enfermedades || [], nivel_experiencia: profile?.nivel_experiencia || 'principiante', notas_salud: profile?.notas_salud || '' }) }}>Cancelar</button>
              </div>
          }
        </div>

        <label style={s.label}>Condiciones físicas</label>
        <div style={s.chips}>
          {(editando ? CONDICIONES : (profile?.condiciones_fisicas?.length > 0 ? profile.condiciones_fisicas : ['Ninguna'])).map(c => (
            <span key={c}
              style={s.chip(form.condiciones_fisicas.includes(c) || (!editando && profile?.condiciones_fisicas?.includes(c)), editando)}
              onClick={() => editando && toggle('condiciones_fisicas', c)}>
              {c}
            </span>
          ))}
        </div>

        <label style={s.label}>Enfermedades / condiciones médicas</label>
        <div style={s.chips}>
          {(editando ? ENFERMEDADES : (profile?.enfermedades?.length > 0 ? profile.enfermedades : ['Ninguna'])).map(e => (
            <span key={e}
              style={s.chip(form.enfermedades.includes(e) || (!editando && profile?.enfermedades?.includes(e)), editando)}
              onClick={() => editando && toggle('enfermedades', e)}>
              {e}
            </span>
          ))}
        </div>

        {editando && (
          <>
            <label style={s.label}>Nivel</label>
            <select style={s.select} value={form.nivel_experiencia} onChange={e => setForm({...form, nivel_experiencia: e.target.value})}>
              <option value="principiante">Principiante</option>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
            <label style={s.label}>Notas adicionales</label>
            <textarea style={s.textarea} value={form.notas_salud} onChange={e => setForm({...form, notas_salud: e.target.value})} placeholder="Otras condiciones, medicación, preferencias..." />
          </>
        )}
        {!editando && profile?.nivel_experiencia && (
          <p style={{ fontSize: '13px', color: '#7a6e68' }}>Nivel: <strong style={{ color: '#4e6e52' }}>{profile.nivel_experiencia}</strong></p>
        )}
      </div>

      {/* Settings */}
      <div style={s.section}>
        <h3 style={s.h3}>Ajustes</h3>
        <div style={s.settingRow}><span style={s.settingLabel}>🔔 Recordatorios de clase</span><span style={s.settingVal}>Activados</span></div>
        <div style={s.settingRow}><span style={s.settingLabel}>📧 Emails de aviso</span><span style={s.settingVal}>Activados</span></div>
        <div style={{ ...s.settingRow, borderBottom: 'none' }}><span style={s.settingLabel}>📅 Google Calendar</span><span style={s.settingVal}>Conectado</span></div>
        <div style={s.divider} />
        <button style={s.btnLogout} onClick={onLogout}>Cerrar sesión</button>
      </div>
    </div>
  )
}
