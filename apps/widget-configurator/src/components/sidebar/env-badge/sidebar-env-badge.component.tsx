import { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'

import { getEnvColor, getEnvLabel } from '../../../utils/baseUrl'

export interface SidebarEnvBadgeProps {
  brandColor: string
  baseUrl: string
  configuratorOrigin: string
}

export function SidebarEnvBadge({ brandColor, baseUrl, configuratorOrigin }: SidebarEnvBadgeProps): ReactNode {
  const configuratorLabel = getEnvLabel(configuratorOrigin)
  const widgetAppLabel = getEnvLabel(baseUrl)
  const showBadge = configuratorLabel !== 'Production' || widgetAppLabel !== 'Production'

  return (
    <Tooltip
      arrow
      title={
        <table>
          <tbody>
            <tr>
              <td style={{ textAlign: 'right' }}>Configurator:</td>
              <td>{configuratorLabel}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'right' }}>App:</td>
              <td>{widgetAppLabel}</td>
            </tr>
          </tbody>
        </table>
      }
      placement="bottom"
      disableHoverListener={!showBadge}
    >
      <Box
        component="span"
        sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translate(0, -50%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: '8px',
          m: '-8px',
          pointerEvents: showBadge ? 'auto' : 'none',
        }}
      >
        <Box
          sx={{
            width: '16px',
            height: '16px',
            overflow: 'hidden',
            borderRadius: '50%',
            background: getEnvColor(brandColor, configuratorOrigin),
            opacity: showBadge ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            position: 'relative',

            '&::before': {
              content: "''",
              position: 'absolute',
              inset: '0 0 0 50%',
              background: getEnvColor(brandColor, baseUrl),
            },
          }}
        />
      </Box>
    </Tooltip>
  )
}
