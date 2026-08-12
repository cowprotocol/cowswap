import { TokenAmount, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { FiatValue } from '../FiatValue'

export const TOKEN_SIZE_DEFAULT = 42
export const TOKEN_SIZE_SLIM = 32

// TODO: debug — revert to var(${UI.ANIMATION_DURATION_SLOW})
const DEBUG_TRANSITION_DURATION = '10s'

export const Container = styled.div`
  padding: 24px 12px;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  background: var(${UI.COLOR_PAPER_DARKER});
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition:
    padding ${DEBUG_TRANSITION_DURATION} ease-in-out,
    gap ${DEBUG_TRANSITION_DURATION} ease-in-out;

  ${Media.upToSmall()} {
    font-size: 13px;
    letter-spacing: -0.1px;
  }

  &.slim {
    padding: 8px 12px;
    gap: 8px;
  }
`

export const Amounts = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 6px;
`

export const Amount = styled(TokenAmount)`
  font-size: 15px;
  font-weight: 600;
`

export const FiatAmountSlot = styled(FiatValue)`
  display: block;
  font-weight: 500;
  font-size: 13px;
  max-height: 2.5em;
  opacity: 1;
  overflow: hidden;
  transition:
    max-height ${DEBUG_TRANSITION_DURATION} ease-in-out,
    opacity ${DEBUG_TRANSITION_DURATION} ease-in-out,
    margin-top ${DEBUG_TRANSITION_DURATION} ease-in-out;

  ${Container}.slim & {
    max-height: 0;
    opacity: 0;
    margin-top: -6px;
  }
`

export const TokenLogoWrapper = styled.div`
  display: inline-block;
  border-radius: 50%;
  line-height: 0;
  box-shadow: 0 2px 10px 0 ${({ theme }) => (theme.darkMode ? '#496e9f' : '#bfd6f7')};
`
