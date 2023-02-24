import { GpModal } from '@cow/common/pure/Modal'

import { Trans } from '@lingui/macro'
import { Routes } from '@cow/constants/routes'
import { StyledInternalLink } from 'theme/components'

import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'
import { ConnectionType, walletConnectConnection } from 'connection'
import { getConnection, getIsCoinbaseWallet, getIsInjected, getIsMetaMask } from '@cow/modules/wallet/api/utils'
import { useCallback, useEffect, useState } from 'react'
import { updateConnectionError } from 'state/connection/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { updateSelectedWallet } from 'state/user/reducer'
import { isMobile } from 'utils/userAgent'

import { useModalIsOpen, useToggleWalletModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { ThemedText } from 'theme'
import { LightCard } from 'components/Card'
import { CoinbaseWalletOption } from './options/CoinbaseWalletOption'
import { FortmaticOption } from './options/FortmaticOption'
import {
  InjectedOption,
  InstallMetaMaskOption,
  MetaMaskOption,
  OpenMetaMaskMobileOption,
} from './options//InjectedOption'
import PendingView from '@cow/modules/wallet/api/components/WalletModal/PendingView'
import { WalletConnectOption } from './options//WalletConnectOption'

import { changeWalletAnalytics } from 'components/analytics'
import usePrevious from 'hooks/usePrevious'
import { HeaderRow, HoverText, CloseIcon, ContentWrapper } from '@cow/common/pure/Modal'
import { CloseColor, OptionGrid, TermsWrapper, UpperSection, Wrapper } from './styled'

const WALLET_VIEWS = {
  OPTIONS: 'options',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

export function WalletModal() {
  const dispatch = useAppDispatch()
  const { account, isActive, connector } = useWeb3React()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingConnector, setPendingConnector] = useState<Connector | undefined>()
  const pendingError = useAppSelector((state) =>
    pendingConnector ? state.connection.errorByConnectionType[getConnection(pendingConnector).type] : undefined
  )

  const walletModalOpen = useModalIsOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useToggleWalletModal()

  const openOptions = useCallback(() => {
    setWalletView(WALLET_VIEWS.OPTIONS)
  }, [setWalletView])

  useEffect(() => {
    if (walletModalOpen) {
      setWalletView(account ? WALLET_VIEWS.ACCOUNT : WALLET_VIEWS.OPTIONS)
    }
  }, [walletModalOpen, setWalletView, account])

  useEffect(() => {
    if (pendingConnector && walletView !== WALLET_VIEWS.PENDING) {
      updateConnectionError({ connectionType: getConnection(pendingConnector).type, error: undefined })
      setPendingConnector(undefined)
    }
  }, [pendingConnector, walletView])

  const activePrevious = usePrevious(isActive)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (
      walletModalOpen &&
      ((isActive && !activePrevious) || (connector && connector !== connectorPrevious && !pendingError))
    ) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
      toggleWalletModal()
    }
  }, [
    setWalletView,
    isActive,
    pendingError,
    connector,
    walletModalOpen,
    activePrevious,
    connectorPrevious,
    toggleWalletModal,
  ])

  const tryActivation = useCallback(
    async (connector: Connector) => {
      const connectionType = getConnection(connector).type

      changeWalletAnalytics('Todo: wallet name')

      try {
        // Fortmatic opens it's own modal on activation to log in. This modal has a tabIndex
        // collision into the WalletModal, so we special case by closing the modal.
        if (connectionType === ConnectionType.FORTMATIC) {
          toggleWalletModal()
        }

        setPendingConnector(connector)
        setWalletView(WALLET_VIEWS.PENDING)
        dispatch(updateConnectionError({ connectionType, error: undefined }))

        await connector.activate()

        // Important for balances to load when connected to Gnosis-chain via WalletConnect
        if (getConnection(connector) === walletConnectConnection) {
          const provider: any = connector.provider

          if (provider && provider.isWalletConnect) {
            const { http, rpc, signer } = (connector as any).provider
            const chainId = signer.connection.chainId
            // don't default to SupportedChainId.Mainnet - throw instead
            if (!chainId) throw new Error('[WalletModal::activation error: No chainId')
            http.connection.url = rpc.custom[chainId]
          }
        }

        dispatch(updateSelectedWallet({ wallet: connectionType }))
      } catch (error: any) {
        console.debug(`web3-react connection error: ${error}`)
        dispatch(updateConnectionError({ connectionType, error: error.message }))
      }
    },
    [dispatch, toggleWalletModal]
  )

  function getOptions() {
    const isInjected = getIsInjected()
    const isMetaMask = getIsMetaMask()
    const isCoinbaseWallet = getIsCoinbaseWallet()

    const isCoinbaseWalletBrowser = isMobile && isCoinbaseWallet
    const isMetaMaskBrowser = isMobile && isMetaMask
    const isInjectedMobileBrowser = isCoinbaseWalletBrowser || isMetaMaskBrowser

    let injectedOption
    if (!isInjected) {
      if (!isMobile) {
        injectedOption = <InstallMetaMaskOption />
      } else {
        injectedOption = <OpenMetaMaskMobileOption />
      }
    } else if (!isCoinbaseWallet) {
      if (isMetaMask) {
        injectedOption = <MetaMaskOption tryActivation={tryActivation} />
      } else {
        injectedOption = <InjectedOption tryActivation={tryActivation} />
      }
    }

    const coinbaseWalletOption = <CoinbaseWalletOption tryActivation={tryActivation} />

    const walletConnectionOption =
      (!isInjectedMobileBrowser && <WalletConnectOption tryActivation={tryActivation} />) ?? null

    const fortmaticOption = (!isInjectedMobileBrowser && <FortmaticOption tryActivation={tryActivation} />) ?? null

    return (
      <>
        {injectedOption}
        {walletConnectionOption}
        {coinbaseWalletOption}
        {fortmaticOption}
      </>
    )
  }

  function getModalContent() {
    let headerRow
    if (walletView === WALLET_VIEWS.PENDING) {
      headerRow = null
    } else {
      headerRow = (
        <HeaderRow>
          <HoverText>
            <Trans>Connect a wallet</Trans>
          </HoverText>
        </HeaderRow>
      )
    }

    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        {headerRow}
        <ContentWrapper>
          <AutoColumn gap="16px">
            {walletView === WALLET_VIEWS.PENDING && pendingConnector && (
              <PendingView
                openOptions={openOptions}
                connector={pendingConnector}
                error={!!pendingError}
                tryActivation={tryActivation}
              />
            )}
            {walletView !== WALLET_VIEWS.PENDING && <OptionGrid data-testid="option-grid">{getOptions()}</OptionGrid>}
            {!pendingError && (
              <LightCard>
                <AutoRow style={{ flexWrap: 'nowrap' }}>
                  <ThemedText.Body fontSize={12}>
                    <CustomTerms />
                  </ThemedText.Body>
                </AutoRow>
              </LightCard>
            )}
          </AutoColumn>
        </ContentWrapper>
      </UpperSection>
    )
  }

  return (
    <GpModal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </GpModal>
  )
}

function CustomTerms() {
  return (
    <TermsWrapper>
      <Trans>
        By connecting a wallet, you acknowledge that you have read, understood and agree to the interface’s{' '}
        <StyledInternalLink style={{ marginRight: 5 }} to={Routes.TERMS_CONDITIONS} target="_blank">
          Terms &amp; Conditions.
        </StyledInternalLink>
      </Trans>
    </TermsWrapper>
  )
}
