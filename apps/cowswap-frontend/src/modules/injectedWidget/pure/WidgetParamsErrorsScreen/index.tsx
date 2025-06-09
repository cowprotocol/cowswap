import styled from 'styled-components/macro'

import { WidgetParamsErrors } from '../../state/injectedWidgetParamsAtom'

const Container = styled.div`
  position: fixed;
  z-index: 1000;
  width: 100%;
  height: 100vh;
  background: white;
  padding: 20px;
`

const Code = styled.textarea`
  width: 100%;
  min-height: 300px;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WidgetParamsErrorsScreen({ errors }: { errors: WidgetParamsErrors }) {
  const paramsWithErrors = Object.keys(errors)

  if (paramsWithErrors.length === 0) return null

  return (
    <Container>
      <h3>The are some errors with CoW Swap widget configuration</h3>
      <Code value={JSON.stringify(errors, null, 4)}></Code>
    </Container>
  )
}
