'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) setError(error.message)
      else router.push('/')
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email,
            username,
          }),
        })

        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm text-center font-sans">
      <h1 className="text-3xl font-semibold tracking-tight text-base-700 mb-1">
        highlights
      </h1>

      <p className="text-base-400 text-sm mb-8">
        {isLogin ? 'Welcome back' : 'Start logging your days'}
      </p>

      <div className="bg-white border border-base-200 rounded-md p-6 flex flex-col gap-4 text-left">
        {!isLogin && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-base-500 font-medium">
              Username
            </label>
            <input
              className="border border-base-200 rounded-md px-3 py-2.5 text-sm text-base-700 outline-none focus:border-base-400 transition-colors"
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
            className="border border-base-200 rounded-md px-3 py-2.5 text-sm text-base-700 outline-none focus:border-base-400 transition-colors"
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
            className="border border-base-200 rounded-md px-3 py-2.5 text-sm text-base-700 outline-none focus:border-base-400 transition-colors"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}

        <div className="text-center">
          <p
            onClick={handleSubmit}
            className="text-sm font-semibold text-base-700 cursor-pointer hover:text-base-500 transition-colors"
          >
            {loading
              ? 'Loading...'
              : isLogin
              ? 'Log in'
              : 'Sign up'}
          </p>
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
    </div>
  )
}