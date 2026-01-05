import { ReactNode, RefObject, useEffect, useRef } from 'react'

import { Command } from '@cowprotocol/types'
import { ButtonPrimary, Media, PopoverMobileMode, Tooltip, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import ICON_BELL_ALERT from 'assets/images/icon-bell-alert.svg?url'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const PopoverContent = styled.div`
  padding: 15px 20px;
  max-width: 280px;
  color: var(${UI.COLOR_TEXT});
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;

  ${Media.upToSmall()} {
    max-width: 100%;
  }
`

const PopoverTitle = styled.h3`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(${UI.COLOR_TEXT});

  ${Media.upToSmall()} {
    font-size: 24px;
  }

  > svg {
    --size: 20px;
    width: var(--size);
    height: var(--size);
    color: var(${UI.COLOR_TEXT});
    display: inline-block;

    ${Media.upToSmall()} {
      --size: 24px;
    }
  }
`

const PopoverBody = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 14px;
  line-height: 1.2;
  text-align: center;

  ${Media.upToSmall()} {
    font-size: 16px;
  }
`

const PopoverActions = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  gap: 16px;
  margin: 10px 0 0;

  ${Media.upToSmall()} {
    gap: 24px;
    margin: 24px auto;
  }
`

const SecondaryButton = styled.button`
  background: none;
  border: none;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  align-self: center;
  font-size: inherit;
  font-weight: inherit;

  ${Media.upToSmall()} {
    font-size: 16px;
    min-height: 56px;
    padding: 16px;
  }

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }
`

const PrimaryButton = styled(ButtonPrimary)`
  font-size: 14px;
  min-height: 40px;
  padding: 8px 16px;

  ${Media.upToSmall()} {
    font-size: 16px;
    min-height: 56px;
    padding: 16px;
  }
`

interface NotificationAlertPopoverProps {
  children: ReactNode
  show: boolean
  onEnableAlerts: Command
  onDismiss: Command
  containerRef: RefObject<HTMLElement | null>
}

export function NotificationAlertPopover({
  children,
  show,
  onEnableAlerts,
  onDismiss,
  containerRef,
}: NotificationAlertPopoverProps): ReactNode {
  const primaryButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management for accessibility
  useEffect(() => {
    if (show && primaryButtonRef.current) {
      primaryButtonRef.current.focus()
    }
  }, [show])

  // Keyboard navigation
  useEffect(() => {
    if (!show) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onDismiss()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [show, onDismiss])

  const popoverContent = (
    <PopoverContent role="dialog" aria-label={t`Enable order alerts`} aria-describedby="notification-alert-description">
      <PopoverTitle>
        <SVG src={ICON_BELL_ALERT} /> <Trans>Get trade alerts</Trans>
      </PopoverTitle>
      <PopoverBody id="notification-alert-description">
        <Trans>When orders fill or expire</Trans>
      </PopoverBody>
      <PopoverActions>
        <PrimaryButton ref={primaryButtonRef} onClick={onEnableAlerts}>
          <Trans>Enable trade alerts</Trans>
        </PrimaryButton>
        <SecondaryButton onClick={onDismiss}>
          <Trans>Not now</Trans>
        </SecondaryButton>
      </PopoverActions>
    </PopoverContent>
  )

  return (
    <Tooltip
      show={show}
      content={popoverContent}
      placement="bottom"
      containerRef={containerRef}
      wrapInContainer={false}
      bgColor={`var(${UI.COLOR_BLUE_100_PRIMARY})`}
      borderColor={`var(${UI.COLOR_BLUE_700_PRIMARY_OPACITY_25})`}
      mobileMode={PopoverMobileMode.FullWidth}
      showMobileBackdrop={true}
      mobileBorderRadius="16px 16px 0 0"
      zIndex={90}
    >
      {children}
    </Tooltip>
  )
}
