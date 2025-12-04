import { Dispatch, SetStateAction, useMemo, useState } from 'react'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

interface SmartContractRecipientConfirmContext {
  isConfirmed: boolean
  state: [boolean, Dispatch<SetStateAction<boolean>>] | undefined
}

export function useSmartContractRecipientConfirm(props: {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  isSmartContractWallet: boolean | undefined
}): SmartContractRecipientConfirmContext {
  const state = useState(false)
  const inputChainId = props.inputCurrencyInfo.amount?.currency.chainId
  const outputChainId = props.outputCurrencyInfo.amount?.currency.chainId
  const isBridgingTrade = inputChainId !== outputChainId
  const shouldCheckBridgingRecipient = props.isSmartContractWallet && isBridgingTrade

  const isConfirmed = shouldCheckBridgingRecipient ? state[0] : true

  return useMemo(
    () => ({ isConfirmed, state: shouldCheckBridgingRecipient ? state : undefined }),
    [isConfirmed, state, shouldCheckBridgingRecipient],
  )
}
