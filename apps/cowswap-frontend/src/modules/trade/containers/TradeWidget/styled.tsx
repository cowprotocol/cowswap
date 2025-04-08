import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const Container = styled.div<{ isTokenSelectOpen?: boolean }>`
  width: 100%;
  max-width: ${({ isTokenSelectOpen }) => (isTokenSelectOpen ? WIDGET_MAX_WIDTH.tokenSelect : WIDGET_MAX_WIDTH.swap)};
  margin: 0 auto;
  position: relative;
`

export const ContainerBox = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
  max-width: 100%;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_PAPER});
  border: none;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  box-shadow: ${({ theme }) => (theme.isInjectedWidgetMode ? theme.boxShadow1 : 'none')};
  padding: 10px;
  position: relative;

  > div,
  > span {
    max-width: 100%;
  }

  .modalMode & {
    box-shadow: none;
  }
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => (theme.isInjectedWidgetMode ? '0 7px' : '0 5px 0 0')};
  margin: 0;
  color: inherit;
`

export const OuterContentWrapper = styled.div`
  margin-top: 10px;
`

export const CurrencySeparatorBox = styled.div<{ compactView: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: ${({ compactView }) => (compactView ? '-5px 0' : '0')};
  padding: 0;
`
