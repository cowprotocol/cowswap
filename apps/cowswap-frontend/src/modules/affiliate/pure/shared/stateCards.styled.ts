import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Card } from 'pages/Account/styled'

const DEFAULT_CARD_MAX_WIDTH = 540

export const IneligibleCard = styled(Card)<{ $maxWidth?: number }>`
  max-width: ${({ $maxWidth }) => `${$maxWidth ?? DEFAULT_CARD_MAX_WIDTH}px`};
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  position: relative;
`

export const IneligibleTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  color: var(${UI.COLOR_TEXT});
`

export const IneligibleSubtitle = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  line-height: 1.5;
  max-width: 520px;

  strong {
    color: var(${UI.COLOR_TEXT});
  }
`

export const UnsupportedNetworkCard = styled(Card)`
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`

export const UnsupportedNetworkHeader = styled.h2`
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 21px;
  color: var(${UI.COLOR_DANGER});
  font-weight: 600;
`

export const UnsupportedNetworkMessage = styled.p`
  margin: 0;
  text-align: center;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`
