import { redirect } from 'next/navigation'
import { getSessionWithProfile, isAdminUser } from '@/lib/auth/isAdmin'
import { AdminSignOutButton } from '@/app/admin/AdminSignOutButton'
import { AdminSidebarNav } from '@/components/admin/AdminSidebarNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionWithProfile()
  if (!session) {
    redirect('/login')
  }
  if (!isAdminUser(session)) {
    redirect('/auth/exit')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-admin-accent-faint/80 via-zinc-50 to-purple-50/60 text-zinc-900">
      <aside className="flex w-56 flex-col border-r border-violet-200/50 bg-white/85 shadow-[4px_0_32px_-16px_rgba(115,34,218,0.18)] backdrop-blur-sm">
        <div className="border-b border-violet-100/80 px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600/80">Admin</p>
          <p className="mt-1 truncate bg-gradient-to-r from-zinc-900 via-admin-accent to-admin-accent-mid bg-clip-text text-sm font-semibold text-transparent">
            LeadMaker LiveFire
          </p>
          <div
            className="mt-3 h-0.5 w-10 rounded-full bg-gradient-to-r from-admin-accent to-admin-accent-light"
            aria-hidden
          />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Admin">
          <AdminSidebarNav />
        </nav>
        <div className="border-t border-violet-100/80 p-2">
          <AdminSignOutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
