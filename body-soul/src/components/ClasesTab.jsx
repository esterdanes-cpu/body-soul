import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TIPO_STYLE = {
  flow:       { background: '#e8f0e9', color: '#4e6e52', label: 'Flow' },
  restaurativo: { background: '#f5eee8', color: '#6b5344', label: 'Restaurativo' },
  power:      { background: '#f0e8f5', color: '#7a5ea0', label: 'Power' },
  meditacion: { background: '#e8f0e9', color: '#4e6e52', label: 'Meditación' },
}

export default function ClasesTab({ session, profile, clasesUsadas, setClasesUsadas, showToast }) {
  const [clases, setClases] = useState([])
  const [inscripciones, setInscripciones] = useState([]) // clase_ids donde estoy apuntada
  const [enEspera, setEnEspera] = useState([])           // clase_ids donde estoy en espera
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { type: 'enroll'|'waitlist'|'unenroll', claseId, clase }

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    // Load upcoming classes with spot counts
    const { data: clasesData } = await supabase
      .from('clases_con_plazas')
      .select('*')
      .gte('fecha', today)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true })

    // Load my enrollments
    const { data: inscrData } = await supabase
      .from('inscripciones')
      .select('clase_id')
      .eq('user_id', session.user.id)
      .eq('estado', 'confirmada')

    // Load my waitlist positions
    const { data: esperaData } = await supabase
      .from('lista_espera')
      .select('clase_id')
      .eq('user_id', session.user.id)

    // Count clases this month
    const { data: mesData } = await supabase
      .from('clases_mes_actual')
      .select('clases_usadas')
      .eq('user_id', session.user.id)
      .single()

    setClases(clasesData || [])
    setInscripciones((inscrData || []).map(i => i.clase_id))
    setEnEspera((esperaData || []).map(e => e.clase_id))
    setClasesUsadas(mesData?.clases_usadas || 0)
    setLoading(false)
  }

  const handleEnroll = async (clase) => {
    if (clasesUsadas >= 2) { showToast('⚠️ Has alcanzado el límite de 2 clases este mes'); return }
    if (Number(clase.plazas_libres) <= 0) { setModal({ type: 'waitlist', clase }); return }
    setModal({ type: 'enroll', clase })
  }

  const sendEmail = async (tipo, clase) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('nombre, email')
        .eq('id', session.user.id)
        .single()
      if (!profileData) return
      const fecha = new Date(clase.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          email: profileData.email,
          nombre: profileData.nombre,
          clase: clase.nombre,
          fecha,
          hora: clase.hora?.slice(0, 5) + 'h',
        }),
      })
    } catch (e) { console.log('Email error:', e) }
  }

  const confirmEnroll = async () => {
    const clase = modal.clase
    setModal(null)

    // Check if a cancelled record already exists
    const { data: existing } = await supabase
      .from('inscripciones')
      .select('id, estado')
      .eq('user_id', session.user.id)
      .eq('clase_id', clase.id)
      .single()

    let error
    if (existing) {
      // Update existing record to confirmed
      const { error: updateError } = await supabase
        .from('inscripciones')
        .update({ estado: 'confirmada' })
        .eq('id', existing.id)
      error = updateError
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('inscripciones')
        .insert({ user_id: session.user.id, clase_id: clase.id, estado: 'confirmada' })
      error = insertError
    }

    if (error) { showToast('❌ Error al inscribirse'); return }
    showToast('✅ Plaza reservada. Recibirás un recordatorio 24h antes 📩')
    sendEmail('confirmacion', clase)
    loadData()
  }

  const confirmWaitlist = async () => {
    const clase = modal.clase
    setModal(null)
    // Get current max position
    const { data: posData } = await supabase
      .from('lista_espera')
      .select('posicion')
      .eq('clase_id', clase.id)
      .order('posicion', { ascending: false })
      .limit(1)
    const nextPos = posData?.length > 0 ? posData[0].posicion + 1 : 1
    const { error } = await supabase.from('lista_espera').insert({
      user_id: session.user.id, clase_id: clase.id, posicion: nextPos
    })
    if (error) { showToast('❌ Ya estás en la lista de espera'); return }
    showToast('⏳ Apuntado/a a lista de espera. Te avisaremos si se libera una plaza 📩')
    sendEmail('lista_espera', clase)
    loadData()
  }

  const handleUnenroll = (clase) => setModal({ type: 'unenroll', clase })

  const confirmUnenroll = async () => {
    const clase = modal.clase
    setModal(null)
    const { error } = await supabase.from('inscripciones')
      .update({ estado: 'cancelada' })
      .eq('user_id', session.user.id)
      .eq('clase_id', clase.id)
    if (error) { showToast('❌ Error al cancelar'); return }
    showToast('❌ Plaza cancelada. Se avisará al siguiente en lista de espera 📩')
    loadData()
  }

  const formatFecha = (fecha, hora) => {
    const d = new Date(fecha + 'T' + hora)
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/^\w/, c => c.toUpperCase())
  }

  const spotsPercent = (c) => {
    const pct = (Number(c.inscritas) / Number(c.plazas_maximas)) * 100
    return Math.min(100, pct)
  }

  const spotsColor = (pct) => {
    if (pct >= 100) return '#c47b6a'
    if (pct >= 80) return '#c9a96e'
    return '#7a9e7e'
  }

  const s = {
    title: { fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, marginBottom: '4px' },
    sub: { fontSize: '13px', color: '#7a6e68', marginBottom: '20px' },
    notifBanner: {
      background: 'linear-gradient(135deg, #4e6e52, #7a9e7e)', borderRadius: '16px',
      padding: '16px 20px', marginBottom: '20px', color: 'white',
      display: 'flex', alignItems: 'center', gap: '14px',
      boxShadow: '0 4px 24px rgba(44,36,32,0.08)',
    },
    card: (enrolled) => ({
      background: enrolled ? '#f0f7f1' : 'white',
      borderRadius: '16px', padding: '20px', marginBottom: '14px',
      boxShadow: '0 4px 24px rgba(44,36,32,0.08)',
      borderLeft: `4px solid ${enrolled ? '#4e6e52' : '#7a9e7e'}`,
      transition: 'transform 0.2s',
    }),
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
    className: { fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600 },
    typeChip: (tipo) => ({
      fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
      background: TIPO_STYLE[tipo]?.background || '#ede6da',
      color: TIPO_STYLE[tipo]?.color || '#6b5344',
      fontWeight: 500, letterSpacing: '0.5px',
    }),
    meta: { display: 'flex', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#7a6e68' },
    barBg: { background: '#ede6da', borderRadius: '4px', height: '6px', marginBottom: '14px', overflow: 'hidden' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    spotsText: { fontSize: '12px', color: '#7a6e68' },
    enrolledBadge: {
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '11px', color: '#4e6e52', fontWeight: 500,
      background: '#d4ebd6', padding: '3px 10px', borderRadius: '20px', marginTop: '4px',
    },
    btnEnroll: (type) => ({
      padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
      fontSize: '13px', fontWeight: 500, transition: 'all 0.2s',
      background: type === 'available' ? '#4e6e52' : type === 'enrolled' ? '#e8f0e9' : '#ede6da',
      color: type === 'available' ? 'white' : type === 'enrolled' ? '#4e6e52' : '#a07860',
    }),
    modalOverlay: {
      position: 'fixed', inset: 0, background: 'rgba(44,36,32,0.5)',
      zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease',
    },
    modal: {
      background: 'white', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px',
      width: '100%', maxWidth: '500px', animation: 'slideUp 0.3s ease',
    },
    modalHandle: { width: '40px', height: '4px', background: '#ede6da', borderRadius: '2px', margin: '0 auto 20px' },
    modalTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', marginBottom: '8px' },
    modalSub: { fontSize: '14px', color: '#7a6e68', marginBottom: '20px' },
    btnRow: { display: 'flex', gap: '10px' },
    btnPrimary: { flex: 2, padding: '13px', background: '#4e6e52', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 },
    btnSecondary: { flex: 1, padding: '13px', background: 'transparent', border: '1.5px solid #7a9e7e', color: '#4e6e52', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
    btnDanger: { flex: 1, padding: '13px', background: 'transparent', border: '1.5px solid #c47b6a', color: '#c47b6a', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#7a6e68' }}>Cargando clases...</div>

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={s.notifBanner}>
        <span style={{ fontSize: '32px' }}>🌿</span>
        <div>
          <div style={{ fontWeight: 500, marginBottom: '2px' }}>¡Hola, {profile?.nombre?.split(' ')[0]}!</div>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>Tienes {2 - clasesUsadas} clase{2 - clasesUsadas !== 1 ? 's' : ''} disponible{2 - clasesUsadas !== 1 ? 's' : ''} este mes</div>
        </div>
      </div>

      <h2 style={s.title}>Clases disponibles</h2>
      <p style={s.sub}>Próximas sesiones</p>

      {clases.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7a6e68' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌿</div>
          <p>No hay clases próximas programadas</p>
        </div>
      )}

      {clases.map(c => {
        const pct = spotsPercent(c)
        const isEnrolled = inscripciones.includes(c.id)
        const isWaiting = enEspera.includes(c.id)
        const isFull = Number(c.plazas_libres) <= 0

        return (
          <div key={c.id} style={s.card(isEnrolled)}>
            <div style={s.cardTop}>
              <span style={s.className}>{c.nombre}</span>
              <span style={s.typeChip(c.tipo)}>{TIPO_STYLE[c.tipo]?.label || c.tipo}</span>
            </div>
            <div style={s.meta}>
              <span style={s.metaItem}>📅 {formatFecha(c.fecha, c.hora)}</span>
              <span style={s.metaItem}>🕐 {c.hora?.slice(0,5)}h</span>
              <span style={s.metaItem}>⏱ {c.duracion_minutos} min</span>
            </div>
            <div style={s.barBg}>
              <div style={{ height: '100%', width: `${pct}%`, background: spotsColor(pct), borderRadius: '4px', transition: 'width 0.5s' }} />
            </div>
            <div style={s.footer}>
              <div>
                <div style={s.spotsText}>
                  {isFull
                    ? `Completa · Lista de espera: ${c.en_espera} persona${c.en_espera !== 1 ? 's' : ''}`
                    : `${c.inscritas} / ${c.plazas_maximas} plazas${Number(c.plazas_libres) <= 2 ? ` · ¡Solo ${c.plazas_libres} libre!` : ''}`
                  }
                </div>
                {isEnrolled && <div style={s.enrolledBadge}>✓ Apuntado/a</div>}
                {isWaiting && <div style={{ ...s.enrolledBadge, background: '#fff3e0', color: '#c77a2a' }}>⏳ En lista de espera</div>}
              </div>
              {isEnrolled ? (
                <button style={s.btnEnroll('enrolled')} onClick={() => handleUnenroll(c)}>Cancelar plaza</button>
              ) : isWaiting ? (
                <span style={{ fontSize: '13px', color: '#c9a96e' }}>En espera</span>
              ) : isFull ? (
                <button style={s.btnEnroll('waitlist')} onClick={() => handleEnroll(c)}>Lista espera</button>
              ) : (
                <button style={s.btnEnroll('available')} onClick={() => handleEnroll(c)}>Apuntarme</button>
              )}
            </div>
          </div>
        )
      })}

      {/* MODALS */}
      {modal && (
        <div style={s.modalOverlay} onClick={() => setModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHandle} />
            {modal.type === 'enroll' && (
              <>
                <h3 style={s.modalTitle}>Reservar plaza</h3>
                <p style={s.modalSub}>¿Confirmas tu plaza en <strong>{modal.clase.nombre}</strong>?<br/>{formatFecha(modal.clase.fecha, modal.clase.hora)} · {modal.clase.hora?.slice(0,5)}h</p>
                <div style={s.btnRow}>
                  <button style={s.btnPrimary} onClick={confirmEnroll}>Confirmar plaza</button>
                  <button style={s.btnSecondary} onClick={() => setModal(null)}>Cancelar</button>
                </div>
              </>
            )}
            {modal.type === 'waitlist' && (
              <>
                <h3 style={s.modalTitle}>⏳ Lista de espera</h3>
                <p style={s.modalSub}>Esta clase está llena. ¿Quieres unirte a la lista de espera? Te avisaremos por email si se libera una plaza.</p>
                <div style={s.btnRow}>
                  <button style={s.btnPrimary} onClick={confirmWaitlist}>Apuntarme a lista de espera</button>
                  <button style={s.btnSecondary} onClick={() => setModal(null)}>No</button>
                </div>
              </>
            )}
            {modal.type === 'unenroll' && (
              <>
                <h3 style={s.modalTitle}>Cancelar plaza</h3>
                <p style={s.modalSub}>¿Segura que quieres cancelar tu plaza en <strong>{modal.clase.nombre}</strong>? Si hay alguien en lista de espera, se le avisará automáticamente.</p>
                <div style={s.btnRow}>
                  <button style={s.btnDanger} onClick={confirmUnenroll}>Cancelar mi plaza</button>
                  <button style={s.btnPrimary} onClick={() => setModal(null)}>Quedarme</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
