import { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'

import { getEnvColor, getEnvLabel } from '../../../utils/base-url/baseUrl'
import {
  NPM_WIDGET_REACT_LATEST_VERSION,
  type WidgetSdkVersion,
} from '../../../utils/widget-sdk-versions/widget-sdk-versions.constants'
import { getSdkEnvColor, getSdkEnvLabel } from '../../../utils/widget-sdk-versions/widget-sdk-versions.utils'

export interface SidebarEnvBadgeProps {
  brandColor: string
  baseUrl: string
  configuratorOrigin: string
  sdkVersion: WidgetSdkVersion
}

export function SidebarEnvBadge({
  brandColor,
  baseUrl,
  configuratorOrigin,
  sdkVersion,
}: SidebarEnvBadgeProps): ReactNode {
  const configuratorLabel = getEnvLabel(configuratorOrigin)
  const widgetAppLabel = getEnvLabel(baseUrl)
  const sdkLabel = getSdkEnvLabel(sdkVersion)

  const showBadge =
    configuratorLabel !== 'Production' ||
    widgetAppLabel !== 'Production' ||
    sdkVersion !== NPM_WIDGET_REACT_LATEST_VERSION

  const segmentColors = [
    getEnvColor(brandColor, configuratorOrigin),
    getSdkEnvColor(brandColor, sdkVersion),
    getEnvColor(brandColor, baseUrl),
  ] as const

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
              <td style={{ textAlign: 'right' }}>SDK:</td>
              <td>{sdkLabel}</td>
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: showBadge ? 'auto' : 'none',
        }}
      >
        <Box
          role="img"
          aria-hidden={!showBadge}
          sx={{
            display: 'flex',
            width: '24px',
            height: '24px',
            opacity: showBadge ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            gap: '2px',
          }}
        >
          {segmentColors.map((color, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                minWidth: 0,
                backgroundColor: color,
                borderRadius: '2px',
                boxShadow: `0 0 2px 0 ${color}, 0 0 16px 0 ${color}, 0 0 32px 0 ${color}`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Tooltip>
  )
}
