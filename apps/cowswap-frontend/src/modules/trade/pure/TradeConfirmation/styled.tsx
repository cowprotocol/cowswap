import { UI } from '@cowprotocol/ui'

import { ArrowRight } from 'react-feather'
import styled from 'styled-components/macro'

export const WidgetWrapper = styled.div`
  width: 100%;
  padding: 0;
  border-radius: 16px;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  height: inherit;
  ${({ theme }) => theme.colorScrollbar};
`

export const AmountsPreviewContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`

export const AmountsSeparator = styled(ArrowRight)`
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 50%;
  border: 4px solid var(${UI.COLOR_PAPER});
  width: 38px;
  height: 38px;
  padding: 4px;
  margin: 0 -16px;
  position: relative;
  z-index: 1;
`

export const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  padding: 0 10px 16px;
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: sticky;
  background: var(${UI.COLOR_PAPER});
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  z-index: 20;
  margin: 0;
`

export const ConfirmHeaderTitle = styled.h3`
  margin: 0;
  font-size: 18px;
`
