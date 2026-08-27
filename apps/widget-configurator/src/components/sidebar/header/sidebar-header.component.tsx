import { ReactNode } from 'react'

import { ProductLogo, ProductVariant } from '@cowprotocol/ui'

import { PaletteMode } from '@mui/material'
import Box from '@mui/material/Box'

import { CowWidgetTitle } from './cow-widget-title.component'

import { WidgetMode } from '../../../configurator.types'
import { BRAND_COLOR } from '../../../theme/palettes.constants'
import { SidebarEnvBadge } from '../env-badge/SidebarEnvBadge.component'

import type { WidgetSdkVersion } from '../../../utils/widget-sdk-versions/widget-sdk-versions.constants'

export interface SidebarHeaderProps {
  themeMode: PaletteMode
  widgetMode: WidgetMode
  baseUrl: string
  sdkVersion: WidgetSdkVersion
}

export function SidebarHeader({ themeMode, widgetMode, baseUrl, sdkVersion }: SidebarHeaderProps): ReactNode {
  const brandColor = BRAND_COLOR[themeMode]

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
        minHeight: '64px',
        p: '16px',
        flex: '0 0 auto',
        background: (theme) => theme.palette.background.paper,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'flex-start',
          gap: '8px',
          width: '100%',
        }}
      >
        <ProductLogo
          variant={ProductVariant.CowSwap}
          theme={themeMode}
          logoIconOnly
          height={28}
          overrideColor={brandColor}
          overrideHoverColor={brandColor}
        />
        <Box
          component="h1"
          aria-label="CoW Widget"
          sx={{
            m: 0,
            display: 'flex',
            alignItems: 'center',
            color: brandColor,
            height: '2rem',
            flex: '0 0 auto',

            '& svg': {
              display: 'block',
              height: '100%',
              width: 'auto',
            },
          }}
        >
          <CowWidgetTitle />
        </Box>
        <SidebarEnvBadge baseUrl={baseUrl} configuratorOrigin={location.origin} sdkVersion={sdkVersion} />
      </Box>

      {widgetMode !== 'standalone' && (
        <Box sx={{ mt: '16px' }}>
          {/* @ts-ignore */}
          <appkit-button />
        </Box>
      )}
    </Box>
  )
}
