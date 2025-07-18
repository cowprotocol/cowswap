import { atom, useAtom } from 'jotai/index'
import { ReactNode, useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useToggleWalletModal } from 'legacy/state/application/hooks'

import {
  SelectTokenWidget,
  useOpenTokenSelectWidget,
  useSelectTokenWidgetState,
  useSourceChainId,
} from 'modules/tokensList'

import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'

import { RecoverFundsButtons } from './RecoverFundsButtons'
import { ConnectWalletButton, Wrapper } from './styled'

const selectedCurrencyAtom = atom<Currency | undefined>(undefined)

interface RecoverFundsWidgetProps {
  defaultToken: TokenWithLogo | undefined
}

export function RecoverFundsWidget({ defaultToken: defaultTokenToRefund }: RecoverFundsWidgetProps): ReactNode {
  const { account } = useWalletInfo()
  const [_selectedCurrency, setSelectedCurrency] = useAtom(selectedCurrencyAtom)
  const selectedCurrency = _selectedCurrency ?? defaultTokenToRefund

  const toggleWalletModal = useToggleWalletModal()
  const { ErrorModal } = useErrorModal()
  const { open: isSelectTokenWidgetOpen } = useSelectTokenWidgetState()

  const onSelectToken = useOpenTokenSelectWidget()

  const sourceChainId = useSourceChainId()

  const onCurrencySelectClick = useCallback(() => {
    onSelectToken(selectedCurrency, undefined, undefined, setSelectedCurrency)
  }, [onSelectToken, selectedCurrency, setSelectedCurrency])

  return (
    <Wrapper>
      <ErrorModal />
      <SelectTokenWidget standalone />

      {!account ? (
        <div>
          <ConnectWalletButton onClick={toggleWalletModal}>Connect wallet</ConnectWalletButton>
        </div>
      ) : (
        <>
          {!isSelectTokenWidgetOpen && (
            <div>
              <CurrencySelectButton currency={selectedCurrency} loading={false} onClick={onCurrencySelectClick} />
            </div>
          )}

          <RecoverFundsButtons selectedCurrency={selectedCurrency} sourceChainId={sourceChainId} />
        </>
      )}
    </Wrapper>
  )
}
