import React, { ReactNode, CSSProperties, useCallback, PropsWithChildren } from 'react'

import { Color } from '@cowprotocol/ui'

import { State, Placement } from '@popperjs/core'
import questionImg from 'assets/img/question.svg'
import Portal from 'components/Portal'
import { usePopperOnClick, usePopperDefault, TOOLTIP_OFFSET } from 'hooks/usePopper'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const CustomSvgIcon = styled(SVG)`
  width: 1.4rem;
  height: 1.4rem;
  fill: ${Color.explorer_grey};
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

// visibility necessary for correct boundingRect calculation by popper
const TooltipOuter = styled.div<Pick<TooltipBaseProps, 'isShown'>>`
  visibility: ${(props): 'hidden' | false => !props.isShown && 'hidden'};
`

// can style anything but TOOLTIP_OFFSET fields, position and transform: rotate
const TooltipArrow = styled.div<{ $bgColor?: string }>`
  &,
  ::before {
    position: absolute;
    width: ${TOOLTIP_OFFSET}px;
    height: ${TOOLTIP_OFFSET}px;
    z-index: -1;
  }

  ::before {
    content: '';
    transform: rotate(45deg);
    background: ${Color.explorer_shade};
  }
`

const TooltipInner = styled.div<{ $bgColor?: string }>`
  background: ${Color.explorer_shade};
  color: ${Color.explorer_textPrimary};
  font-weight: var(--font-weight-normal);
  padding: 1rem;
  font-size: 1.3rem;
  border-radius: 0.9rem;
  letter-spacing: 0;
  z-index: 9999;
  margin: 0;
  line-height: 1.4;
  border: 0.1rem solid ${Color.explorer_border};
  box-shadow: 0 0.25rem 0.5rem ${Color.explorer_boxShadow};
  max-width: 40rem;

  &[data-popper-placement^='top'] > ${TooltipArrow} {
    bottom: -${TOOLTIP_OFFSET / 2}px;
  }

  &[data-popper-placement^='bottom'] > ${TooltipArrow} {
    top: -${TOOLTIP_OFFSET / 2}px;
  }

  &[data-popper-placement^='left'] > ${TooltipArrow} {
    right: -${TOOLTIP_OFFSET / 2}px;
  }

  &[data-popper-placement^='right'] > ${TooltipArrow} {
    left: -${TOOLTIP_OFFSET / 2}px;
  }
`

interface TooltipBaseProps {
  isShown: boolean
  state: Partial<Pick<State, 'placement' | 'styles'>>
}

const TooltipBase: React.ForwardRefRenderFunction<HTMLDivElement, TooltipBaseProps> = (
  { children, isShown, state }: PropsWithChildren<TooltipBaseProps>,
  ref,
) => {
  const { placement, styles = {} } = state

  return (
    // Portal isolates popup styles from the App styles
    <Portal>
      <TooltipOuter isShown={isShown} onClick={(e): void => e.stopPropagation()}>
        <TooltipInner role="tooltip" ref={ref} style={styles.popper as CSSProperties} data-popper-placement={placement}>
          <TooltipArrow data-popper-arrow style={styles.arrow as CSSProperties} />
          {isShown && children}
        </TooltipInner>
      </TooltipOuter>
    </Portal>
  )
}

interface TooltipProps extends TooltipBaseProps {
  children?: ReactNode
}

export const Tooltip = React.memo(React.forwardRef<HTMLDivElement, TooltipProps>(TooltipBase))

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

type BaseTooltipsProps = RequireAtLeastOne<
  {
    tooltip: ReactNode
    placement?: Placement
    offset?: number
    sourceIconSvg?: string
    targetContent?: ReactNode
  },
  'sourceIconSvg' | 'targetContent'
>

export const BaseIconTooltipOnClick: React.FC<BaseTooltipsProps> = ({
  tooltip,
  placement = 'top',
  offset,
  sourceIconSvg,
  targetContent,
}) => {
  const {
    targetProps: { ref, onClick },
    tooltipProps,
  } = usePopperOnClick<HTMLSpanElement>(placement, offset)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation()
      onClick()
    },
    [onClick],
  )

  return (
    <>
      <HelperSpan ref={ref} onClick={handleClick}>
        {sourceIconSvg ? <CustomSvgIcon src={sourceIconSvg} /> : targetContent}
      </HelperSpan>
      <Tooltip {...tooltipProps}>{tooltip}</Tooltip>
    </>
  )
}

export const BaseIconTooltipOnHover: React.FC<BaseTooltipsProps> = ({
  tooltip,
  placement = 'top',
  offset,
  sourceIconSvg,
  targetContent,
}) => {
  const { tooltipProps, targetProps } = usePopperDefault<HTMLSpanElement>(placement, offset)

  return (
    <>
      <HelperSpan {...targetProps}>{sourceIconSvg ? <CustomSvgIcon src={sourceIconSvg} /> : targetContent}</HelperSpan>
      <Tooltip {...tooltipProps}>{tooltip}</Tooltip>
    </>
  )
}

type HelpTooltipProps = Omit<BaseTooltipsProps, 'sourceIconSvg' | 'targetContent'>

const HelperSpan = styled.span`
  display: flex;
  cursor: pointer;
  transition: color 0.1s;
  padding: 0 0.6rem 0 0;
  position: relative;
`

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ tooltip, placement = 'top', offset }) => {
  return <BaseIconTooltipOnClick sourceIconSvg={questionImg} tooltip={tooltip} placement={placement} offset={offset} />
}
