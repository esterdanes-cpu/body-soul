import React, { useState } from 'react'
import ClasesTab from './ClasesTab'
import MisClasesTab from './MisClasesTab'
import EncuestaTab from './EncuestaTab'
import AdminTab from './AdminTab'
import PerfilTab from './PerfilTab'

export default function MainApp({ session, profile, setProfile, onLogout, showToast }) {
  const [tab, setTab] = useState('clases')
  const [clasesUsadas, setClasesUsadas] = useState(0)

  const tabs = [
    { id: 'clases', icon: '📅', label: 'Clases' },
    { id: 'mis-clases', icon: '✅', label: 'Mis clases' },
    { id: 'encuesta', icon: '⭐', label: 'Valorar' },
    ...(profile?.es_admin ? [{ id: 'admin', icon: '🔧', label: 'Admin' }] : []),
    { id: 'perfil', icon: '👤', label: 'Perfil' },
  ]

  const s = {
    wrapper: { minHeight: '100vh', background: '#f7f3ee', paddingBottom: '80px' },
    header: {
      background: 'white', padding: '20px 24px 0',
      boxShadow: '0 2px 12px rgba(44,36,32,0.06)',
      position: 'sticky', top: 0, zIndex: 100,
    },
    headerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
    logo: { fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: '#4e6e52' },
    quotaBadge: {
      background: '#ede6da', borderRadius: '10px', padding: '6px 12px',
      fontSize: '13px', color: '#6b5344', fontWeight: 500,
    },
    avatar: {
      width: '36px', height: '36px', borderRadius: '50%', background: '#7a9e7e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: '15px', cursor: 'pointer', marginLeft: '8px',
    },
    navTabs: { display: 'flex', borderBottom: '2px solid #ede6da' },
    navTab: (active) => ({
      flex: 1, padding: '12px 8px', textAlign: 'center', border: 'none',
      background: 'transparent', fontSize: '12px',
      color: active ? '#4e6e52' : '#7a6e68',
      cursor: 'pointer', borderBottom: active ? '2px solid #4e6e52' : '2px solid transparent',
      marginBottom: '-2px', fontWeight: active ? 500 : 400,
      transition: 'all 0.2s',
    }),
    content: { padding: '24px', maxWidth: '600px', margin: '0 auto' },
    bottomNav: {
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white', display: 'flex', borderTop: '1px solid #ede6da',
      boxShadow: '0 -4px 20px rgba(44,36,32,0.08)', zIndex: 200,
    },
    bottomItem: (active) => ({
      flex: 1, padding: '12px 8px 14px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '4px', cursor: 'pointer', border: 'none',
      background: 'transparent', color: active ? '#4e6e52' : '#7a6e68',
      fontSize: '11px', transition: 'color 0.2s',
    }),
    navIcon: { fontSize: '22px' },
  }

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <div style={s.headerTop}>
          <div style={s.logo}>🌿 Body & Soul</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={s.quotaBadge}>
              Este mes: <strong style={{ color: '#4e6e52' }}>{clasesUsadas}</strong>/4 clases
            </div>
            <div style={s.avatar} onClick={() => setTab('perfil')}>
              {profile?.avatar_letra || '?'}
            </div>
          </div>
        </div>
        <div style={s.navTabs}>
          {tabs.map(t => (
            <button key={t.id} style={s.navTab(tab === t.id)} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.content}>
        {tab === 'clases' && (
          <ClasesTab session={session} profile={profile} clasesUsadas={clasesUsadas} setClasesUsadas={setClasesUsadas} showToast={showToast} />
        )}
        {tab === 'mis-clases' && (
          <MisClasesTab session={session} clasesUsadas={clasesUsadas} setClasesUsadas={setClasesUsadas} showToast={showToast} />
        )}
        {tab === 'encuesta' && (
          <EncuestaTab session={session} showToast={showToast} />
        )}
        {tab === 'admin' && profile?.es_admin && (
          <AdminTab showToast={showToast} />
        )}
        {tab === 'perfil' && (
          <PerfilTab profile={profile} setProfile={setProfile} session={session} clasesUsadas={clasesUsadas} onLogout={onLogout} showToast={showToast} />
        )}
      </div>

      <div style={s.bottomNav}>
        {tabs.map(t => (
          <button key={t.id} style={s.bottomItem(tab === t.id)} onClick={() => setTab(t.id)}>
            <span style={s.navIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
