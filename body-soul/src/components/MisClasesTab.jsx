import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function MisClasesTab({ session, clasesUsadas, setClasesUsadas, showToast }) {
  const [proximas, setProximas] = useState([])
  const [historial, setHistorial] = useState([])
  const [enEspera, setEnEspera] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    // My upcoming classes
    const { data: proxData } = await supabase
      .from('inscripciones')
      .select('*, clases(*)')
      .eq('user_id', session.user.id)
      .eq('estado', 'confirmada')
      .gte('clases.fecha', today)
      .order('clases(fecha)', { ascending: true })

    // Past classes
    const { data: histData } = await supabase
      .from('inscripciones')
      .select('*, clases(*)')
      .eq('user_id', session.user.id)
      .eq('estado', 'confirmada')
      .lt('clases.fecha', today)
      .order('clases(fecha)', { ascending: false })
      .limit(5)

    // Waitlist
    const { data: esperaData } = await supabase
      .from('lista_espera')
      .select('*, clases(*)')
      .eq('user_id', session.user.id)
      .order('posicion', { ascending: true })

    setProximas((proxData || []).filter(i => i.clases))
    setHistorial((histData || []).filter(i => i.clases))
    setEnEspera((esperaData || []).filter(i => i.clases))
    setLoading(false)
  }

  const cancelar = async (inscripcionId, claseId) => {
    const { error } = await supabase
      .from('inscripciones')
      .update({ estado: 'cancelada' })
      .eq('id', inscripcionId)
    if (error) { showToast('❌ Error al cancelar'); return }
    showToast('❌ Plaza cancelada. Se avisará al siguiente en lista de espera 📩')
    loadData()
  }

  const formatFecha = (fecha) => {
    const d = new Date(fecha)
    return {
      dia: d.getDate(),
      mes: d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
      full: d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    }
  }

  const s = {
    title: { fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, marginBottom: '4px' },
    sub: { fontSize: '13px', color: '#7a6e68', marginBottom: '20px' },
    card: {
      background: 'white', borderRadius: '16px', padding: '16px 20px', marginBottom: '12px',
      boxShadow: '0 4px 24px rgba(44,36,32,0.08)', display: 'flex', alignItems: 'center', gap: '16px',
    },
    dateBox: {
      background: '#4e6e52', color: 'white', borderRadius: '10px',
      padding: '10px 14px', textAlign: 'center', minWidth: '52px',
    },
    day: { fontSize: '22px', fontWeight: 700, lineHeight: 1 },
    month: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85 },
    info: { flex: 1 },
    className: { fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', marginBottom: '2px' },
    classMeta: { fontSize: '13px', color: '#7a6e68' },
    reminderBadge: {
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '11px', background: '#fff3e0', color: '#c77a2a',
      padding: '3px 10px', borderRadius: '20px', marginTop: '6px',
    },
    btnCancel: {
      padding: '7px 14px', background: 'transparent', border: '1.5px solid #c47b6a',
      color: '#c47b6a', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
      whiteSpace: 'nowrap',
    },
    waitCard: {
      background: '#fff8ee', border: '1.5px dashed #c9a96e', borderRadius: '16px',
      padding: '14px 18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '14px',
    },
    sectionDivider: { height: '1px', background: '#ede6da', margin: '24px 0' },
    sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', marginBottom: '14px' },
    histCard: {
      background: 'white', borderRadius: '16px', padding: '14px 20px', marginBottom: '10px',
      boxShadow: '0 4px 24px rgba(44,36,32,0.06)', display: 'flex', alignItems: 'center', gap: '14px',
      opacity: 0.65,
    },
    emptyState: { textAlign: 'center', padding: '40px 0', color: '#7a6e68' },
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#7a6e68' }}>Cargando...</div>

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <h2 style={s.title}>Mis clases</h2>
      <p style={s.sub}>Este mes: {clasesUsadas} de 4 clases usadas</p>

      {proximas.length === 0 && enEspera.length === 0 && (
        <div style={s.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌿</div>
          <p>No tienes clases reservadas</p>
          <p style={{ fontSize: '13px', marginTop: '6px' }}>Apúntate a una clase en la pestaña Clases</p>
        </div>
      )}

      {proximas.map(i => {
        const f = formatFecha(i.clases.fecha)
        return (
          <div key={i.id} style={s.card}>
            <div style={s.dateBox}>
              <div style={s.day}>{f.dia}</div>
              <div style={s.month}>{f.mes}</div>
            </div>
            <div style={s.info}>
              <div style={s.className}>{i.clases.nombre}</div>
              <div style={s.classMeta}>{i.clases.hora?.slice(0,5)}h · {i.clases.duracion_minutos} min{i.clases.profesora ? ` · 👩‍🏫 ${i.clases.profesora}` : ''}{i.clases.ubicacion ? ` · 📍 ${i.clases.ubicacion}` : ''}</div>
              <div style={s.reminderBadge}>🔔 Recordatorio 24h antes</div>
            </div>
            <button style={s.btnCancel} onClick={() => cancelar(i.id, i.clase_id)}>Cancelar</button>
          </div>
        )
      })}

      {enEspera.map(e => (
        <div key={e.id} style={s.waitCard}>
          <span style={{ fontSize: '28px' }}>⏳</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{e.clases.nombre}</div>
            <div style={{ fontSize: '13px', color: '#7a6e68' }}>
              {formatFecha(e.clases.fecha).dia} {e.clases.hora?.slice(0,5)}h · Posición #{e.posicion}
            </div>
            <div style={{ fontSize: '12px', color: '#c9a96e', marginTop: '4px' }}>
              Te avisaremos si se libera una plaza 📩
            </div>
          </div>
        </div>
      ))}

      {historial.length > 0 && (
        <>
          <div style={s.sectionDivider} />
          <div style={s.sectionTitle}>Historial</div>
          {historial.map(i => {
            const f = formatFecha(i.clases.fecha)
            return (
              <div key={i.id} style={s.histCard}>
                <div style={{ ...s.dateBox, background: '#7a6e68' }}>
                  <div style={s.day}>{f.dia}</div>
                  <div style={s.month}>{f.mes}</div>
                </div>
                <div style={s.info}>
                  <div style={s.className}>{i.clases.nombre}</div>
                  <div style={s.classMeta}>{i.clases.hora?.slice(0,5)}h · ✅ Asistida</div>
                </div>
                <span style={{ fontSize: '20px' }}>⭐</span>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
