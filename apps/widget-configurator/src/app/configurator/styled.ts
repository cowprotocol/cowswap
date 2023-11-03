import { CSSProperties } from 'react'

import { Theme } from '@mui/material/styles'

import type { PaletteMode } from '@mui/material'

export const WrapperStyled = { display: 'flex', flexFlow: 'column wrap', width: '100%' }

export const DrawerStyled = (theme: Theme) => ({
  width: '29rem',
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: '29rem',
    boxSizing: 'border-box',
    display: 'flex',
    flexFlow: 'column wrap',
    gap: '1.6rem',
    height: '100%',
    border: 0,
    background: theme.palette.background.paper,
    boxShadow: 'rgba(5, 43, 101, 0.06) 0 1.2rem 1.2rem',
    padding: '1.6rem',
  },
})

export const ContentStyled = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexFlow: 'column',
  flex: '1 1 auto',
  margin: '4.2rem auto',

  '> iframe': {
    border: 0,
    margin: '0 auto',
    borderRadius: '1.6rem',
    overflow: 'auto',
  },
}

export const WalletConnectionWrapper = {
  display: 'flex',
  justifyContent: 'center',
}

export const ShowDrawerButton: (mode: PaletteMode) => CSSProperties = (mode: PaletteMode) => ({
  borderRadius: '50%',
  width: '60px',
  height: '60px',
  position: 'fixed',
  left: '20px',
  bottom: '20px',
  background: mode === 'dark' ? 'rgb(63 162 255 / 71%)' : '#fff',
  border: 0,
  fontSize: '24px',
  cursor: 'pointer',
})
