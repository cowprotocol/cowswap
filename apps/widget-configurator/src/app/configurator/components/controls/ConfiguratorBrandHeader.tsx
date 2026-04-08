import { ReactNode } from 'react'

import { Color, Font, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface ConfiguratorBrandHeaderProps {
  title: string
  themeMode: 'dark' | 'light'
}

const BRAND_COLOR: Record<ConfiguratorBrandHeaderProps['themeMode'], string> = {
  dark: Color.blue300Primary,
  light: Color.blueDark2,
}

export function ConfiguratorBrandHeader({ title, themeMode }: ConfiguratorBrandHeaderProps): ReactNode {
  const brandColor = BRAND_COLOR[themeMode]

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '3.6rem',
        mb: '1rem',
        px: '4.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.8rem',
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
    </Box>
  )
}
