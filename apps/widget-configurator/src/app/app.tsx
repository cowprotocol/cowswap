import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'

import { Configurator } from './configurator'

const WrapperStyled = (theme: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
})

export function App() {
  return (
    <Box sx={WrapperStyled}>
      <Configurator title="CoW Widget" />
    </Box>
  )
}

export default App
