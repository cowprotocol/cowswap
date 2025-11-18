import { ReactNode, RefObject, useEffect, useRef } from 'react'

import { Command } from '@cowprotocol/types'
import { ButtonPrimary, Media, PopoverMobileMode, Tooltip, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
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

interface NotificationSettingsPopoverProps {
  children: ReactNode
  show: boolean
  onDismiss: Command
  containerRef: RefObject<HTMLElement | null>
}

export function NotificationSettingsPopover({
  children,
  show,
  onDismiss,
  containerRef,
}: NotificationSettingsPopoverProps): ReactNode {
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
    <PopoverContent
      role="dialog"
      aria-label={t`Trade alert settings info`}
      aria-describedby="notification-settings-description"
    >
      <PopoverTitle>
        <Trans>Trade alerts enabled</Trans>
      </PopoverTitle>
      <PopoverBody id="notification-settings-description">
        <Trans>Change trade alert settings here</Trans>
      </PopoverBody>
      <PopoverActions>
        <PrimaryButton
          ref={primaryButtonRef}
          onPointerDownCapture={(e) => e.stopPropagation()}
          onMouseDownCapture={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
        >
          <Trans>Got it</Trans>
        </PrimaryButton>
      </PopoverActions>
    </PopoverContent>
  )

  return (
    <Tooltip
      show={show}
      content={popoverContent}
      placement="auto"
      containerRef={containerRef}
      wrapInContainer={false}
      bgColor={`var(${UI.COLOR_BLUE_100_PRIMARY})`}
      borderColor={`var(${UI.COLOR_BLUE_700_PRIMARY_OPACITY_25})`}
      mobileMode={PopoverMobileMode.Popper}
      showMobileBackdrop={false}
      mobileBorderRadius="16px 16px 0 0"
      zIndex={90}
    >
      {children}
    </Tooltip>
  )
}
