import { ReactNode, useCallback, useEffect, useRef } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSetBalancesContext } from 'entities/balancesContext/useBalancesContext'
import { Pocket } from 'react-feather'
import { useParams } from 'react-router'

import { useUpdateSelectTokenWidgetState } from 'modules/tokensList'

import { NewModal } from 'common/pure/NewModal'

import { AddressLinkStyled, Content, EmptyWrapper, ModalWrapper, Title, WidgetWrapper } from './styled'

import { CoWShedWidgetTabs } from '../../const'
import { useCurrentAccountProxyAddress } from '../../hooks/useCurrentAccountProxy'
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
  const proxyAddress = useCurrentAccountProxyAddress()
  const params = useParams()
  const setBalancesContext = useSetBalancesContext()
  const widgetRef = useRef(null)

  const tokensToRefund = useTokensToRefund()
  const defaultTokenToRefund = tokensToRefund?.[0]

  const onDismissCallback = useCallback(() => {
    updateSelectTokenWidget({ open: false })
    onDismiss()
  }, [updateSelectTokenWidget, onDismiss])

  useEffect(() => {
    if (proxyAddress) {
      setBalancesContext({ account: proxyAddress })
    }

    return () => {
      setBalancesContext({ account: null })
    }
  }, [proxyAddress, setBalancesContext])

  useOnClickOutside([widgetRef], modalMode ? onDismissCallback : undefined)

  const Wrapper = modalMode ? ModalWrapper : EmptyWrapper

  const AboutContent = (
    <>
      <Content>
        <Title>
          <Pocket size={20} /> {ACCOUNT_PROXY_LABEL}
        </Title>

        {proxyAddress && <AddressLinkStyled address={proxyAddress} chainId={chainId} noShorten />}
      </Content>
      {!!tokensToRefund?.length && (
        <>
          <br />
          <TokensInProxyBanner tokensToRefund={tokensToRefund} />
        </>
      )}
      <CoWShedFAQ recoverRouteLink={getShedRouteLink(chainId, CoWShedWidgetTabs.RECOVER_FUNDS)} />
    </>
  )

  return (
    <Wrapper $modalMode={modalMode}>
      <WidgetWrapper ref={widgetRef}>
        <NewModal
          modalMode={modalMode}
          title={ACCOUNT_PROXY_LABEL}
          onDismiss={onDismissCallback}
          contentPadding="10px"
          justifyContent="flex-start"
        >
          <CoWShedTabs
            chainId={chainId}
            modalMode={modalMode}
            tab={modalMode ? undefined : (params.tab as CoWShedWidgetTabs)}
            aboutContent={AboutContent}
            recoverFundsContent={<RecoverFundsWidget defaultToken={defaultTokenToRefund?.token} />}
          />
        </NewModal>
      </WidgetWrapper>
    </Wrapper>
  )
}
