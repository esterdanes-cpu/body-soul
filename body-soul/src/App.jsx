import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LoginScreen from './components/LoginScreen'
import HealthForm from './components/HealthForm'
import MainApp from './components/MainApp'
import Toast from './components/Toast'

export default function App() {
  const [screen, setScreen] = useState('login') // 'login' | 'health' | 'app'
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [toast, setToast] = useState({ show: false, msg: '' })
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        loadProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
      setScreen('app')
    } else {
      // New user — show health form
      setIsNewUser(true)
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
      setIsNewUser(true)
      setScreen('health')
    } else {
      loadProfile(sess.user.id)
    }
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
