import { useCallback, useRef } from 'react'

import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { HelpTooltip, Media, RowBetween, RowFixed, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { transparentize } from 'color2k'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { AutoColumn } from 'legacy/components/Column'
import { Toggle } from 'legacy/components/Toggle'
import { TransactionSettings } from 'legacy/components/TransactionSettings'
import { useModalIsOpen, useToggleSettingsMenu } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useRecipientToggleManager } from 'legacy/state/user/hooks'

import { toggleRecepientAddressAnalytics } from 'modules/analytics'
import { SettingsIcon } from 'modules/trade/pure/Settings'

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  border-radius: 0.5rem;
  height: var(${UI.ICON_SIZE_NORMAL});
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  color: inherit;
  display: flex;
  align-items: center;

  &:hover,
  &:focus {
    opacity: 1;
    cursor: pointer;
    outline: none;
    color: currentColor;
  }

  svg {
    opacity: 1;
    margin: auto;
    transition: transform 0.3s cubic-bezier(0.65, 0.05, 0.36, 1);
    color: inherit;
  }
`

const StyledMenu = styled.div`
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
  color: inherit;

  ${RowFixed} {
    color: inherit;

    > div {
      color: inherit;
      opacity: 0.85;
    }
  }
`

export const MenuFlyout = styled.span`
  min-width: 20.125rem;
  background: var(${UI.COLOR_PRIMARY});
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  z-index: 100;
  color: inherit;
  box-shadow: ${({ theme }) => theme.boxShadow2};
  border: 1px solid ${({ theme }) => transparentize(theme.white, 0.95)};
  background-color: var(${UI.COLOR_PAPER});
  color: inherit;
  padding: 0;
  margin: 0;
  top: 36px;
  right: 0;
  width: 280px;

  ${Media.upToMedium()} {
    min-width: 18.125rem;
  }

  user-select: none;
`

interface SettingsTabProps {
  className?: string
}

export function SettingsTab({ className }: SettingsTabProps) {
  const node = useRef<HTMLDivElement>(null)
  const open = useModalIsOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()

  const [recipientToggleVisible, toggleRecipientVisibilityAux] = useRecipientToggleManager()
  const toggleRecipientVisibility = useCallback(
    (value?: boolean) => {
      const isVisible = value ?? !recipientToggleVisible
      toggleRecepientAddressAnalytics(isVisible)
      toggleRecipientVisibilityAux(isVisible)
    },
    [toggleRecipientVisibilityAux, recipientToggleVisible]
  )

  // show confirmation view before turning on

  useOnClickOutside([node], open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any} className={className}>
      <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
        <SettingsIcon />
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap="md" style={{ padding: '1rem' }}>
            <Text fontWeight={600} fontSize={14}>
              <Trans>Transaction Settings</Trans>
            </Text>
            <TransactionSettings />
            <Text fontWeight={600} fontSize={14}>
              <Trans>Interface Settings</Trans>
            </Text>

            <RowBetween>
              <RowFixed>
                <ThemedText.Black fontWeight={400} fontSize={14}>
                  <Trans>Custom Recipient</Trans>
                </ThemedText.Black>
                <HelpTooltip
                  text={
                    <Trans>Allows you to choose a destination address for the swap other than the connected one.</Trans>
                  }
                />
              </RowFixed>
              <Toggle
                id="toggle-recipient-mode-button"
                isActive={recipientToggleVisible}
                toggle={toggleRecipientVisibility}
              />
            </RowBetween>
          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
