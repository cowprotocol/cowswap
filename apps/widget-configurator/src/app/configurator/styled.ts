import { Theme } from '@mui/material/styles';

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
});

export const ContentStyled = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexFlow: 'column wrap',
  height: '100%',
  width: 'auto',
  flex: '1 1 auto',

  '& > iframe': {
    border: 0,
    margin: '0 auto',
    borderRadius: '1.6rem',
    overflow: 'hidden',
  },
}

export const WrapperStyled = { display: 'flex', flexFlow: 'row wrap', height: '100vh', width: '100%' }
