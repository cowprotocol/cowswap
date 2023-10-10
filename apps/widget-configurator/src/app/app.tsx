import styled from 'styled-components'

import { Configurator } from './configurator'

const StyledApp = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`

export function App() {
  return (
    <StyledApp>
      <Configurator title="widget-configurator" />
    </StyledApp>
  )
}

export default App
