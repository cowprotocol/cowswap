import { ReactNode } from 'react'

import { Color, Font, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { IS_IFRAME } from '../../../configurator.constants'
import { SidebarEnvBadge } from '../env-badge/sidebar-env-badge.component'

const BRAND_COLOR: Record<ThemeMode, string> = {
  dark: Color.blue300Primary,
  light: Color.blueDark2,
}

export type ThemeMode = 'dark' | 'light'

export interface SidebarHeaderProps {
  title: string
  themeMode: ThemeMode
  standaloneMode: boolean
  baseUrl: string
}

export function SidebarHeader({ title, themeMode, standaloneMode, baseUrl }: SidebarHeaderProps): ReactNode {
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
        <SidebarEnvBadge brandColor={brandColor} baseUrl={baseUrl} configuratorOrigin={location.origin} />
      </Box>

      {!IS_IFRAME && (
        <>
          {!standaloneMode && (
            <Box sx={{ mt: '16px' }}>
              {/* Attempt 2 at fixing issue on Vercel build (locally it builds fine) */}
              {/* Error: apps/widget-configurator/src/app/configurator/index.tsx:272:17 - error TS2339: Property 'w3m-button' does not exist on type 'JSX.IntrinsicElements'.*/}
              {/* Fix from https://github.com/reown-com/appkit/issues/3093 */}
              {/* @ts-ignore */}
              <w3m-button />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
