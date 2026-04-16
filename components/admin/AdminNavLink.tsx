'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type AdminNavLinkProps = {
  href: string
  label: string
  icon: LucideIcon
}

export const AdminNavLink = ({ href, label, icon: Icon }: AdminNavLinkProps) => {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/35 focus-visible:ring-offset-2',
        isActive
          ? 'border border-admin-accent/20 bg-gradient-to-r from-admin-accent/12 via-admin-accent-mid/10 to-admin-accent-light/15 font-medium text-admin-accent shadow-sm shadow-admin-accent/10'
          : 'text-zinc-700 hover:bg-admin-accent-faint/90 hover:text-zinc-900'
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {label}
    </Link>
  )
}
