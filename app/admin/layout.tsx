import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Mic2, LogOut } from 'lucide-react'
import { getAdminUser } from '@/lib/auth/isAdmin'
import { AdminSignOutButton } from '@/app/admin/AdminSignOutButton'

const nav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/agents', label: 'Agents', icon: Mic2 },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/practice')
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      <aside className="flex w-56 flex-col border-r border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Admin</p>
          <p className="truncate text-sm font-semibold text-zinc-900">Cold Call Coach</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-100 p-2">
          <Link
            href="/practice"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
          >
            <LogOut className="size-4 shrink-0 rotate-180" aria-hidden />
            User practice
          </Link>
          <AdminSignOutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
