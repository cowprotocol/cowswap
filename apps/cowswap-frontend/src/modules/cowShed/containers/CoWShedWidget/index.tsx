import { ReactNode, useCallback, useEffect, useRef } from 'react'

import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSetBalancesContext } from 'entities/balancesContext/useBalancesContext'
import { Pocket } from 'react-feather'
import { useParams } from 'react-router'

import { useUpdateSelectTokenWidgetState } from 'modules/tokensList'

import { NewModal } from 'common/pure/NewModal'

import { AddressLinkStyled, Content, EmptyWrapper, ModalWrapper, Title, WidgetWrapper } from './styled'

import { CoWShedWidgetTabs } from '../../const'
import { useCurrentAccountProxyAddress } from '../../hooks/useCurrentAccountProxyAddress'
import { useTokensToRefund } from '../../hooks/useTokensToRefund'
import { CoWShedFAQ } from '../../pure/CoWShedFAQ'
import { TokensInProxyBanner } from '../../pure/TokensInProxyBanner'
import { getShedRouteLink } from '../../utils/getShedRouteLink'
import { CoWShedTabs } from '../CoWShedTabs'
import { RecoverFundsWidget } from '../RecoverFundsWidget'

interface CoWShedWidgetProps {
  modalMode: boolean
  onDismiss(): void
}

export function CoWShedWidget({ onDismiss, modalMode }: CoWShedWidgetProps): ReactNode {
  const { chainId } = useWalletInfo()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { proxyAddress, isProxyDeployed } = useCurrentAccountProxyAddress() || {}
  const params = useParams()
  const setBalancesContext = useSetBalancesContext()
  const widgetRef = useRef(null)

  const tokensToRefund = useTokensToRefund(!!isProxyDeployed)
  const defaultTokenToRefund = tokensToRefund?.[0]

  const onDismissCallback = useCallback(() => {
    updateSelectTokenWidget({ open: false })
    onDismiss()
  }, [updateSelectTokenWidget, onDismiss])

  useEffect(() => {
    if (!isProxyDeployed) return

    if (proxyAddress) {
      setBalancesContext({ account: proxyAddress })
    }

    return () => {
      setBalancesContext({ account: null })
    }
  }, [proxyAddress, isProxyDeployed, setBalancesContext])

  useOnClickOutside([widgetRef], onDismissCallback)

  const Wrapper = modalMode ? ModalWrapper : EmptyWrapper

  return (
    <Wrapper $modalMode={modalMode}>
      <WidgetWrapper ref={widgetRef}>
        <NewModal
          modalMode={modalMode}
          title="Account Proxy"
          onDismiss={onDismissCallback}
          contentPadding="10px"
          justifyContent="flex-start"
        >
          <CoWShedTabs
            chainId={chainId}
            modalMode={modalMode}
            tab={modalMode ? undefined : (params.tab as CoWShedWidgetTabs)}
            aboutContent={
              <>
                <Content>
                  <Title>
                    <Pocket size={20} /> Account Proxy
                  </Title>

                  {proxyAddress && <AddressLinkStyled address={proxyAddress} chainId={chainId} noShorten />}
                </Content>
                {isProxyDeployed && tokensToRefund?.length && (
                  <>
                    <br />
                    <TokensInProxyBanner tokensToRefund={tokensToRefund} />
                  </>
                )}
                <CoWShedFAQ recoverRouteLink={getShedRouteLink(chainId, CoWShedWidgetTabs.RECOVER_FUNDS)} />
              </>
            }
            recoverFundsContent={
              <RecoverFundsWidget defaultToken={isProxyDeployed ? defaultTokenToRefund?.token : undefined} />
            }
          />
        </NewModal>
      </WidgetWrapper>
    </Wrapper>
  )
}
