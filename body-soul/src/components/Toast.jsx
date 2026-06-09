import React from 'react'

const styles = {
  toast: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#4e6e52',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '20px',
    fontSize: '14px',
    zIndex: 999,
    whiteSpace: 'nowrap',
    boxShadow: '0 8px 48px rgba(44,36,32,0.14)',
    animation: 'toastIn 0.3s ease',
  }
}

export default function Toast({ show, msg }) {
  if (!show) return null
  return <div style={styles.toast}>{msg}</div>
}
