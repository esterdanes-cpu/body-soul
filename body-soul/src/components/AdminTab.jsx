import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ImportarUsuarios from './ImportarUsuarios'

const TIPOS = ['flow', 'restaurativo', 'power', 'meditacion']
const TIPOS_LABEL = { flow: 'Flow', restaurativo: 'Restaurativo', power: 'Power', meditacion: 'Meditación' }

export default function AdminTab({ showToast }) {
  const [stats, setStats] = useState({ alumnas: 0, clasesHoy: 0, enEspera: 0, valoracion: 0 })
  const [alumnas, setAlumnas] = useState([])
  const [nuevaClase, setNuevaClase] = useState({ nombre: '', tipo: 'flow', fecha: '', hora: '10:00', duracion_minutos: 60, plazas_maximas: 12, profesora: 'Ester', ubicacion: 'Sala Body & Soul' })
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('clases') // 'clases' | 'alumnas'

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const today = new Date().toISOString().split('T')[0]
    const [{ count: alumnaCount }, { count: esperaCount }, { data: encuestaData }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('es_admin', false),
      supabase.from('lista_espera').select('*', { count: 'exact', head: true }),
      supabase.from('encuestas').select('estrellas'),
    ])
    const { data: alumnasList } = await supabase.from('profiles').select('*').eq('es_admin', false).order('created_at', { ascending: false })
    const avg = encuestaData?.length > 0 ? (encuestaData.reduce((a, b) => a + b.estrellas, 0) / encuestaData.length).toFixed(1) : '—'
    setStats({ alumnas: alumnaCount || 0, enEspera: esperaCount || 0, valoracion: avg })
    setAlumnas(alumnasList || [])
  }

  const crearClase = async () => {
    if (!nuevaClase.nombre || !nuevaClase.fecha || !nuevaClase.hora) { showToast('⚠️ Rellena todos los campos'); return }
    setLoading(true)
    const { error } = await supabase.from('clases').insert(nuevaClase)
    setLoading(false)
    if (error) { showToast('❌ Error: ' + error.message); return }
    showToast('✅ Clase creada correctamente')
    setNuevaClase({ nombre: '', tipo: 'flow', fecha: '', hora: '10:00', duracion_minutos: 60, plazas_maximas: 12 })
    loadData()
  }

  const s = {
    title: { fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, marginBottom: '4px' },
    sub: { fontSize: '13px', color: '#7a6e68', marginBottom: '20px' },
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
    statBox: { background: 'white', borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 4px 24px rgba(44,36,32,0.08)' },
    statNum: { fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', color: '#4e6e52', lineHeight: 1 },
    statLabel: { fontSize: '12px', color: '#7a6e68', marginTop: '4px' },
    tabRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
    tabBtn: (active) => ({
      padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
      background: active ? '#4e6e52' : '#ede6da',
      color: active ? 'white' : '#7a6e68', fontSize: '13px', fontWeight: 500,
    }),
    card: { background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '14px', boxShadow: '0 4px 24px rgba(44,36,32,0.08)' },
    h3: { fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#4e6e52', marginBottom: '16px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 500, color: '#7a6e68', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #e8e0d8', borderRadius: '10px', fontSize: '14px', outline: 'none', marginBottom: '14px' },
    select: { width: '100%', padding: '11px 14px', border: '1.5px solid #e8e0d8', borderRadius: '10px', fontSize: '14px', outline: 'none', marginBottom: '14px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    btnCreate: { width: '100%', padding: '13px', background: loading ? '#a8c5ac' : '#4e6e52', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 },
    alumnaRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #ede6da' },
    avatar: (letter, bg) => ({
      width: '36px', height: '36px', borderRadius: '50%', background: bg || '#7a9e7e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: '14px', fontWeight: 600, flexShrink: 0,
    }),
    alumnaInfo: { flex: 1, minWidth: 0 },
    alumnaName: { fontSize: '14px', fontWeight: 500 },
    alumnaMeta: { fontSize: '12px', color: '#7a6e68', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    condChip: { fontSize: '11px', color: '#c47b6a', background: '#fdf0ed', padding: '2px 8px', borderRadius: '10px', marginTop: '4px', display: 'inline-block' },
  }

  const avatarColors = ['#7a9e7e', '#a07860', '#c9a96e', '#7a5ea0', '#4e6e52', '#c47b6a']

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <h2 style={s.title}>Panel Admin</h2>
      <p style={s.sub}>Vista general de Body & Soul</p>

      <div style={s.statsGrid}>
        <div style={s.statBox}><div style={s.statNum}>{stats.alumnas}</div><div style={s.statLabel}>Participantes activos</div></div>
        <div style={s.statBox}><div style={s.statNum}>{stats.enEspera}</div><div style={s.statLabel}>En lista de espera</div></div>
        <div style={s.statBox}><div style={s.statNum}>{stats.valoracion}⭐</div><div style={s.statLabel}>Valoración media</div></div>
        <div style={s.statBox}><div style={s.statNum}>{alumnas.filter(a => a.condiciones_fisicas?.length > 0).length}</div><div style={s.statLabel}>Con condiciones</div></div>
      </div>

      <div style={s.tabRow}>
        <button style={s.tabBtn(tab === 'clases')} onClick={() => setTab('clases')}>➕ Nueva clase</button>
        <button style={s.tabBtn(tab === 'alumnas')} onClick={() => setTab('alumnas')}>👥 Participantes ({alumnas.length})</button>
        <button style={s.tabBtn(tab === 'importar')} onClick={() => setTab('importar')}>📧 Importar</button>
      </div>

      {tab === 'clases' && (
        <div style={s.card}>
          <h3 style={s.h3}>Nueva clase</h3>
          <label style={s.label}>Nombre de la clase</label>
          <input style={s.input} type="text" placeholder="Ej: Yoga Flow matutino" value={nuevaClase.nombre} onChange={e => setNuevaClase({...nuevaClase, nombre: e.target.value})} />
          <label style={s.label}>Tipo</label>
          <select style={s.select} value={nuevaClase.tipo} onChange={e => setNuevaClase({...nuevaClase, tipo: e.target.value})}>
            {TIPOS.map(t => <option key={t} value={t}>{TIPOS_LABEL[t]}</option>)}
          </select>
          <div style={s.grid2}>
            <div>
              <label style={s.label}>Fecha</label>
              <input style={s.input} type="date" value={nuevaClase.fecha} onChange={e => setNuevaClase({...nuevaClase, fecha: e.target.value})} />
            </div>
            <div>
              <label style={s.label}>Hora</label>
              <input style={s.input} type="time" value={nuevaClase.hora} onChange={e => setNuevaClase({...nuevaClase, hora: e.target.value})} />
            </div>
          </div>
          <div style={s.grid2}>
            <div>
              <label style={s.label}>Plazas máx.</label>
              <input style={s.input} type="number" value={nuevaClase.plazas_maximas} onChange={e => setNuevaClase({...nuevaClase, plazas_maximas: Number(e.target.value)})} />
            </div>
            <div>
              <label style={s.label}>Duración (min)</label>
              <input style={s.input} type="number" value={nuevaClase.duracion_minutos} onChange={e => setNuevaClase({...nuevaClase, duracion_minutos: Number(e.target.value)})} />
            </div>
          </div>
          <div style={s.grid2}>
            <div>
              <label style={s.label}>Profesora</label>
              <input style={s.input} type="text" placeholder="Ej: Ester" value={nuevaClase.profesora} onChange={e => setNuevaClase({...nuevaClase, profesora: e.target.value})} />
            </div>
            <div>
              <label style={s.label}>Ubicación</label>
              <input style={s.input} type="text" placeholder="Ej: Sala Body & Soul" value={nuevaClase.ubicacion} onChange={e => setNuevaClase({...nuevaClase, ubicacion: e.target.value})} />
            </div>
          </div>
          <button style={s.btnCreate} onClick={crearClase} disabled={loading}>
            {loading ? 'Creando...' : '✅ Crear clase'}
          </button>
        </div>
      )}

      {tab === 'importar' && (
        <ImportarUsuarios profile={{ es_admin: true }} />
      )}
        <div style={s.card}>
          <h3 style={s.h3}>Participantes registrados</h3>
          {alumnas.length === 0 && <p style={{ color: '#7a6e68', fontSize: '14px' }}>Aún no hay participantes registrados</p>}
          {alumnas.map((a, i) => (
            <div key={a.id} style={{ ...s.alumnaRow, borderBottom: i === alumnas.length - 1 ? 'none' : '1px solid #ede6da' }}>
              <div style={s.avatar(a.avatar_letra, avatarColors[i % avatarColors.length])}>{a.avatar_letra || '?'}</div>
              <div style={s.alumnaInfo}>
                <div style={s.alumnaName}>{a.nombre}</div>
                <div style={s.alumnaMeta}>{a.email} · {a.nivel_experiencia}</div>
                {a.condiciones_fisicas?.filter(c => c !== 'Ninguna').length > 0 && (
                  <div style={s.condChip}>⚠️ {a.condiciones_fisicas.filter(c => c !== 'Ninguna').join(', ')}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
