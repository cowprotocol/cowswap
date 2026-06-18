import { ReactNode } from 'react'

import { Color, Font, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { IS_IFRAME } from '../../../configurator.constants'
import { WidgetMode } from '../../../configurator.types'
import { SidebarEnvBadge } from '../env-badge/SidebarEnvBadge.component'

import type { WidgetSdkVersion } from '../../../utils/widget-sdk-versions/widget-sdk-versions.constants'

export type ThemeMode = 'dark' | 'light'

const BRAND_COLOR: Record<ThemeMode, string> = {
  dark: Color.blue300Primary,
  light: Color.blueDark2,
}

export interface SidebarHeaderProps {
  title: string
  themeMode: ThemeMode
  widgetMode: WidgetMode
  baseUrl: string
  sdkVersion: WidgetSdkVersion
}

export function SidebarHeader({ title, themeMode, widgetMode, baseUrl, sdkVersion }: SidebarHeaderProps): ReactNode {
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
          alignItems: 'center',
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
        />
        <Typography
          component="h1"
          sx={{
            fontFamily: Font.family,
            fontWeight: Font.weight.bold,
            fontSize: '2rem',
            lineHeight: 1,
            letterSpacing: 0,
            color: brandColor,
          }}
        >
          {title}
        </Typography>
        <SidebarEnvBadge baseUrl={baseUrl} configuratorOrigin={location.origin} sdkVersion={sdkVersion} />
      </Box>

      {!IS_IFRAME && (
        <>
          {widgetMode !== 'standalone' && (
            <Box sx={{ mt: '16px' }}>
              {/* @ts-ignore */}
              <appkit-button />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
