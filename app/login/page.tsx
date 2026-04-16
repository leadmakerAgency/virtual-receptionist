import { LoginForm } from '@/app/login/LoginForm'

type PageProps = {
  searchParams?: Promise<{ notice?: string | string[] }>
}

const getNotice = (value: string | string[] | undefined) => {
  if (!value) return undefined
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const notice = getNotice(params.notice)

  return <LoginForm notice={notice} />
}
