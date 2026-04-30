import React, { ReactNode, useContext } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import { ChevronLeft, ChevronRight, Code, Eye, Moon, Sun, RefreshCw } from 'react-feather'

import { UTM_PARAMS } from '../../../configurator.constants'
import { ColorModeContext } from '../../../theme/ColorModeContext'

const WIDGET_WEB_URL = `https://cow.fi/widget/?${UTM_PARAMS}`
const DEVELOPER_DOCS_URL = `https://docs.cow.fi/cow-protocol/tutorials/widget?${UTM_PARAMS}`

export interface SidebarFooterProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  isSnippetOpen: boolean
  onSnippetToggle: () => void
  isWidgetReady: boolean
  isWidgetSyncPending: boolean
  onForceWidgetReload: () => void
}

// eslint-disable-next-line max-lines-per-function
export function SidebarFooter({
  isSidebarOpen,
  onSidebarToggle,
  isSnippetOpen,
  onSnippetToggle,
  isWidgetReady,
  isWidgetSyncPending,
  onForceWidgetReload,
}: SidebarFooterProps): ReactNode {
  const { mode, toggleColorMode } = useContext(ColorModeContext)

  const snippetLabel = isSnippetOpen ? 'See preview' : 'Get code'
  const SnippetIcon = isSnippetOpen ? Eye : Code

  const themeLabel = mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
  const ThemeIcon = mode === 'dark' ? Sun : Moon

  const sidebarLabel = isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'
  const SidebarIcon = isSidebarOpen ? ChevronLeft : ChevronRight

  const externalLinkSx = {
    fontSize: '12px',
    color: 'text.secondary',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: 2,
    '&:hover': {
      textDecorationStyle: 'solid',
      color: 'text.primary',
    },
  } as const

  const iconOnlyButtonSx = {
    borderRadius: 1,
    border: '1px solid',
    borderColor: 'divider',
    height: 40,
    width: 40,
  } as const

  let reloadPreviewLabel = ''

  if (isWidgetSyncPending) {
    reloadPreviewLabel = 'Syncing widget...'
  } else if (!isWidgetReady) {
    reloadPreviewLabel = 'Loading widget... Click to force load.'
  } else {
    reloadPreviewLabel = 'Reload widget'
  }

  return (
    <>
      <div style={{ marginTop: '-1px' }} />

      <Box
        component="footer"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          width: '100%',
          flex: '0 0 auto',
          background: (t) => t.palette.background.paper,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          px: 2,
          pt: 2,
          mt: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            minHeight: 40,
          }}
        >
          <Button
            type="button"
            variant="text"
            size="medium"
            onClick={onSnippetToggle}
            aria-label={snippetLabel}
            disabled={!isWidgetReady}
            endIcon={<SnippetIcon size={20} strokeWidth={2} aria-hidden />}
            sx={{
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              pl: 1.5,
              pr: 2,
              py: 1,
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: 'text.primary',
              height: 40,
              mr: 'auto',

              '& .MuiButton-endIcon': { ml: 1.5 },
            }}
          >
            {snippetLabel}
          </Button>

          <Tooltip title={reloadPreviewLabel} arrow placement="top">
            <IconButton
              type="button"
              onClick={onForceWidgetReload}
              aria-label={reloadPreviewLabel}
              aria-busy={isWidgetSyncPending}
              size="small"
              sx={{
                ...iconOnlyButtonSx,
                '@keyframes cowConfiguratorRefreshSpin': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
                ...(isWidgetSyncPending || !isWidgetReady
                  ? {
                      '& svg': {
                        animation: 'cowConfiguratorRefreshSpin 1s linear infinite',
                      },
                    }
                  : {}),
              }}
            >
              <RefreshCw size={20} strokeWidth={2} aria-hidden />
            </IconButton>
          </Tooltip>

          <Tooltip title={themeLabel} arrow placement="top">
            <IconButton
              type="button"
              onClick={toggleColorMode}
              aria-label={themeLabel}
              size="small"
              sx={iconOnlyButtonSx}
            >
              <ThemeIcon size={20} strokeWidth={2} aria-hidden />
            </IconButton>
          </Tooltip>

          <Tooltip title={sidebarLabel} arrow placement="top">
            <IconButton
              type="button"
              onClick={onSidebarToggle}
              aria-label={sidebarLabel}
              size="small"
              sx={iconOnlyButtonSx}
            >
              <SidebarIcon size={20} strokeWidth={2} aria-hidden />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          component="nav"
          aria-label="External resources"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            columnGap: 1.5,
            rowGap: 0.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            px: 2,
            py: 1,
            mx: -2,
          }}
        >
          <Link href={WIDGET_WEB_URL} target="_blank" rel="noopener noreferrer" sx={externalLinkSx} variant="inherit">
            Widget web
          </Link>
          <Link
            href={DEVELOPER_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            sx={externalLinkSx}
            variant="inherit"
          >
            Developer docs
          </Link>
        </Box>
      </Box>
    </>
  )
}
