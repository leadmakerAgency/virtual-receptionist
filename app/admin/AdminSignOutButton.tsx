'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export const AdminSignOutButton = () => {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="mt-1 w-full justify-start gap-2 text-zinc-600 hover:bg-admin-accent-faint/80 hover:text-violet-900"
      onClick={handleSignOut}
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      Sign out
    </Button>
  )
}
