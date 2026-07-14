import { COW_TOKEN_TO_CHAIN } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { COMPOSABLE_COW_ADDRESS, CURRENT_BLOCK_FACTORY_ADDRESS } from 'modules/advancedOrders'

import { buildEoaTwapSetupCalls } from './buildEoaTwapSetupCalls'

import { ConditionalOrderParams } from '../types'

const chainId = SupportedChainId.SEPOLIA
const COW_SEPOLIA = COW_TOKEN_TO_CHAIN[chainId]

if (!COW_SEPOLIA) {
  throw new Error(`COW token not found for chain ${chainId}`)
}

const paramsStruct: ConditionalOrderParams = {
  handler: '0x6c99c4c8d51ed92722d1cd059cad3b8b0e506759',
  salt: '0x0000000000000000000000000000000000000000000000000000018c6c5e8000',
  staticInput: '0x',
}

const vaultRelayer = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'

const baseParams = {
  sellTokenAddress: COW_SEPOLIA.address,
  vaultRelayerAddress: vaultRelayer,
  composableCowAddress: COMPOSABLE_COW_ADDRESS[chainId],
  currentBlockFactoryAddress: CURRENT_BLOCK_FACTORY_ADDRESS[chainId],
  paramsStruct,
} as const

describe('buildEoaTwapSetupCalls()', () => {
  it('Includes approve then create when needsApproval is true', () => {
    const calls = buildEoaTwapSetupCalls({ ...baseParams, needsApproval: true })

    expect(calls).toHaveLength(2)

    expect(calls[0].target.toLowerCase()).toBe(COW_SEPOLIA.address.toLowerCase())
    expect(calls[0].value).toBe(0n)
    expect(calls[0].isDelegateCall).toBe(false)
    expect(calls[0].allowFailure).toBe(false)
    expect(calls[0].callData).toMatch(/^0x/)

    expect(calls[1].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
    expect(calls[1].value).toBe(0n)
    expect(calls[1].isDelegateCall).toBe(false)
    expect(calls[1].allowFailure).toBe(false)
    expect(calls[1].callData).toMatch(/^0x/)
  })

  it('Omits approve when needsApproval is false', () => {
    const calls = buildEoaTwapSetupCalls({ ...baseParams, needsApproval: false })

    expect(calls).toHaveLength(1)
    expect(calls[0].target).toBe(COMPOSABLE_COW_ADDRESS[chainId])
  })
})
