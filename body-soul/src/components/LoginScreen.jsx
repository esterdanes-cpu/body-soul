import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginScreen({ onSuccess, showToast }) {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { showToast('⚠️ Rellena email y contraseña'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { showToast('❌ ' + error.message); return }
    onSuccess(data.session, false)
  }

  const handleRegister = async () => {
    if (!nombre || !email || !password) { showToast('⚠️ Rellena todos los campos'); return }
    if (password.length < 6) { showToast('⚠️ La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) { showToast('❌ ' + error.message); return }
    // Store nombre in session metadata for health form to use
    sessionStorage.setItem('bs_nombre', nombre)
    onSuccess(data.session, true)
  }

  const s = {
    screen: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #4e6e52 0%, #7a9e7e 45%, #a8c5ac 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 24px', position: 'relative', overflow: 'hidden',
    },
    circle: (size, top, right, bottom, left) => ({
      position: 'absolute', borderRadius: '50%', opacity: 0.12,
      background: 'white', width: size, height: size,
      top, right, bottom, left,
    }),
    logo: { textAlign: 'center', marginBottom: '40px', color: 'white' },
    leaf: { fontSize: '56px', display: 'block', marginBottom: '12px', animation: 'float 3s ease-in-out infinite' },
    h1: { fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, letterSpacing: '2px', color: 'white' },
    sub: { fontSize: '13px', letterSpacing: '4px', opacity: 0.8, textTransform: 'uppercase', marginTop: '4px', color: 'white' },
    card: {
      background: 'white', borderRadius: '24px', padding: '36px 32px',
      width: '100%', maxWidth: '400px',
      boxShadow: '0 8px 48px rgba(44,36,32,0.14)',
    },
    tabSwitch: {
      display: 'flex', background: '#ede6da', borderRadius: '10px',
      padding: '4px', marginBottom: '24px',
    },
    tabBtn: (active) => ({
      flex: 1, padding: '8px', border: 'none',
      background: active ? 'white' : 'transparent',
      borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
      color: active ? '#2c2420' : '#7a6e68',
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.2s',
    }),
    label: { display: 'block', fontSize: '12px', fontWeight: 500, color: '#7a6e68', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
    input: {
      width: '100%', padding: '12px 16px', border: '1.5px solid #e8e0d8',
      borderRadius: '10px', fontSize: '15px', color: '#2c2420',
      outline: 'none', marginBottom: '16px', background: 'white',
    },
    btn: {
      width: '100%', padding: '14px', background: loading ? '#a8c5ac' : '#4e6e52',
      color: 'white', border: 'none', borderRadius: '12px',
      fontSize: '15px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
      letterSpacing: '0.5px',
    },
    adminLink: { textAlign: 'center', marginTop: '14px' },
    adminA: { color: '#4e6e52', fontWeight: 500, cursor: 'pointer', fontSize: '14px' },
  }

  return (
    <div style={s.screen}>
      <div style={s.circle(320, '-80px', '-80px', undefined, undefined)} />
      <div style={s.circle(200, undefined, undefined, '-40px', '-60px')} />
      <div style={s.circle(120, '40%', undefined, undefined, '20px')} />

      <div style={s.logo}>
        <span style={s.leaf}>🌿</span>
        <h1 style={s.h1}>Body & Soul</h1>
        <p style={s.sub}>Club de Bienestar · Roche</p>
      </div>

      <div style={s.card}>
        <div style={s.tabSwitch}>
          <button style={s.tabBtn(tab === 'login')} onClick={() => setTab('login')}>Entrar</button>
          <button style={s.tabBtn(tab === 'register')} onClick={() => setTab('register')}>Registrarse</button>
        </div>

        {tab === 'login' ? (
          <>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            <button style={s.btn} onClick={handleLogin} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </>
        ) : (
          <>
            <label style={s.label}>Nombre completo</label>
            <input style={s.input} type="text" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
            <button style={s.btn} onClick={handleRegister} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Continuar →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
