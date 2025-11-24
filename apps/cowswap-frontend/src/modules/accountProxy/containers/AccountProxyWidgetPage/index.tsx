import { ReactNode, useLayoutEffect, useRef, useState } from 'react'

import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { isAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { Outlet, useLocation, useParams } from 'react-router'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useSwapRawState } from 'modules/swap/hooks/useSwapRawState'
import { useTradeNavigate } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { useNavigate, useNavigateBack } from 'common/hooks/useNavigate'
import { NewModal } from 'common/pure/NewModal'

import { EmptyWrapper, HelpLink, ModalWrapper, TitleWrapper, WidgetWrapper } from './styled'

import { NEED_HELP_LABEL } from '../../consts'
import { useOnAccountOrChainChanged } from '../../hooks/useOnAccountOrChainChanged'
import { useSetupBalancesContext } from '../../hooks/useSetupBalancesContext'
import { WalletNotConnected } from '../../pure/WalletNotConnected'
import { getProxyAccountUrl } from '../../utils/getProxyAccountUrl'
import { parameterizeRoute } from '../../utils/parameterizeRoute'
import { WidgetPageTitle } from '../WidgetPageTitle'

const URL_NETWORK_CHANGED_STATE = 'network-changed'

interface AccountProxiesPageProps {
  modalMode?: boolean
  onDismiss?(): void
}

export function AccountProxyWidgetPage({
  modalMode = false,
  onDismiss: modalOnDismiss,
}: AccountProxiesPageProps): ReactNode {
  const { i18n } = useLingui()
  const widgetRef = useRef(null)
  const Wrapper = modalMode ? ModalWrapper : EmptyWrapper
  const { chainId, account } = useWalletInfo()
  const tradeNavigate = useTradeNavigate()
  const { inputCurrencyId, outputCurrencyId } = useSwapRawState()
  const location = useLocation()
  const { proxyAddress } = useParams()
  const navigate = useNavigate()
  const accountOrChainChanged = useOnAccountOrChainChanged()
  const navigateBack = useNavigateBack()
  const toggleWalletModal = useToggleWalletModal()

  // Switch BalancesUpdater context to the current proxy (only if valid address)
  useSetupBalancesContext(proxyAddress && isAddress(proxyAddress) ? proxyAddress : undefined)

  const isWalletConnected = !!account
  const isHelpPage = location.pathname.endsWith('/help')
  const query = new URLSearchParams(location.search)
  const [sourceRoute] = useState<string>(query.get('source') || 'swap')

  const defaultOnDismiss = (): void => {
    if (location.key === 'default' || location.state === URL_NETWORK_CHANGED_STATE) {
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

  // Go to main page when account/chainId changes
  useLayoutEffect(() => {
    if (!accountOrChainChanged) return

    navigate(getProxyAccountUrl(chainId), { state: URL_NETWORK_CHANGED_STATE })
  }, [accountOrChainChanged, chainId, navigate])

  useOnClickOutside([widgetRef], modalMode ? onDismiss : undefined)

  return (
    <Wrapper $modalMode={modalMode}>
      <WidgetWrapper ref={widgetRef}>
        <NewModal
          modalMode={modalMode}
          title={
            <TitleWrapper>
              <span>
                <WidgetPageTitle />
              </span>
              {!isHelpPage && (
                <HelpLink to={parameterizeRoute(Routes.ACCOUNT_PROXY_HELP, { chainId })}>
                  {i18n._(NEED_HELP_LABEL)}?
                </HelpLink>
              )}
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
