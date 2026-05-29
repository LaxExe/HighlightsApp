'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.session) {
        // session is confirmed — safe to redirect
        router.push('/')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // create the user record in your DB regardless
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email,
            username,
          }),
        })

        if (!res.ok) {
          setError('Account created but profile setup failed. Please contact support.')
          setLoading(false)
          return
        }

        if (data.session) {
          // email confirmation is OFF — session exists, safe to redirect
          router.push('/')
        } else {
          // email confirmation is ON — session is null until confirmed
          setConfirmationSent(true)
        }
      }
    }

    setLoading(false)
  }

  if (confirmationSent) {
    return (
      <div className="fixed inset-0 bg-base-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="w-full max-w-md text-center font-sans flex flex-col items-center">
          <img
            src="/favicon.png"
            alt="Highlights Logo"
            className="w-12 h-12 mb-4 object-contain"
          />
          <h1 className="text-3xl font-semibold tracking-tight text-base-700 mb-1">
            Check your email
          </h1>
          <p className="text-base-400 text-sm mt-2">
            We sent a confirmation link to <span className="text-base-600 font-medium">{email}</span>.
            Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-base-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-md text-center font-sans flex flex-col items-center">
        <Link href="/home" className="flex flex-col items-center group">
          <img
            src="/favicon.png"
            alt="Highlights Logo"
            className="w-12 h-12 mb-4 object-contain transition-transform group-hover:scale-105"
          />
          <h1 className="text-3xl font-semibold tracking-tight text-base-700 mb-1 group-hover:text-base-900 transition-colors">
            highlights
          </h1>
        </Link>

        <p className="text-base-400 text-sm mb-8">
          {isLogin ? 'Welcome back' : 'Start logging your days'}
        </p>

        <div className="bg-white border border-base-200 rounded-md p-6 flex flex-col gap-4 text-left shadow-sm">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-base-500 font-medium">
                Username
              </label>
              <input
                className="border border-base-200 rounded-md px-3 py-2.5 text-sm text-base-700 outline-none focus:border-base-400 transition-colors bg-white"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-base-500 font-medium">
              Email
            </label>
            <input
              className="border border-base-200 rounded-md px-3 py-2.5 text-sm text-base-700 outline-none focus:border-base-400 transition-colors bg-white"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-base-500 font-medium">
              Password
            </label>
            <input
              className="border border-base-200 rounded-md px-3 py-2.5 text-sm text-base-700 outline-none focus:border-base-400 transition-colors bg-white"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <div className="text-center mt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 bg-base-100 hover:bg-base-200 text-base-700 border border-base-300 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Loading...' : isLogin ? 'Log in' : 'Sign up'}
            </button>
          </div>
        </div>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-base-400 text-xs mt-4 hover:text-base-600 transition-colors cursor-pointer"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : 'Already have an account? Log in'}
        </p>

        <Link
          href="/home"
          className="text-base-400 text-xs mt-6 hover:text-base-600 transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}