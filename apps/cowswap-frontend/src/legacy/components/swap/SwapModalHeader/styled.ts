import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { LightCard as LightCardUni } from 'legacy/components/Card'
import { SwapShowAcceptChanges } from 'legacy/components/swap/styleds'
import { HighFeeWarning as HighFeeWarningBase } from 'legacy/components/SwapWarnings'

import { RateInfo } from 'common/pure/RateInfo'

export const LightCard = styled(LightCardUni)<{ flatBorder?: boolean }>`
  background-color: var(${UI.COLOR_PAPER_DARKER});
  border: none;
  ${({ flatBorder = false }) => flatBorder && `border-radius: 20px 20px 0 0;`};
`

export type LightCardType = typeof LightCard

// targettable by styled injection
export const HighFeeWarning = styled(HighFeeWarningBase)``

export const Wrapper = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 auto;
  `};

  ${SwapShowAcceptChanges} {
    background: var(${UI.COLOR_ALERT_BG});
    color: var(${UI.COLOR_ALERT_TEXT});
    padding: 8px 8px 8px 16px;
    margin: 8px 0 0;

    svg {
      stroke: currentColor;
    }
  }
`

export const ArrowWrapper = styled.div`
  --size: 26px;
  padding: 0;
  height: var(--size);
  width: var(--size);
  position: relative;
  margin: -13px 0;
  left: calc(50% - var(--size) / 2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  border-radius: 8px;
  border: 2px solid var(${UI.COLOR_PAPER});
  background-color: var(${UI.COLOR_PAPER_DARKER});

  > svg {
    stroke-width: 2px;
    stroke: currentColor;
    padding: 1px;
    height: 100%;
    width: 100%;
    cursor: pointer;
  }
`

export const StyledRateInfo = styled(RateInfo)`
  font-size: 13px;
  font-weight: 500;
  margin: 0 auto;
`
