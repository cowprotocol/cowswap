import { ReactNode, useLayoutEffect, useState } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { Outlet, useLocation, useParams, matchPath } from 'react-router'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useSwapRawState } from 'modules/swap/hooks/useSwapRawState'

import { Routes } from 'common/constants/routes'
import { useNavigate, useNavigateBack } from 'common/hooks/useNavigate'
import { useTradeNavigate } from 'common/modules/tradeNavigation'
import { NewModal } from 'common/pure/NewModal'

import * as styledEl from './AccountProxyWidgetPage.styled'

import { NEED_HELP_LABEL } from '../../accountProxy.constants'
import { useOnAccountOrChainChanged } from '../../hooks/useOnAccountOrChainChanged'
import { useSetupBalancesContext } from '../../hooks/useSetupBalancesContext'
import { WalletNotConnected } from '../../pure/WalletNotConnected/WalletNotConnected.pure'
import { getProxyAccountUrl } from '../../utils/getProxyAccountUrl'
import { parameterizeRoute } from '../../utils/parameterizeRoute'
import { WidgetPageTitle } from '../WidgetPageTitle/WidgetPageTitle.container'

const URL_NETWORK_CHANGED_STATE = 'network-changed'

export function AccountProxyWidgetPage(): ReactNode {
  const { i18n } = useLingui()
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
  const isRootProxyPage = !!matchPath(Routes.ACCOUNT_PROXIES, location.pathname)
  const query = new URLSearchParams(location.search)
  const [sourceRoute] = useState<string>(query.get('source') || 'swap')

  const onDismiss = (): void => {
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

  // Go to main page when account/chainId changes
  useLayoutEffect(() => {
    if (!accountOrChainChanged) return

    navigate(getProxyAccountUrl(chainId), { state: URL_NETWORK_CHANGED_STATE })
  }, [accountOrChainChanged, chainId, navigate])

  return (
    <styledEl.EmptyWrapper>
      <styledEl.WidgetWrapper>
        <NewModal
          showBackButton={!isRootProxyPage}
          title={
            <styledEl.TitleWrapper>
              <span>
                <WidgetPageTitle />
              </span>
              {!isHelpPage && (
                <styledEl.HelpLink to={parameterizeRoute(Routes.ACCOUNT_PROXY_HELP, { chainId })}>
                  {i18n._(NEED_HELP_LABEL)}?
                </styledEl.HelpLink>
              )}
            </styledEl.TitleWrapper>
          }
          onDismiss={onDismiss}
          contentPadding="10px"
          justifyContent="flex-start"
        >
          {isWalletConnected || isHelpPage ? <Outlet /> : <WalletNotConnected onConnect={toggleWalletModal} />}
        </NewModal>
      </styledEl.WidgetWrapper>
    </styledEl.EmptyWrapper>
  )
}
