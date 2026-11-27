import {
  areAddressesEqual,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'

import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD,
} from './cowProtocolContracts'
import { isBarnBackendEnv } from './environments'

describe('Linea barn contracts', () => {
  it('signs Linea against the staging settlement while that chain posts to barn', () => {
    expect(
      areAddressesEqual(
        COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.LINEA],
        COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[SupportedChainId.LINEA],
      ),
    ).toBe(true)
  })

  it('approves Linea against the staging vault relayer while that chain posts to barn', () => {
    expect(
      areAddressesEqual(
        COW_PROTOCOL_VAULT_RELAYER_ADDRESS[SupportedChainId.LINEA],
        COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING[SupportedChainId.LINEA],
      ),
    ).toBe(true)
  })

  it('keeps mainnet on the env-resolved settlement', () => {
    const expected = isBarnBackendEnv
      ? COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[SupportedChainId.MAINNET]
      : COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD[SupportedChainId.MAINNET]

    expect(areAddressesEqual(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET], expected)).toBe(true)
    expect(
      areAddressesEqual(
        COW_PROTOCOL_VAULT_RELAYER_ADDRESS[SupportedChainId.MAINNET],
        isBarnBackendEnv
          ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING[SupportedChainId.MAINNET]
          : COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD[SupportedChainId.MAINNET],
      ),
    ).toBe(true)
  })
})
