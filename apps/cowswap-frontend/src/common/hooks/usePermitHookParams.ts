import { useMemo } from 'react'

import { Currency, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { Nullish } from 'types'

import { useIsTokenPermittable } from 'modules/permit'
import { useWalletInfo } from 'modules/wallet'

import { PermitHookParams } from 'utils/generatePermitHook'

export function usePermitHookParams(sellCurrency: Nullish<Currency>): PermitHookParams | undefined {
  const { chainId, account } = useWalletInfo()
  const { provider } = useWeb3React()

  const permitInfo = useIsTokenPermittable(sellCurrency)

  return useMemo(() => {
    console.debug(`bug--usePermitHookParams-useEffect`, chainId, account, sellCurrency, provider, permitInfo)
    if (!account || !sellCurrency || !provider || !permitInfo) return undefined
    return {
      account,
      chainId,
      provider,
      inputToken: sellCurrency as Token,
      permitInfo,
    }
  }, [account, sellCurrency, provider, permitInfo, chainId])
}
