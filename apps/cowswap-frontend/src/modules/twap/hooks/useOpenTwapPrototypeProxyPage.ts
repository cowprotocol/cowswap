import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { getProxyAccountDetailsUrl } from 'modules/accountProxy'

import { useNavigate } from 'common/hooks/useNavigate'

import { getPrototypeProxyAddress } from '../utils/buildPrototypeProxyState'

export function useOpenTwapPrototypeProxyPage(): () => void {
  const navigate = useNavigate()
  const { account, chainId } = useWalletInfo()

  return useCallback(() => {
    if (!account) return

    navigate(getProxyAccountDetailsUrl(chainId, getPrototypeProxyAddress(account, chainId)))
  }, [account, chainId, navigate])
}
