'use client'

import { Mic2 } from 'lucide-react'

import { AdminNavLink } from '@/components/admin/AdminNavLink'

const nav = [{ href: '/admin/agents', label: 'Agents', icon: Mic2 }] as const

export const AdminSidebarNav = () => {
  return (
    <>
      {nav.map(({ href, label, icon }) => (
        <AdminNavLink key={href} href={href} label={label} icon={icon} />
      ))}
    </>
  )
}
