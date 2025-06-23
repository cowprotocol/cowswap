import { ReactNode, useCallback, useEffect } from 'react'

import { getEtherscanLink } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSetBalancesContext } from 'entities/balancesContext/useBalancesContext'
import { Pocket } from 'react-feather'
import { useParams } from 'react-router'

import { useUpdateSelectTokenWidgetState } from 'modules/tokensList'

import { NewModal } from 'common/pure/NewModal'

import { AddressLinkStyled, Content, Title, Wrapper } from './styled'

import { CoWShedWidgetTabs } from '../../const'
import { useCurrentAccountProxyAddress } from '../../hooks/useCurrentAccountProxyAddress'
import { CoWShedFAQ } from '../../pure/CoWShedFAQ'
import { CoWShedTabs } from '../../pure/CoWShedTabs'
import { getShedRouteLink } from '../../utils/getShedRouteLink'
import { RecoverFundsWidget } from '../RecoverFundsWidget'

export function CoWShedWidget({ onDismiss }: { onDismiss: Command }): ReactNode {
  const { chainId } = useWalletInfo()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { proxyAddress, isProxyDeployed } = useCurrentAccountProxyAddress() || {}
  const params = useParams()
  const setBalancesContext = useSetBalancesContext()

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

  const explorerLink = proxyAddress ? getEtherscanLink(chainId, 'address', proxyAddress) : undefined

  return (
    <Wrapper>
      <NewModal
        modalMode={false}
        title="Account Proxy"
        onDismiss={onDismissCallback}
        contentPadding="10px"
        justifyContent="flex-start"
      >
        <CoWShedTabs
          chainId={chainId}
          tab={params.tab as CoWShedWidgetTabs}
          aboutContent={
            <>
              <Content>
                <Title>
                  <Pocket size={20} /> Account Proxy
                </Title>

                {proxyAddress && <AddressLinkStyled address={proxyAddress} chainId={chainId} noShorten />}
              </Content>
              <CoWShedFAQ
                explorerLink={explorerLink}
                recoverRouteLink={getShedRouteLink(chainId, CoWShedWidgetTabs.RECOVER_FUNDS)}
              />
            </>
          }
          recoverFundsContent={<RecoverFundsWidget />}
        />
      </NewModal>
    </Wrapper>
  )
}
