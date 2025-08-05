import { ReactNode, useRef, useState } from 'react'

import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Outlet, useLocation } from 'react-router'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useSwapRawState } from 'modules/swap'
import { useTradeNavigate } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { NewModal } from 'common/pure/NewModal'

import { EmptyWrapper, ModalWrapper, WidgetWrapper } from './styled'

import { WalletNotConnected } from '../../pure/WalletNotConnected'

interface AccountProxiesPageProps {
  modalMode?: boolean
  onDismiss?(): void
}

export function AccountProxiesPage({
  modalMode = false,
  onDismiss: modalOnDismiss,
}: AccountProxiesPageProps): ReactNode {
  const widgetRef = useRef(null)

  const Wrapper = modalMode ? ModalWrapper : EmptyWrapper

  const { chainId, account } = useWalletInfo()
  const tradeNavigate = useTradeNavigate()
  const { inputCurrencyId, outputCurrencyId } = useSwapRawState()
  const location = useLocation()
  const toggleWalletModal = useToggleWalletModal()

  const isWalletConnected = !!account
  const query = new URLSearchParams(location.search)
  const [sourceRoute] = useState<string>(query.get('source') || 'swap')

  const defaultOnDismiss = (): void => {
    tradeNavigate(
      chainId,
      { inputCurrencyId, outputCurrencyId },
      undefined,
      sourceRoute === 'hooks' ? Routes.HOOKS : Routes.SWAP,
    )
  }

  const onDismiss = modalOnDismiss || defaultOnDismiss

  useOnClickOutside([widgetRef], modalMode ? onDismiss : undefined)

  return (
    <Wrapper $modalMode={modalMode}>
      <WidgetWrapper ref={widgetRef}>
        <NewModal
          modalMode={modalMode}
          title={'Proxy Accounts'}
          onDismiss={onDismiss}
          contentPadding="10px"
          justifyContent="flex-start"
        >
          {isWalletConnected ? <Outlet /> : <WalletNotConnected onConnect={toggleWalletModal} />}
        </NewModal>
      </WidgetWrapper>
    </Wrapper>
  )
}
