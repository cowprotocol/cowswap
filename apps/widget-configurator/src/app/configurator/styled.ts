import { Theme } from '@mui/material/styles'

export const WrapperStyled = { display: 'flex', flexFlow: 'column wrap', width: '100%' }

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const DrawerStyled = (theme: Theme) => ({
  width: '29rem',
  flexShrink: 0,

  '& .MuiDrawer-paper': {
    width: '29rem',
    boxSizing: 'border-box',
    display: 'flex',
    flexFlow: 'column',
    gap: '1.6rem',
    height: '100%',
    border: 0,
    background: theme.palette.background.paper,
    boxShadow: 'rgba(5, 43, 101, 0.06) 0 1.2rem 1.2rem',
    padding: '1.6rem',
  },
})

export const ContentStyled = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexFlow: 'column',
  flex: '1 1 auto',
  margin: '0 auto',

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
  margin: '0 auto 1rem',
  width: '100%',
}
