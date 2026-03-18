import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const getStringParam = (value: string | string[] | undefined) => {
  if (!value) return undefined
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function AuthConfirmedPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const status = getStringParam(params.status)
  const isSuccess = status === 'success'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div
          className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="h-7 w-7 text-green-600" />
          ) : (
            <XCircle className="h-7 w-7 text-red-600" />
          )}
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {isSuccess ? 'Account created successfully' : 'Confirmation failed'}
        </h1>
        <p className="mb-6 text-gray-600">
          {isSuccess
            ? 'Your email is confirmed. You can now sign in and start practicing.'
            : 'This confirmation link is invalid or expired. Please try signing up again or request a new confirmation email.'}
        </p>

        <div className="flex flex-col gap-3">
          <Button asChild className="h-11 bg-indigo-600 text-white hover:bg-indigo-700">
            <Link href="/login">Return back</Link>
          </Button>
          <Button asChild variant="outline" className="h-11">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

