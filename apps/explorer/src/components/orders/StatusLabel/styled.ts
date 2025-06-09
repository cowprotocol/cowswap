import { BridgeStatus } from '@cowprotocol/cow-sdk'
import { Color } from '@cowprotocol/ui'

import styled, { DefaultTheme, css, keyframes, FlattenSimpleInterpolation } from 'styled-components/macro'

export type GenericStatus = string
export type DisplayProps = { status: GenericStatus }
export type PartiallyTagPosition = 'right' | 'bottom'
export type PartiallyTagProps = { partialFill: boolean; tagPosition: PartiallyTagPosition; filledPercentage?: string }
export type ShimmingProps = {
  shimming?: boolean
}

// eslint-disable-next-line complexity
function setStatusColors({
  status,
}: {
  status: GenericStatus
  _theme: DefaultTheme
}): string | FlattenSimpleInterpolation {
  let background: string, text: string

  switch (status.toLowerCase()) {
    case 'expired':
    case 'cancelled':
    case 'cancelling':
      text = Color.explorer_orange1
      background = Color.explorer_orangeOpacity
      break
    case 'filled':
      text = Color.explorer_green1
      background = Color.explorer_greenOpacity
      break
    case 'open':
    case 'signing':
      text = Color.explorer_textPrimary
      background = Color.explorer_bgInput
      break
    case 'partially filled':
      text = Color.explorer_green1
      background = Color.explorer_greenOpacity
      break
    case BridgeStatus.IN_PROGRESS.toLowerCase():
      text = Color.explorer_textPrimary
      background = Color.explorer_bgInput
      break
    case BridgeStatus.EXECUTED.toLowerCase():
    case BridgeStatus.REFUND.toLowerCase():
      text = Color.explorer_green1
      background = Color.explorer_greenOpacity
      break
    case BridgeStatus.EXPIRED.toLowerCase():
      text = Color.explorer_orange1
      background = Color.explorer_orangeOpacity
      break
    case BridgeStatus.UNKNOWN.toLowerCase():
    default:
      text = Color.explorer_grey
      background = Color.explorer_greyOpacity
      break
  }

  return `
      background: ${background};
      color: ${text};
    `
}

export const PartiallyTagLabel = css<PartiallyTagProps>`
  &:after {
    ${({ partialFill, theme, tagPosition, filledPercentage }): FlattenSimpleInterpolation | null =>
      partialFill
        ? css`
            content: ${tagPosition === 'bottom' ? `"${filledPercentage} filled"` : `"Partially filled"`};
            display: flex;
            justify-content: center;
            align-content: center;
            align-items: center;
            font-weight: ${theme.fontMedium};
            font-size: 0.71em;
            min-height: 1.35rem;
            border: solid 0.1rem ${Color.explorer_greyOpacity};
            white-space: nowrap;
            ${tagPosition === 'bottom'
              ? `
              padding: 0.4rem 0 0.1rem 0;
              border-radius: 0 0 0.4rem 0.4rem;
              border-top-width: 0;
            `
              : `
              border-left-width: 0;
              border-radius: 0 0.4rem 0.4rem 0;
              padding: 0 0.6rem;
              font-size: 0.84em;
            `}
          `
        : null}
  }
`

export const Wrapper = styled.div<PartiallyTagProps>`
  display: ${({ tagPosition }) => (tagPosition === 'bottom' ? 'inline-flex' : 'flex')};
  flex-direction: ${({ tagPosition }) => (tagPosition === 'bottom' ? 'column' : 'row')};
  font-size: 1.1rem;
  text-transform: uppercase;
  width: fit-content;

  ${PartiallyTagLabel}
`

export const frameAnimation = keyframes`
    100% {
      -webkit-mask-position: left;
    }
`

export const Label = styled.div<DisplayProps & ShimmingProps & PartiallyTagProps>`
  font-weight: ${({ theme }): string => theme.fontBold};
  border-radius: 0.4rem;
  line-height: 1.1;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  min-height: 2.8rem;
  width: 100%;
  white-space: normal;

  ${({ theme, status }): string | FlattenSimpleInterpolation => setStatusColors({ status, _theme: theme })}
  ${({ shimming }): FlattenSimpleInterpolation | null =>
    shimming
      ? css`
          mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
          background-repeat: no-repeat;
          animation: shimmer 1.5s infinite;
          animation-name: ${frameAnimation};
        `
      : null}
  ${({ partialFill: partiallyFilled, tagPosition }): FlattenSimpleInterpolation | null =>
    partiallyFilled
      ? tagPosition === 'bottom'
        ? css`
            font-size: 1.14rem;
            border-radius: 0.4rem 0.4rem 0 0;
          `
        : css`
            border-radius: 0.4rem 0 0 0.4rem;
          `
      : null}
`
