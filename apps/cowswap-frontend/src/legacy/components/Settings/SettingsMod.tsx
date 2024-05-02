import { useCallback, useRef } from 'react'

import { toggleRecepientAddressAnalytics } from '@cowprotocol/analytics'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { HelpTooltip, RowBetween, RowFixed, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { Settings } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { Toggle } from 'legacy/components/Toggle'
import TransactionSettings from 'legacy/components/TransactionSettings'
import { useModalIsOpen, useToggleSettingsMenu } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useRecipientToggleManager } from 'legacy/state/user/hooks'
import { ThemedText } from 'legacy/theme'

import { SettingsTabProp } from './index'

export const StyledMenuIcon = styled(Settings)`
  --size: var(${UI.ICON_SIZE_NORMAL});
  height: var(--size);
  width: var(--size);
`

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

  &:hover,
  &:focus {
    cursor: pointer;
    outline: none;
    opacity: 1;
  }
`
export const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;
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
  top: 2rem;
  right: 0rem;
  z-index: 100;
  color: inherit;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 18.125rem;
  `};

  user-select: none;
`

export default function SettingsTab({ className, placeholderSlippage, SettingsButton }: SettingsTabProp) {
  const node = useRef<HTMLDivElement>()
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

  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any} className={className}>
      <SettingsButton toggleSettings={toggle} />
      {open && (
        <MenuFlyout>
          <AutoColumn gap="md" style={{ padding: '1rem' }}>
            <Text fontWeight={600} fontSize={14}>
              <Trans>Transaction Settings</Trans>
            </Text>
            <TransactionSettings placeholderSlippage={placeholderSlippage} />
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
