'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildCoachUrl } from '@/lib/public/coachUrl'

type CoachLinkActionsProps = {
  slug: string
}

export const CoachLinkActions = ({ slug }: CoachLinkActionsProps) => {
  const url = buildCoachUrl(slug)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard may be denied */
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/${slug}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-1 size-3.5" aria-hidden />
          Open
        </Link>
      </Button>
      <Button variant="outline" size="sm" type="button" onClick={handleCopy}>
        {copied ? (
          <>
            <Check className="mr-1 size-3.5 text-emerald-600" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <Copy className="mr-1 size-3.5" aria-hidden />
            Copy link
          </>
        )}
      </Button>
    </div>
  )
}
