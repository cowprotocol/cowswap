import BlocknativeSdk from 'bnc-sdk'
import { SDKError } from 'bnc-sdk/dist/types/src/interfaces'
import { getSupportedChainIds } from 'connectors'

const BLOCKNATIVE_API_KEY = process.env.REACT_APP_BLOCKNATIVE_API_KEY

export const sdk = !BLOCKNATIVE_API_KEY
  ? {}
  : getSupportedChainIds().reduce<Record<number, BlocknativeSdk | null>>((acc, networkId) => {
      try {
        acc[networkId] = new BlocknativeSdk({
          dappId: BLOCKNATIVE_API_KEY,
          networkId,
          name: 'bnc_' + networkId,
          onerror: (error: SDKError) => {
            console.log(error)
          },
        })
      } catch (error) {
        console.error('Instantiating BlocknativeSdk failed', error)
      }

      console.info(`BlocknativeSdk initialized on chain ${networkId}`)

      return acc
    }, {})
