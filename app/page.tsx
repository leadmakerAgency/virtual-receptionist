import { redirect } from 'next/navigation'
import { getAdminUser, getSessionWithProfile, isAdminUser } from '@/lib/auth/isAdmin'

export default async function RootPage() {
  const admin = await getAdminUser()
  if (admin) {
    redirect('/admin')
  }

  const session = await getSessionWithProfile()
  if (session && !isAdminUser(session)) {
    redirect('/auth/exit')
  }

  redirect('/login')
}
