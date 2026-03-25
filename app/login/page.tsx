'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle } from 'lucide-react'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setError(null)
    setSignUpSuccess(false)
  }

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode)
    resetForm()
  }

  const handleSignIn = async () => {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      return
    }

    if (!data.user) {
      setError('Login failed. Please try again.')
      return
    }

    const meRes = await fetch('/api/me')
    if (meRes.ok) {
      const me = (await meRes.json()) as { isAdmin?: boolean }
      router.push(me.isAdmin ? '/admin' : '/practice')
    } else {
      router.push('/practice')
    }
    router.refresh()
  }

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${appUrl}/auth/confirm`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // Check if email confirmation is required
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session) {
      // Email confirmation not required — signed in immediately
      const meRes = await fetch('/api/me')
      if (meRes.ok) {
        const me = (await meRes.json()) as { isAdmin?: boolean }
        router.push(me.isAdmin ? '/admin' : '/practice')
      } else {
        router.push('/practice')
      }
      router.refresh()
    } else {
      // Email confirmation is required
      setSignUpSuccess(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        await handleSignIn()
      } else {
        await handleSignUp()
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (signUpSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mb-6 text-gray-500">
            We've sent a confirmation link to{' '}
            <span className="font-medium text-gray-900">{email}</span>. Click the link
            to activate your account, then sign in.
          </p>
          <Button
            onClick={() => handleModeSwitch('signin')}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Back to sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center">
            <Image
              src="https://cdn.prod.website-files.com/635b136ad9dc07c8ea095fdb/6734c390a167ec14434b314a_LeadMaker%20Vector%20Logo-01%20-%20Copy-p-500.png"
              alt="LeadMaker logo"
              width={180}
              height={180}
              className="h-24 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cold Call Coach</h1>
          <p className="mt-1 text-sm text-gray-500">
            Practice your pitch. Close more deals.
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {/* Mode tabs */}
            <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create account
              </button>
            </div>

            {error && (
              <Alert
                className="mb-5 border-red-200 bg-red-50"
                aria-live="assertive"
              >
                <AlertDescription className="text-sm text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className="h-10"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                  {mode === 'signup' && (
                    <span className="ml-1 font-normal text-gray-400">
                      (min. 8 characters)
                    </span>
                  )}
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === 'signup' ? 'new-password' : 'current-password'
                  }
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="mt-2 h-11 w-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : mode === 'signin' ? (
                  'Sign in'
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-400">
          {mode === 'signin'
            ? "Don't have an account? Switch to Create account above."
            : 'Practice cold calling with an AI prospect after signing up.'}
        </p>
      </div>
    </div>
  )
}
