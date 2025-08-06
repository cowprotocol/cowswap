import { ReactNode, useRef, useState } from 'react'

import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Outlet, useLocation, useParams } from 'react-router'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useSwapRawState } from 'modules/swap'
import { useTradeNavigate } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { NewModal } from 'common/pure/NewModal'

import { EmptyWrapper, HelpLink, ModalWrapper, TitleWrapper, WidgetWrapper } from './styled'

import { useNavigateBack } from '../../../../common/hooks/useNavigate'
import { useSetupBalancesContext } from '../../hooks/useSetupBalancesContext'
import { WalletNotConnected } from '../../pure/WalletNotConnected'
import { parameterizeRoute } from '../../utils/parameterizeRoute'

interface AccountProxiesPageProps {
  modalMode?: boolean
  onDismiss?(): void
}

export function AccountProxyWidgetPage({
  modalMode = false,
  onDismiss: modalOnDismiss,
}: AccountProxiesPageProps): ReactNode {
  const widgetRef = useRef(null)

  const Wrapper = modalMode ? ModalWrapper : EmptyWrapper

  const { chainId, account } = useWalletInfo()
  const tradeNavigate = useTradeNavigate()
  const { inputCurrencyId, outputCurrencyId } = useSwapRawState()
  const location = useLocation()
  const { proxyAddress } = useParams()
  const navigateBack = useNavigateBack()
  const toggleWalletModal = useToggleWalletModal()

  // Switch BalancesUpdater context to the current proxy
  useSetupBalancesContext(proxyAddress)

  const isWalletConnected = !!account
  const isHelpPage = location.pathname.endsWith('/help')
  const query = new URLSearchParams(location.search)
  const [sourceRoute] = useState<string>(query.get('source') || 'swap')

  const defaultOnDismiss = (): void => {
    if (location.key === 'default') {
      tradeNavigate(
        chainId,
        { inputCurrencyId, outputCurrencyId },
        undefined,
        sourceRoute === 'hooks' ? Routes.HOOKS : Routes.SWAP,
      )
    } else {
      navigateBack()
    }
  }

  const onDismiss = modalOnDismiss || defaultOnDismiss

  useOnClickOutside([widgetRef], modalMode ? onDismiss : undefined)

  return (
    <Wrapper $modalMode={modalMode}>
      <WidgetWrapper ref={widgetRef}>
        <NewModal
          modalMode={modalMode}
          title={
            <TitleWrapper>
              <span>Proxy Accounts</span>
              <HelpLink to={parameterizeRoute(Routes.ACCOUNT_PROXY_HELP, { chainId })}>Need help?</HelpLink>
            </TitleWrapper>
          }
          onDismiss={onDismiss}
          contentPadding="10px"
          justifyContent="flex-start"
        >
          {isWalletConnected || isHelpPage ? <Outlet /> : <WalletNotConnected onConnect={toggleWalletModal} />}
        </NewModal>
      </WidgetWrapper>
    </Wrapper>
  )
}
