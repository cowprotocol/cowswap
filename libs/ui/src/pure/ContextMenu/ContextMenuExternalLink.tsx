import { ReactNode } from 'react'

import { Link2 } from 'react-feather'

import * as styledEl from './styled'

interface ContextMenuExternalLinkProps {
  href: string
  label: string
  'data-click-event'?: string
}

export function ContextMenuExternalLink({
  href,
  label,
  'data-click-event': dataClickEvent,
}: ContextMenuExternalLinkProps): ReactNode {
  return (
    <styledEl.ContextMenuItemLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-click-event={dataClickEvent}
    >
      <Link2 size={16} />
      <span>{label}</span>
    </styledEl.ContextMenuItemLink>
  )
}
