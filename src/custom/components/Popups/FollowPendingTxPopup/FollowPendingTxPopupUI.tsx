import React from 'react'
import styled from 'styled-components/macro'
import { Text } from 'rebass'

import { StyledClose as IconClose } from 'components/Popups/PopupItemMod'
import Tooltip, { TooltipProps } from 'components/Tooltip/TooltipMod'
import { AutoColumn } from 'components/Column'

interface PopupContentProps {
  onCheck: () => void
  onClose: () => void
}
type FollowingTxPopupProps = Omit<TooltipProps, 'text'> & PopupContentProps

const TooltipWrapper = styled(Tooltip)`
  > .arrow- {
    z-index: 1;
  }

  > div {
    max-width: 370px;
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
    padding-right: 0.8rem;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding-left: 0;
    padding-right: 0.5rem;
  `};
`

const BodyWrapper = styled(AutoColumn)`
  display: flex;
  gap: 1rem;
  padding-top: 0.3rem;

  > div:nth-child(2) {
    padding-top: 0.5rem;
    font-size: 18px;
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
    gap: 0.8rem;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 0.6rem;
    padding-top: 0.5rem;
    padding-top: auto;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    gap: 0.4rem;
  `};
`

const AutoColumnWrapper = styled(AutoColumn)`
  min-width: 21rem;
  * input {
    margin-left: 0;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 9rem;
    min-width: auto;
  `};
`

const StyledClose = styled(IconClose)`
  top: 0.5rem;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    right:0.5rem;
  `};
`

const PopupContent = ({ onCheck, onClose }: PopupContentProps) => {
  const _onCheckout = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    onCheck()
  }

  return (
    <BodyWrapper onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => e.stopPropagation()}>
      <StyledClose onClick={onClose} />
      <div>💡</div>
      <AutoColumnWrapper gap="10px">
        <Text fontWeight={500} fontSize={14}>
          Follow your pending transactions here!
        </Text>
        <span>
          <label>
            <input type="checkbox" onChange={_onCheckout} /> Don&apos;t show this again
          </label>
        </span>
      </AutoColumnWrapper>
    </BodyWrapper>
  )
}

export function FollowPendingTxPopupUI({
  show,
  children,
  onCheck,
  onClose,
  ...rest
}: FollowingTxPopupProps): JSX.Element {
  return (
    <TooltipWrapper show={show} placement="left" text={<PopupContent onClose={onClose} onCheck={onCheck} />} {...rest}>
      <div onClick={onClose} onKeyDown={onClose} role="button" tabIndex={0}>
        {children}
      </div>
    </TooltipWrapper>
  )
}
