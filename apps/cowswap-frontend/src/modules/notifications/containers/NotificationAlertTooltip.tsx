import { ReactNode, RefObject } from 'react'

import ICON_BELL_ALERT from '@cowprotocol/assets/images/icon-bell-alert.svg?url'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary, Media, PopoverMobileMode, Tooltip, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const TooltipContent = styled.div`
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

const TooltipTitle = styled.h3`
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

const TooltipBody = styled.p`
  margin: 0;
  line-height: 1.4;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  line-height: 1;
  font-size: 14px;

  ${Media.upToSmall()} {
    font-size: 16px;
  }
`

const TooltipActions = styled.div`
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

interface NotificationAlertTooltipProps {
  children: ReactNode
  show: boolean
  onEnableAlerts: Command
  onDismiss: Command
  containerRef: RefObject<HTMLElement | null>
}

export function NotificationAlertTooltip({
  children,
  show,
  onEnableAlerts,
  onDismiss,
  containerRef,
}: NotificationAlertTooltipProps): ReactNode {
  const tooltipContent = (
    <TooltipContent>
      <TooltipTitle>
        <SVG src={ICON_BELL_ALERT} /> Get order alerts
      </TooltipTitle>
      <TooltipBody>Fills, cancels, expiries</TooltipBody>
      <TooltipActions>
        <PrimaryButton onClick={onEnableAlerts}>Enable alerts</PrimaryButton>
        <SecondaryButton onClick={onDismiss}>Not now</SecondaryButton>
      </TooltipActions>
    </TooltipContent>
  )

  return (
    <Tooltip
      show={show}
      content={tooltipContent}
      placement="bottom"
      containerRef={containerRef}
      wrapInContainer={false}
      bgColor={`var(${UI.COLOR_BLUE_100_PRIMARY})`}
      borderColor={`var(${UI.COLOR_BLUE_700_PRIMARY_OPACITY_25})`}
      mobileMode={PopoverMobileMode.FullWidth}
      showMobileBackdrop={true}
      mobileBorderRadius="16px 16px 0 0"
    >
      {children}
    </Tooltip>
  )
}
