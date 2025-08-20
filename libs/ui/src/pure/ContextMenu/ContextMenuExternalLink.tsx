import { ReactNode, useCallback } from 'react'

import { Link2 } from 'react-feather'

import * as styledEl from './styled'

interface ContextMenuExternalLinkProps {
  href: string
  label: string
}

export function ContextMenuExternalLink({ href, label }: ContextMenuExternalLinkProps): ReactNode {
  const handleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    window.open(href, '_blank', 'noopener,noreferrer')
  }, [href])

  return (
    <styledEl.ContextMenuItemLink 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      <Link2 size={16} />
      <span>{label}</span>
    </styledEl.ContextMenuItemLink>
  )
}