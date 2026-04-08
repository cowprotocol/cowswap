import React, { ReactNode, useMemo } from 'react'

import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

import { UTM_PARAMS } from '../../../consts'

interface LinkConfig {
  label: string
  url?: string
  onClick?: () => void
}

export interface SidebarFooterProps {
  isSnippetOpen: boolean
  onSnippetToggle: () => void
}

export function SidebarFooter({ isSnippetOpen, onSnippetToggle }: SidebarFooterProps): ReactNode {
  const links: LinkConfig[] = useMemo(() => {
    return [
      isSnippetOpen
        ? { label: 'View preview', onClick: onSnippetToggle }
        : { label: 'View code snippet', onClick: onSnippetToggle },
      { label: 'Widget web', url: `https://cow.fi/widget/?${UTM_PARAMS}` },
      {
        label: 'Developer docs',
        url: `https://docs.cow.fi/cow-protocol/tutorials/widget?${UTM_PARAMS}`,
      },
    ]
  }, [isSnippetOpen, onSnippetToggle])

  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      {links.map(({ label, url, onClick }) => (
        <ListItemButton
          key={label}
          component={onClick ? 'button' : 'a'}
          href={onClick ? undefined : url}
          target={onClick ? undefined : '_blank'}
          rel={onClick ? undefined : 'noopener noreferrer'}
          onClick={onClick}
          sx={{ width: '100%' }}
        >
          <ListItemText primary={label} />
        </ListItemButton>
      ))}
    </List>
  )
}
