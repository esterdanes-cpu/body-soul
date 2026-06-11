import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SetPassword({ session, onComplete, showToast }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSet = async () => {
    if (!password || password.length < 6) { showToast('⚠️ La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm) { showToast('⚠️ Las contraseñas no coinciden'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { showToast('❌ Error: ' + error.message); return }
    onComplete(data.user ? { user: data.user } : session)
  }

  const s = {
    screen: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #4e6e52 0%, #7a9e7e 45%, #a8c5ac 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 24px',
    },
    logo: { textAlign: 'center', marginBottom: '40px', color: 'white' },
    leaf: { fontSize: '56px', display: 'block', marginBottom: '12px', animation: 'float 3s ease-in-out infinite' },
    h1: { fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, letterSpacing: '2px', color: 'white' },
    sub: { fontSize: '13px', letterSpacing: '4px', opacity: 0.8, textTransform: 'uppercase', marginTop: '4px', color: 'white' },
    card: {
      background: 'white', borderRadius: '24px', padding: '36px 32px',
      width: '100%', maxWidth: '400px',
      boxShadow: '0 8px 48px rgba(44,36,32,0.14)',
    },
    title: { fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, marginBottom: '8px', color: '#2c2420' },
    desc: { fontSize: '14px', color: '#7a6e68', marginBottom: '24px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 500, color: '#7a6e68', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
    input: {
      width: '100%', padding: '12px 16px', border: '1.5px solid #e8e0d8',
      borderRadius: '10px', fontSize: '15px', color: '#2c2420',
      outline: 'none', marginBottom: '16px',
    },
    btn: {
      width: '100%', padding: '14px', background: loading ? '#a8c5ac' : '#4e6e52',
      color: 'white', border: 'none', borderRadius: '12px',
      fontSize: '15px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
    },
  }

  return (
    <div style={s.screen}>
      <div style={s.logo}>
        <span style={s.leaf}>🌿</span>
        <h1 style={s.h1}>Body & Soul</h1>
        <p style={s.sub}>Club de Bienestar · Roche</p>
      </div>
      <div style={s.card}>
        <h2 style={s.title}>Crea tu contraseña</h2>
        <p style={s.desc}>Elige una contraseña para acceder a la app de Body & Soul.</p>
        <label style={s.label}>Nueva contraseña</label>
        <input style={s.input} type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
        <label style={s.label}>Repite la contraseña</label>
        <input style={s.input} type="password" placeholder="Repite la contraseña" value={confirm} onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSet()} />
        <button style={s.btn} onClick={handleSet} disabled={loading}>
          {loading ? 'Guardando...' : 'Crear contraseña y entrar →'}
        </button>
      </div>
    </div>
  )
}
