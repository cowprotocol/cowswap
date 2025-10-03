import { useCallback } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useGeneratePermitHook, usePermitInfo } from 'modules/permit'

import { TradeType } from '../../trade'
import { useUpdateTradeApproveState } from '../index'

export function useGeneratePermitInAdvanceToTrade(amountToApprove: CurrencyAmount<Currency>): () => Promise<boolean> {
  const generatePermit = useGeneratePermitHook()
  const updateTradeApproveState = useUpdateTradeApproveState()
  const { account } = useWalletInfo()

  const token = getWrappedToken(amountToApprove.currency)
  const permitInfo = usePermitInfo(token, TradeType.SWAP)

  return useCallback(async () => {
    if (!account || !permitInfo) return false

    const preSignCallback = (): void =>
      updateTradeApproveState({
        currency: amountToApprove.currency,
        approveInProgress: true,
      })
    const postSignCallback = (): void => updateTradeApproveState({ currency: undefined, approveInProgress: false })

    const permitData = await generatePermit({
      // todo handle empty token name/address?
      inputToken: { name: token.name || '', address: token.address },
      account,
      permitInfo,
      amount: BigInt(amountToApprove.quotient.toString()),
      preSignCallback,
      postSignCallback,
    })

    return !!permitData
  }, [
    account,
    amountToApprove.currency,
    amountToApprove.quotient,
    generatePermit,
    permitInfo,
    token.address,
    token.name,
    updateTradeApproveState,
  ])
}
