import { useCallback } from 'react'
import { _getClientOrThrow } from '@cow/api/gnosisSafe'
import { JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers'
import EthersAdapter from '@safe-global/safe-ethers-lib'
// eslint-disable-next-line no-restricted-imports
import { ethers } from 'ethers'
import Safe from '@safe-global/safe-core-sdk'
import { useWeb3React } from '@web3-react/core'
import { proposeTransaction } from '@cow/modules/twapOrders/utils/proposeTransaction'

const handlerAddresses: Record<number, string> = {
  1: '0x87b52ed635df746ca29651581b4d87517aaa9a9f',
  5: '0x87b52ed635df746ca29651581b4d87517aaa9a9f',
  100: '0x87b52ed635df746ca29651581b4d87517aaa9a9f',
}

export function useBindFallbackHandler() {
  const { account, provider: library, chainId } = useWeb3React()

  return useCallback(async () => {
    const handlerAddress = chainId ? handlerAddresses[chainId] : null

    if (!library || !account || !chainId || !handlerAddress) return

    const client = _getClientOrThrow(chainId, library)
    const signer = library.getSigner()

    const provider = new Web3Provider(library.send.bind(library) as JsonRpcFetchFunc)
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: provider.getSigner(0),
    })
    const safe = await Safe.create({ ethAdapter: ethAdapter as any, safeAddress: account })

    const safeTransaction = await safe.createEnableFallbackHandlerTx(handlerAddress)
    await proposeTransaction(safe, client as any, safeTransaction, signer)
  }, [chainId, library, account])
}
