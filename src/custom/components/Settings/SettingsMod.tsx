// eslint-disable-next-line no-restricted-imports
import { Trans } from '@lingui/macro'
// import { Percent } from '@uniswap/sdk-core'
// import { useWeb3React } from '@web3-react/core'
// import { AUTO_ROUTER_SUPPORTED_CHAINS } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { useCallback, useContext, useRef, useState } from 'react'
import { Settings } from 'react-feather'
// import ReactGA from 'react-ga4'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useModalIsOpen, useToggleSettingsMenu } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useExpertModeManager, useRecipientToggleManager } from 'state/user/hooks'
import { ThemedText } from 'theme'
import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import Toggle from 'components/Toggle'
import TransactionSettings from 'components/TransactionSettings'
// import ReactGA from 'react-ga4'
import {
  showExpertModeConfirmationAnalytics,
  toggleExpertModeAnalytics,
  toggleRecepientAddressAnalytics,
} from 'components/analytics'

// MOD imports
import { SettingsTabProp } from '.'
import { ExpertModeModal } from '@cow/common/pure/ExpertModeModal'

export const StyledMenuIcon = styled(Settings)`
  height: 20px;
  width: 20px;

  > * {
    stroke: ${({ theme }) => theme.text2};
  }

  :hover {
    opacity: 0.7;
  }
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  border-radius: 0.5rem;
  height: 20px;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }
`
export const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

export const MenuFlyout = styled.span`
  min-width: 20.125rem;
  background-color: ${({ theme }) => theme.bg2};
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 18.125rem;
  `};

  user-select: none;
`

export default function SettingsTab({ className, placeholderSlippage, SettingsButton }: SettingsTabProp) {
  // const { chainId } = useWeb3React()

  const node = useRef<HTMLDivElement>()
  const open = useModalIsOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()

  const theme = useContext(ThemeContext)

  const [expertMode, toggleExpertModeAux] = useExpertModeManager()
  const toggleExpertMode = useCallback(() => {
    toggleExpertModeAnalytics(!expertMode)
    toggleExpertModeAux()
  }, [toggleExpertModeAux, expertMode])

  //mod
  const [recipientToggleVisible, toggleRecipientVisibilityAux] = useRecipientToggleManager()
  const toggleRecipientVisibility = useCallback(
    (value?: boolean) => {
      const isVisible = value ?? !recipientToggleVisible
      toggleRecepientAddressAnalytics(isVisible)
      toggleRecipientVisibilityAux(isVisible)
    },
    [toggleRecipientVisibilityAux, recipientToggleVisible]
  )

  // const [clientSideRouter, setClientSideRouter] = useClientSideRouter()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmationAux] = useState(false)
  const setShowConfirmation = useCallback(
    (showConfirmation: boolean) => {
      if (showConfirmation) {
        showExpertModeConfirmationAnalytics()
      }

      setShowConfirmationAux(showConfirmation)
    },
    [setShowConfirmationAux]
  )

  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any} className={className}>
      <ExpertModeModal
        isOpen={showConfirmation}
        onDismiss={() => setShowConfirmation(false)}
        onEnable={() => {
          toggleExpertMode()
          setShowConfirmation(false)
        }}
      />
      <SettingsButton expertMode={expertMode} toggleSettings={toggle} />
      {/* <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
        <StyledMenuIcon />
        {expertMode ? (
          <EmojiWrapper>
            <span role="img" aria-label="wizard-icon">
              🧙
            </span>
          </EmojiWrapper>
        ) : null}
      </StyledMenuButton> */}
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

            {/* {chainId === SupportedChainId.MAINNET && (
              <RowBetween>
                <RowFixed>
                  <ThemedText.Black fontWeight={400} fontSize={14} color={theme.text2}>
                    <Trans>Auto Router</Trans>
                  </ThemedText.Black>
                  <QuestionHelper
                    text={<Trans>Use the Uniswap Labs API to get better pricing through a more efficient route.</Trans>}
                  />
                </RowFixed>
                <Toggle
                  id="toggle-optimized-router-button"
                  isActive={!clientSideRouter}
                  toggle={() => {
                    ReactGA.event({
                      category: 'Routing',
                      action: clientSideRouter ? 'enable routing API' : 'disable routing API',
                    })
                    setClientSideRouter(!clientSideRouter)
                  }}
                />
              </RowBetween>
            )} */}

            <RowBetween>
              <RowFixed>
                <ThemedText.Black fontWeight={400} fontSize={14} color={theme.text2}>
                  <Trans>Expert Mode</Trans>
                </ThemedText.Black>
                <QuestionHelper
                  bgColor={theme.bg3}
                  color={theme.text1}
                  text={
                    <Trans>Allow high price impact trades and skip the confirm screen. Use at your own risk.</Trans>
                  }
                />
              </RowFixed>
              <Toggle
                id="toggle-expert-mode-button"
                isActive={expertMode}
                toggle={
                  expertMode
                    ? () => {
                        toggleExpertMode()
                        toggleRecipientVisibility(false)
                        setShowConfirmation(false)
                      }
                    : () => {
                        toggle()
                        toggleRecipientVisibility(true)
                        setShowConfirmation(true)
                      }
                }
              />
            </RowBetween>

            <RowBetween>
              <RowFixed>
                <ThemedText.Black fontWeight={400} fontSize={14} color={theme.text2}>
                  <Trans>Toggle Recipient</Trans>
                </ThemedText.Black>
                <QuestionHelper
                  bgColor={theme.bg3}
                  color={theme.text1}
                  text={
                    <Trans>Allows you to choose a destination address for the swap other than the connected one.</Trans>
                  }
                />
              </RowFixed>
              <Toggle
                id="toggle-recipient-mode-button"
                isActive={recipientToggleVisible || expertMode}
                isDisabled={expertMode}
                toggle={() => (expertMode ? null : toggleRecipientVisibility())}
                className={expertMode ? 'disabled' : ''}
              />
            </RowBetween>
          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
