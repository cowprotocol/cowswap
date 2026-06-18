import { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { Cloud, AlertTriangle } from 'react-feather'

import { getEnvLabel } from '../../../utils/base-url/baseUrl'
import {
  NPM_WIDGET_REACT_LATEST_VERSION,
  type WidgetSdkVersion,
} from '../../../utils/widget-sdk-versions/widget-sdk-versions.constants'
import { getSdkEnvLabel } from '../../../utils/widget-sdk-versions/widget-sdk-versions.utils'

export interface SidebarEnvBadgeProps {
  baseUrl: string
  configuratorOrigin: string
  sdkVersion: WidgetSdkVersion
}

export function SidebarEnvBadge({ baseUrl, configuratorOrigin, sdkVersion }: SidebarEnvBadgeProps): ReactNode {
  const configuratorLabel = getEnvLabel(configuratorOrigin)
  const widgetAppLabel = getEnvLabel(baseUrl)
  const sdkLabel = getSdkEnvLabel(sdkVersion)

  // Do envs differ, are unknown, or is SDK outdated?
  const showAlertIcon =
    configuratorLabel !== widgetAppLabel ||
    (sdkVersion !== NPM_WIDGET_REACT_LATEST_VERSION && sdkVersion !== 'local') ||
    configuratorLabel === 'Unknown' ||
    widgetAppLabel === 'Unknown'

  return (
    <Tooltip
      arrow
      placement="bottom"
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
    >
      <Box
        role="img"
        component="span"
        sx={{
          position: 'absolute',
          width: '20px',
          height: '20px',
          right: 0,
          top: '50%',
          transform: 'translate(0, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: (theme) => theme.palette.warning.main,
        }}
      >
        {showAlertIcon ? <AlertTriangle size={24} /> : <Cloud size={24} />}
      </Box>
    </Tooltip>
  )
}
