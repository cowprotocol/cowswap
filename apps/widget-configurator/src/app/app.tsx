import Box from '@mui/material/Box'
import { Configurator } from './configurator'
import { Theme } from '@mui/material/styles';

const WrapperStyled = (theme: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  background: theme.palette.cow.background,
})

export function App() {
  return (
    <Box sx={WrapperStyled}>
      <Configurator title="CoW Widget" />
    </Box>
  )
}

export default App
