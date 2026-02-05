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
  const handleClick = (event: React.MouseEvent): void => {
    // Stop the click from reaching the Tooltip's onClick handler
    event.stopPropagation()
  }

  return (
    <styledEl.ContextMenuItemLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      data-click-event={dataClickEvent}
    >
      <Link2 size={16} />
      <span>{label}</span>
    </styledEl.ContextMenuItemLink>
  )
}
