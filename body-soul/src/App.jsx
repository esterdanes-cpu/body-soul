import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LoginScreen from './components/LoginScreen'
import HealthForm from './components/HealthForm'
import MainApp from './components/MainApp'
import SetPassword from './components/SetPassword'
import Toast from './components/Toast'

export default function App() {
  const [screen, setScreen] = useState('login')
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [toast, setToast] = useState({ show: false, msg: '' })

  useEffect(() => {
    // Detect invite/recovery links in URL hash
    const hash = window.location.hash
    if (hash.includes('type=invite') || hash.includes('type=recovery')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSession(session)
          setScreen('setpassword')
        }
      })
      return
    }

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        loadProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED') {
        setSession(session)
        if (screen !== 'setpassword') loadProfile(session?.user?.id)
        return
      }
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    if (!userId) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
      setScreen('app')
    } else {
      setScreen('health')
    }
  }

  const showToast = (msg) => {
    setToast({ show: true, msg })
    setTimeout(() => setToast({ show: false, msg: '' }), 3000)
  }

  const handleLoginSuccess = (sess, newUser = false) => {
    setSession(sess)
    if (newUser) {
      setScreen('health')
    } else {
      loadProfile(sess.user.id)
    }
  }

  const handlePasswordSet = (sess) => {
    setSession(sess)
    loadProfile(sess.user.id)
    showToast('✅ Contraseña creada. ¡Bienvenida!')
  }

  const handleHealthComplete = (profileData) => {
    setProfile(profileData)
    setScreen('app')
    showToast('✅ Ficha guardada. ¡Bienvenida a Body & Soul!')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setScreen('login')
  }

  return (
    <>
      {screen === 'login' && (
        <LoginScreen onSuccess={handleLoginSuccess} showToast={showToast} />
      )}
      {screen === 'setpassword' && (
        <SetPassword session={session} onComplete={handlePasswordSet} showToast={showToast} />
      )}
      {screen === 'health' && (
        <HealthForm session={session} onComplete={handleHealthComplete} showToast={showToast} />
      )}
      {screen === 'app' && (
        <MainApp
          session={session}
          profile={profile}
          setProfile={setProfile}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}
      <Toast show={toast.show} msg={toast.msg} />
    </>
  )
}
