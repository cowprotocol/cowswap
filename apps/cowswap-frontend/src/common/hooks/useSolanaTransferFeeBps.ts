import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { isSolanaAddress, isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { PublicKey } from '@solana/web3.js'
import useSWR from 'swr'

import { useSolanaConnection } from 'common/hooks/useSolanaConnection'
import { getSolanaTransferFeeBps } from 'common/services/solanaTransferFee/getSolanaTransferFeeBps'

export function useSolanaTransferFeeBps(
  chainId: SupportedChainId,
  tokenAddress: string | undefined,
): number | null | undefined {
  const connection = useSolanaConnection()

  const { data } = useSWR(
    isSolanaChain(chainId) && tokenAddress && isSolanaAddress(tokenAddress)
      ? [chainId, tokenAddress, 'useSolanaTransferFeeBps']
      : null,
    ([, mint]) => getSolanaTransferFeeBps(connection, new PublicKey(mint)),
    SWR_NO_REFRESH_OPTIONS,
  )

  return data
}
