import BlocknativeSdk from 'bnc-sdk'
import { SDKError } from 'bnc-sdk/dist/types/src/interfaces'
import { getSupportedChainIds } from 'connectors'

export const sdk = getSupportedChainIds().reduce<Record<number, BlocknativeSdk>>((acc, networkId) => {
  try {
    acc[networkId] = new BlocknativeSdk({
      dappId: process.env.REACT_APP_BLOCKNATIVE_API_KEY || '',
      networkId,
      name: 'bnc_' + networkId,
      onerror: (error: SDKError) => {
        console.log(error)
      },
    })
  } catch (error) {
    console.error('Instantiating BlocknativeSdk failed', error)
  }

  return acc
}, {})
