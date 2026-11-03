import { TokenLogo as TokenLogoBase } from '@cowprotocol/tokens'
import { TokenAmount, UI, font, slowTransition } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { FiatValue } from '../FiatValue'

export const TOKEN_SIZE_DEFAULT = 42

export const Container = styled.div`
  padding: 20px 16px 18px;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  background: var(${UI.COLOR_PAPER_DARKER});
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: ${slowTransition(['padding', 'gap'])};

  &.slim {
    padding: 12px;
    gap: 8px;
  }
`

export const TopLabel = styled.div`
  ${font('FONT_NORMAL')}
  color: var(${UI.COLOR_TEXT});
  transition: ${slowTransition(['font-size', 'line-height', 'color'])};

  ${Container}.slim & {
    ${font('FONT_SMALL_PLUS')}
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const Amounts = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 6px;
`

export const AmountLoading = styled.span`
  display: inline-block;
  width: 4.5em;
  height: 1.15em;
  border-radius: 6px;
  background: color-mix(in srgb, var(${UI.COLOR_TEXT}) 14%, transparent);
`

export const Amount = styled(TokenAmount)`
  ${font('FONT_MEDIUM', 'semibold')}
  transition: ${slowTransition(['font-size', 'line-height'])};

  ${Container}.slim & {
    ${font('FONT_NORMAL_PLUS', 'semibold')}
  }
`

export const FiatAmountSlot = styled(FiatValue)`
  ${font('FONT_SMALL_PLUS', 'medium')}
  display: block;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  max-height: 2.5em;
  opacity: 1;
  overflow: hidden;
  transition: ${slowTransition(['max-height', 'opacity', 'margin-top'])};

  ${Container}.slim & {
    max-height: 0;
    opacity: 0;
    margin-top: -6px;
  }
`

export const SecondaryAmount = styled.div<{ $variant?: 'default' | 'success' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  color: ${({ $variant }) =>
    $variant === 'success' ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`};

  .fiat-amount {
    ${font('FONT_SMALL', 'semibold')}
    opacity: 1;
  }
`

export const SecondaryAmountEnd = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
`

export const SecondaryAmountTooltip = styled.span`
  display: inline-flex;
  color: var(${UI.COLOR_TEXT_SECONDARY});
`

export const SecondaryAmountValue = styled(TokenAmount)`
  ${font('FONT_SMALL', 'semibold')}
`

export const TokenLogo = styled(TokenLogoBase)`
  box-shadow: 0 2px 10px 0 ${({ theme }) => (theme.darkMode ? '#496e9f' : '#bfd6f7')};
`
