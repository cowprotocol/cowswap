import { useCallback } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useGeneratePermitHook, usePermitInfo } from 'modules/permit'
import { TradeType } from 'modules/trade'

import { useResetApproveProgressModalState, useUpdateApproveProgressModalState } from '../'

export function useGeneratePermitInAdvanceToTrade(amountToApprove: CurrencyAmount<Currency>): () => Promise<boolean> {
  const generatePermit = useGeneratePermitHook()
  const updateApproveProgressModalState = useUpdateApproveProgressModalState()
  const resetApproveProgressModalState = useResetApproveProgressModalState()
  const { account } = useWalletInfo()

  const token = getWrappedToken(amountToApprove.currency)
  const permitInfo = usePermitInfo(token, TradeType.SWAP)

  return useCallback(async () => {
    if (!account || !permitInfo) return false

    const preSignCallback = (): void =>
      updateApproveProgressModalState({
        currency: amountToApprove.currency,
        approveInProgress: true,
        amountToApprove,
      })

    const permitData = await generatePermit({
      inputToken: { name: token.name || '', address: token.address as `0x${string}` },
      account,
      permitInfo,
      amount: BigInt(amountToApprove.quotient.toString()),
      preSignCallback,
      postSignCallback: resetApproveProgressModalState,
    })

    return !!permitData
  }, [
    account,
    amountToApprove,
    generatePermit,
    permitInfo,
    resetApproveProgressModalState,
    token.address,
    token.name,
    updateApproveProgressModalState,
  ])
}
