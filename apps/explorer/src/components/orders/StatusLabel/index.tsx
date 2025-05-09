import React from 'react'

import { Color } from '@cowprotocol/ui'

import {
  faCheckCircle,
  faCircleNotch,
  faClock,
  faTimesCircle,
  IconDefinition,
  faKey,
  faCircleHalfStroke,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import styled, { DefaultTheme, css, keyframes, FlattenSimpleInterpolation } from 'styled-components/macro'
import { capitalize, formatPercentage } from 'utils'

import { OrderStatus } from 'api/operator'

type CustomOrderStatus = OrderStatus | 'partially filled'
type DisplayProps = { status: CustomOrderStatus }
function canBePartiallyFilled(status: string): status is OrderStatus {
  return ['open', 'cancelling'].includes(status) // expired, cancelled are excluded, they use a custom status "partially filled"
}

function setStatusColors({
  status,
}: {
  theme: DefaultTheme
  status: CustomOrderStatus
}): string | FlattenSimpleInterpolation {
  let background: string, text: string

  switch (status) {
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
  }

  return `
      background: ${background};
      color: ${text};
    `
}

type PartiallyTagPosition = 'right' | 'bottom'
type PartiallyTagProps = { partialFill: boolean; tagPosition: PartiallyTagPosition; filledPercentage?: string }

const PartiallyTagLabel = css<PartiallyTagProps>`
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
            font-size: 0.71em; /* Intentional use of "em" to be relative to parent's font size */
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
const Wrapper = styled.div<PartiallyTagProps>`
  display: ${({ tagPosition }) => (tagPosition === 'bottom' ? 'inline-flex' : 'flex')};
  flex-direction: ${({ tagPosition }) => (tagPosition === 'bottom' ? 'column' : 'row')};
  font-size: 1.1rem;
  text-transform: uppercase;
  width: fit-content;

  ${PartiallyTagLabel}
`
const frameAnimation = keyframes`
    100% {
      -webkit-mask-position: left;
    }
`
type ShimmingProps = {
  shimming?: boolean
}

const Label = styled.div<DisplayProps & ShimmingProps & PartiallyTagProps>`
  font-weight: ${({ theme }): string => theme.fontBold};
  border-radius: 0.4rem;
  line-height: 1.1;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  min-height: 2.8rem;
  width: 100%;
  white-space: normal;

  ${({ theme, status }): string | FlattenSimpleInterpolation => setStatusColors({ theme, status })}
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

const StyledFAIcon = styled(FontAwesomeIcon)`
  margin: 0 0.6rem 0 0;
`

function getStatusIcon(status: CustomOrderStatus): IconDefinition {
  switch (status) {
    case 'expired':
      return faClock
    case 'filled':
      return faCheckCircle
    case 'cancelled':
      return faTimesCircle
    case 'cancelling':
      return faTimesCircle
    case 'signing':
      return faKey
    case 'open':
      return faCircleNotch
    case 'partially filled':
      return faCircleHalfStroke
  }
}

function StatusIcon({ status }: DisplayProps): React.ReactNode {
  const icon = getStatusIcon(status)
  const isOpen = status === 'open'

  return <StyledFAIcon icon={icon} spin={isOpen} />
}

export type Props = {
  status: OrderStatus
  partiallyFilled: boolean
  filledPercentage?: BigNumber
  partialTagPosition?: PartiallyTagPosition
}

export function StatusLabel({
  status,
  partiallyFilled,
  filledPercentage,
  partialTagPosition = 'bottom',
}: Props): React.ReactNode {
  const shimming = status === 'signing' || status === 'cancelling'
  const customizeStatus = status === 'expired' || status === 'cancelled'
  const tagPartiallyFilled = partiallyFilled && canBePartiallyFilled(status)
  const formattedPercentage = filledPercentage !== undefined && formatPercentage(filledPercentage)
  const _status: CustomOrderStatus = customizeStatus && partiallyFilled ? 'partially filled' : status

  return (
    <Wrapper
      partialFill={tagPartiallyFilled}
      tagPosition={partialTagPosition}
      filledPercentage={formattedPercentage || 'Partially filled'}
    >
      <Label status={_status} shimming={shimming} partialFill={tagPartiallyFilled} tagPosition={partialTagPosition}>
        <StatusIcon status={_status} />
        {capitalize(_status)}
      </Label>
    </Wrapper>
  )
}
