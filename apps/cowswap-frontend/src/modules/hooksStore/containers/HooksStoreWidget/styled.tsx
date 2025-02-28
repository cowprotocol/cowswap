import styled from 'styled-components/macro'

export const TradeWidgetWrapper = styled.div<{ visible$: boolean }>`
  visibility: ${({ visible$ }) => (visible$ ? 'visible' : 'hidden')};
  height: ${({ visible$ }) => (visible$ ? '' : '0px')};
  width: ${({ visible$ }) => (visible$ ? '100%' : '0px')};
  overflow: ${({ visible$ }) => (visible$ ? '' : 'hidden')};
`
