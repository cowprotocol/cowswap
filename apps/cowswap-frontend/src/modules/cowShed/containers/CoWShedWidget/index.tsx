import { ReactNode, useCallback } from 'react'

import { getEtherscanLink } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Pocket } from 'react-feather'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'

import { SelectTokenWidget, useSelectTokenWidgetState, useUpdateSelectTokenWidgetState } from 'modules/tokensList'

import { NewModal } from 'common/pure/NewModal'

import { AddressLinkStyled, Content, Title, Wrapper } from './styled'

import { useCurrentAccountProxyAddress } from '../../hooks/useCurrentAccountProxyAddress'
import { CoWShedFAQ } from '../../pure/CoWShedFAQ'
import { RecoverFundsWidget } from '../RecoverFundsWidget'

export function CoWShedWidget({ onDismiss }: { onDismiss: Command }): ReactNode {
  const { chainId } = useWalletInfo()
  const { ErrorModal } = useErrorModal()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { open: isSelectTokenWidgetOpen } = useSelectTokenWidgetState()
  const { proxyAddress } = useCurrentAccountProxyAddress() || {}

  const onDismissCallback = useCallback(() => {
    updateSelectTokenWidget({ open: false })
    onDismiss()
  }, [updateSelectTokenWidget, onDismiss])

  const explorerLink = proxyAddress ? getEtherscanLink(chainId, 'address', proxyAddress) : undefined

  return (
    <Wrapper>
      <NewModal
        modalMode={false}
        title="CoW Shed"
        onDismiss={onDismissCallback}
        contentPadding="10px"
        justifyContent="flex-start"
      >
        <ErrorModal />
        <SelectTokenWidget />
        {!isSelectTokenWidgetOpen && (
          <>
            <Content>
              <Title>
                <Pocket size={20} /> Account Proxy
              </Title>

              {proxyAddress && <AddressLinkStyled address={proxyAddress} chainId={chainId} noShorten />}

              <RecoverFundsWidget />
            </Content>
            <CoWShedFAQ explorerLink={explorerLink} />
          </>
        )}
      </NewModal>
    </Wrapper>
  )
}
