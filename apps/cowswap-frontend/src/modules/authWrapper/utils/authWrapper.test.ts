import {
  concatHex,
  encodeAbiParameters,
  getAddress,
  hashTypedData,
  keccak256,
  parseAbiParameters,
  toHex,
  type Hex,
} from 'viem'

import { buildWrapperDomain, buildWrapperOrderTypedData } from './buildWrapperOrderTypedData'
import { computeOrderAppData, computeOrderAppDataFromParts, hashWrapperParams } from './computeOrderAppData'
import { encodeWrapperParams } from './encodeWrapperParams'
import {
  AuthWrapperConfigError,
  baseTypeOf,
  buildWrapperAndAppDataType,
  collectReferencedTypes,
  encodeStructDefinition,
  resolveAuthWrapper,
} from './resolveAuthWrapper'

import { BuyTokenDestination, OrderKind, SellTokenSource } from '@cowprotocol/cow-sdk'

import type { CowAuthWrapperConfig } from '../authWrapper.types'

/**
 * Type strings copied verbatim from `CowAuthLibrary` (`bundles-template`, branch
 * `add-auth-wrapper`). Expectations below are derived from these literals rather
 * than from our own encoder, so the tests fail if our structured derivation ever
 * drifts from what the contract hardcodes.
 */
const SOL_ORDER_TYPE_STRING =
  'Order(address sellToken,address buyToken,address receiver,uint256 sellAmount,uint256 buyAmount,uint32 validTo,WrapperAndAppData wrapperAndAppData,uint256 feeAmount,string kind,bool partiallyFillable,string sellTokenBalance,string buyTokenBalance)'
const SOL_DOMAIN_TYPE_STRING = 'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'

/** `BasicAuthWrapper.WRAPPER_AND_APP_DATA_TYPE_HASH`, verbatim. */
const SOL_BASIC_WRAPPER_AND_APP_DATA_TYPE_STRING =
  'WrapperAndAppData(bytes32 nestedAppData,WrapperParams wrapperData)WrapperParams(address target,uint128 amount,string label)'

const WRAPPER_ADDRESS = getAddress('0x1111111111111111111111111111111111111111')
const OWNER = getAddress('0x2222222222222222222222222222222222222222')
const CHAIN_ID = 1

/**
 * Same field shape as `BasicAuthWrapper.WrapperParams`, but named `SwapParams` so the
 * contract's order type hash stays canonical (see `assertCanonicalOrderTypeOrdering`).
 */
const PARAMS_TYPE_STRING = 'SwapParams(address target,uint128 amount,string label)'
const WRAPPER_AND_APP_DATA_TYPE_STRING = `WrapperAndAppData(bytes32 nestedAppData,SwapParams wrapperData)${PARAMS_TYPE_STRING}`

const CONFIG: CowAuthWrapperConfig = {
  address: WRAPPER_ADDRESS,
  paramsType: 'SwapParams',
  paramsField: 'wrapperData',
  types: {
    SwapParams: [
      { name: 'target', type: 'address' },
      { name: 'amount', type: 'uint128' },
      { name: 'label', type: 'string' },
    ],
  },
  params: { target: OWNER, amount: 42_000n, label: 'integration' },
}

const NESTED_APP_DATA = keccak256(toHex('integration-app-data'))

const ORDER = {
  sellToken: getAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
  buyToken: getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
  receiver: getAddress('0x3333333333333333333333333333333333333333'),
  sellAmount: '1000000000000000000',
  buyAmount: '2000000000',
  validTo: 1_900_000_000,
  // Replaced by the WrapperAndAppData envelope; present only to satisfy `UnsignedOrder`.
  appData: NESTED_APP_DATA,
  feeAmount: '0',
  kind: OrderKind.SELL,
  partiallyFillable: false,
  sellTokenBalance: SellTokenSource.ERC20,
  buyTokenBalance: BuyTokenDestination.ERC20,
}

describe('encodeStructDefinition', () => {
  it('renders a struct exactly as the Solidity type string does', () => {
    expect(encodeStructDefinition('SwapParams', CONFIG.types.SwapParams)).toBe(PARAMS_TYPE_STRING)
  })
})

describe('baseTypeOf', () => {
  it.each([
    ['Foo', 'Foo'],
    ['Foo[]', 'Foo'],
    ['Foo[3]', 'Foo'],
    ['Foo[3][]', 'Foo'],
    ['uint256[2]', 'uint256'],
  ])('strips array suffixes from %s', (input, expected) => {
    expect(baseTypeOf(input)).toBe(expected)
  })
})

describe('collectReferencedTypes', () => {
  it('returns an empty list for a flat struct', () => {
    expect(collectReferencedTypes('SwapParams', CONFIG.types)).toEqual([])
  })

  it('walks nested structs and arrays of structs', () => {
    const types = {
      Root: [
        { name: 'a', type: 'Leaf' },
        { name: 'b', type: 'Branch[]' },
      ],
      Branch: [{ name: 'c', type: 'Leaf[2]' }],
      Leaf: [{ name: 'value', type: 'uint256' }],
    }

    expect(collectReferencedTypes('Root', types).sort()).toEqual(['Branch', 'Leaf'])
  })

  it('tolerates a struct that references itself without looping forever', () => {
    const types = {
      Root: [
        { name: 'self', type: 'Root[]' },
        { name: 'leaf', type: 'Leaf' },
      ],
      Leaf: [{ name: 'value', type: 'uint256' }],
    }

    expect(collectReferencedTypes('Root', types)).toEqual(['Leaf'])
  })

  it('throws when a transitively referenced struct is undefined', () => {
    const types = { Root: [{ name: 'a', type: 'Missing' }], Missing: [{ name: 'b', type: 'Nope' }] }

    expect(() => collectReferencedTypes('Root', types)).toThrow(AuthWrapperConfigError)
    expect(() => collectReferencedTypes('Root', types)).toThrow('Type "Nope" is not a supported EIP-712 type')
  })

  /** EIP-712 has no bare `uint`/`int` aliases, so they must not pass as primitives. */
  it.each(['uint', 'int', 'bytes33', 'uint7'])('treats %s as an undefined struct reference', (type) => {
    expect(() => collectReferencedTypes('Root', { Root: [{ name: 'a', type }] })).toThrow(
      `Type "${type}" is not a supported EIP-712 type`,
    )
  })

  it.each(['address', 'bool', 'string', 'bytes', 'bytes32', 'uint256', 'int8', 'uint128[]', 'bytes1[2]'])(
    'accepts the primitive %s',
    (type) => {
      expect(collectReferencedTypes('Root', { Root: [{ name: 'a', type }] })).toEqual([])
    },
  )
})

describe('buildWrapperAndAppDataType', () => {
  it('matches the Solidity WRAPPER_AND_APP_DATA_TYPE_HASH', () => {
    const { wrapperAndAppDataTypeHash, referencedTypes } = buildWrapperAndAppDataType(CONFIG)

    expect(referencedTypes).toEqual(['SwapParams'])
    expect(wrapperAndAppDataTypeHash).toBe(keccak256(toHex(WRAPPER_AND_APP_DATA_TYPE_STRING)))
  })

  /**
   * The envelope hash is canonical for any naming (the primary type always leads), so
   * it is reproduced even for `BasicAuthWrapper`, whose struct name is rejected later
   * by `resolveAuthWrapper` for the separate order-type-hash reason.
   */
  it('reproduces the BasicAuthWrapper example verbatim', () => {
    const basicConfig: CowAuthWrapperConfig = {
      ...CONFIG,
      paramsType: 'WrapperParams',
      types: { WrapperParams: CONFIG.types.SwapParams },
    }

    expect(buildWrapperAndAppDataType(basicConfig).wrapperAndAppDataTypeHash).toBe(
      keccak256(toHex(SOL_BASIC_WRAPPER_AND_APP_DATA_TYPE_STRING)),
    )
  })

  it('orders referenced struct definitions alphabetically', () => {
    const config: CowAuthWrapperConfig = {
      ...CONFIG,
      paramsType: 'MetaOrder',
      types: {
        MetaOrder: [
          { name: 'safeTx', type: 'SafeTx' },
          { name: 'nonce', type: 'uint256' },
        ],
        SafeTx: [{ name: 'to', type: 'address' }],
      },
      params: { safeTx: { to: OWNER }, nonce: 7n },
    }

    const expected = keccak256(
      toHex(
        'WrapperAndAppData(bytes32 nestedAppData,MetaOrder wrapperData)' +
          'MetaOrder(SafeTx safeTx,uint256 nonce)' +
          'SafeTx(address to)',
      ),
    )

    expect(buildWrapperAndAppDataType(config).wrapperAndAppDataTypeHash).toBe(expected)
  })
})

describe('resolveAuthWrapper', () => {
  it('checksums the wrapper address', () => {
    expect(resolveAuthWrapper({ ...CONFIG, address: WRAPPER_ADDRESS.toLowerCase() }).address).toBe(WRAPPER_ADDRESS)
  })

  it('exposes Order and WrapperAndAppData alongside the integrator structs', () => {
    const resolved = resolveAuthWrapper(CONFIG)

    expect(Object.keys(resolved.orderTypes).sort()).toEqual(['Order', 'SwapParams', 'WrapperAndAppData'])
    expect(Object.keys(resolved.paramsTypes)).toEqual(['SwapParams'])
    expect(resolved.orderTypes.WrapperAndAppData).toEqual([
      { name: 'nestedAppData', type: 'bytes32' },
      { name: 'wrapperData', type: 'SwapParams' },
    ])
  })

  /**
   * `BasicAuthWrapper` in `bundles-template` names its struct `WrapperParams`, which
   * sorts after `WrapperAndAppData`. Its on-chain order type hash therefore is not the
   * canonical EIP-712 one, and no wallet could produce a matching signature.
   */
  it.each(['WrapperParams', 'ZParams'])('rejects the non-canonical struct name %s', (name) => {
    const config: CowAuthWrapperConfig = {
      ...CONFIG,
      paramsType: name,
      types: { [name]: CONFIG.types.SwapParams },
    }

    expect(() => resolveAuthWrapper(config)).toThrow(AuthWrapperConfigError)
    expect(() => resolveAuthWrapper(config)).toThrow('must sort alphabetically before "WrapperAndAppData"')
  })

  it('rejects a nested struct that sorts after WrapperAndAppData', () => {
    const config: CowAuthWrapperConfig = {
      ...CONFIG,
      paramsType: 'MetaOrder',
      types: {
        MetaOrder: [{ name: 'nested', type: 'ZLeaf' }],
        ZLeaf: [{ name: 'value', type: 'uint256' }],
      },
      params: { nested: { value: 1n } },
    }

    expect(() => resolveAuthWrapper(config)).toThrow('"ZLeaf"')
  })

  it.each([
    [{ address: 'not-an-address' }, 'is not a valid address'],
    [{ paramsType: '0Bad' }, '"paramsType" must be a valid struct name'],
    [{ paramsField: 'not a field' }, '"paramsField" must be a valid field name'],
    [{ paramsField: 'nestedAppData' }, 'must not be "nestedAppData"'],
    [{ paramsType: 'Absent', types: { Other: [{ name: 'a', type: 'uint256' }] } }, 'must define the params struct'],
  ])('rejects %o', (override, message) => {
    expect(() => resolveAuthWrapper({ ...CONFIG, ...override } as CowAuthWrapperConfig)).toThrow(message)
  })

  it.each(['Order', 'WrapperAndAppData'])('rejects a redefinition of the reserved struct %s', (reserved) => {
    const config = { ...CONFIG, types: { ...CONFIG.types, [reserved]: [{ name: 'a', type: 'uint256' }] } }

    expect(() => resolveAuthWrapper(config)).toThrow(`must not redefine the reserved struct "${reserved}"`)
  })

  it('rejects an empty struct', () => {
    expect(() => resolveAuthWrapper({ ...CONFIG, types: { ...CONFIG.types, Empty: [] } })).toThrow(
      'must declare at least one field',
    )
  })

  it('rejects an invalid struct name', () => {
    const config = { ...CONFIG, types: { ...CONFIG.types, '1Bad': [{ name: 'a', type: 'uint256' }] } }

    expect(() => resolveAuthWrapper(config)).toThrow('is not a valid struct name')
  })

  it.each([[{ name: '', type: 'uint256' }], [{ name: 'a', type: '' }]])(
    'rejects the invalid field definition %o',
    (field) => {
      const config = { ...CONFIG, types: { ...CONFIG.types, Bad: [field] } } as CowAuthWrapperConfig

      expect(() => resolveAuthWrapper(config)).toThrow('has an invalid field definition')
    },
  )

  /**
   * Type definitions alone do not prove the config works: the params still have to hash
   * and ABI-encode. Catching that here means the integrator hears about it at load time
   * rather than the user hearing about it mid-trade.
   */
  it.each([
    ['a missing field', {}],
    ['a malformed address', { target: 'not-an-address' }],
    ['a wrongly-typed value', { target: 42 }],
  ])('rejects params with %s', (_label, params) => {
    expect(() => resolveAuthWrapper({ ...CONFIG, params })).toThrow(AuthWrapperConfigError)
    expect(() => resolveAuthWrapper({ ...CONFIG, params })).toThrow('"params" do not match the declared "types"')
  })

  it('accepts params for a nested struct', () => {
    const config: CowAuthWrapperConfig = {
      ...CONFIG,
      paramsType: 'MetaOrder',
      types: {
        MetaOrder: [{ name: 'safeTx', type: 'SafeTx' }],
        SafeTx: [{ name: 'to', type: 'address' }],
      },
      params: { safeTx: { to: OWNER } },
    }

    expect(resolveAuthWrapper(config).paramsTypes).toEqual(config.types)
  })
})

describe('computeOrderAppData', () => {
  /** Mirrors `CowAuthWrapperIntegrationTest._appDataHashes`. */
  it('matches the hash the Solidity integration test builds by hand', () => {
    const wrapper = resolveAuthWrapper(CONFIG)

    const wrapperParamsHash = keccak256(
      encodeAbiParameters(parseAbiParameters('bytes32, address, uint128, bytes32'), [
        keccak256(toHex(PARAMS_TYPE_STRING)),
        OWNER,
        42_000n,
        keccak256(toHex('integration')),
      ]),
    )
    const expected = keccak256(
      concatHex([keccak256(toHex(WRAPPER_AND_APP_DATA_TYPE_STRING)), NESTED_APP_DATA, wrapperParamsHash]),
    )

    expect(hashWrapperParams(wrapper)).toBe(wrapperParamsHash)
    expect(computeOrderAppData(wrapper, NESTED_APP_DATA)).toBe(expected)
  })

  it('agrees with the part-wise construction used on-chain', () => {
    const wrapper = resolveAuthWrapper(CONFIG)

    expect(computeOrderAppDataFromParts(wrapper, NESTED_APP_DATA)).toBe(computeOrderAppData(wrapper, NESTED_APP_DATA))
  })

  it('changes when any param changes, so params are bound to the order', () => {
    const base = computeOrderAppData(resolveAuthWrapper(CONFIG), NESTED_APP_DATA)
    const tweaked = computeOrderAppData(
      resolveAuthWrapper({ ...CONFIG, params: { ...CONFIG.params, amount: 42_001n } }),
      NESTED_APP_DATA,
    )

    expect(tweaked).not.toBe(base)
  })

  it('changes when the nested app data changes', () => {
    const wrapper = resolveAuthWrapper(CONFIG)

    expect(computeOrderAppData(wrapper, keccak256(toHex('other')))).not.toBe(
      computeOrderAppData(wrapper, NESTED_APP_DATA),
    )
  })
})

describe('encodeWrapperParams', () => {
  it('produces abi.encode(SwapParams)', () => {
    const expected = encodeAbiParameters(
      [
        {
          name: 'SwapParams',
          type: 'tuple',
          components: [
            { name: 'target', type: 'address' },
            { name: 'amount', type: 'uint128' },
            { name: 'label', type: 'string' },
          ],
        },
      ],
      [{ target: OWNER, amount: 42_000n, label: 'integration' }],
    )

    expect(encodeWrapperParams(resolveAuthWrapper(CONFIG))).toBe(expected)
  })

  it('encodes nested structs and struct arrays as tuples', () => {
    const config: CowAuthWrapperConfig = {
      ...CONFIG,
      paramsType: 'MetaOrder',
      types: {
        MetaOrder: [
          { name: 'safeTxs', type: 'SafeTx[]' },
          { name: 'nonce', type: 'uint256' },
        ],
        SafeTx: [{ name: 'to', type: 'address' }],
      },
      params: { safeTxs: [{ to: OWNER }], nonce: 7n },
    }

    const expected = encodeAbiParameters(
      [
        {
          name: 'MetaOrder',
          type: 'tuple',
          components: [
            { name: 'safeTxs', type: 'tuple[]', components: [{ name: 'to', type: 'address' }] },
            { name: 'nonce', type: 'uint256' },
          ],
        },
      ],
      [{ safeTxs: [{ to: OWNER }], nonce: 7n }],
    )

    expect(encodeWrapperParams(resolveAuthWrapper(config))).toBe(expected)
  })
})

describe('buildWrapperOrderTypedData', () => {
  const wrapper = resolveAuthWrapper(CONFIG)

  it('builds the domain CowAuthLibrary.computeDomainSeparator hashes', () => {
    expect(buildWrapperDomain(wrapper, CHAIN_ID)).toEqual({
      name: 'CowAuthWrapper',
      version: '1',
      chainId: CHAIN_ID,
      verifyingContract: WRAPPER_ADDRESS,
    })
  })

  /**
   * Reproduces `CowAuthWrapper._computeOrderDigests` end to end: the domain separator
   * from `CowAuthLibrary`, the order type hash assembled the way the constructor does
   * (`ORDER_TYPE_STRING ‖ referencedTypeDefs ‖ wrapperStructDef`), and the struct hash
   * over the 384-byte `orderData` — then checks that viem's `hashTypedData`, i.e. what
   * the wallet actually signs, lands on the same digest.
   */
  it('produces the digest the contract recomputes on-chain', () => {
    const typedData = buildWrapperOrderTypedData(wrapper, CHAIN_ID, ORDER, NESTED_APP_DATA)

    const domainSeparator = keccak256(
      encodeAbiParameters(parseAbiParameters('bytes32, bytes32, bytes32, uint256, address'), [
        keccak256(toHex(SOL_DOMAIN_TYPE_STRING)),
        keccak256(toHex('CowAuthWrapper')),
        keccak256(toHex('1')),
        BigInt(CHAIN_ID),
        WRAPPER_ADDRESS,
      ]),
    )

    const orderTypeHash = keccak256(
      toHex(
        SOL_ORDER_TYPE_STRING + PARAMS_TYPE_STRING + 'WrapperAndAppData(bytes32 nestedAppData,SwapParams wrapperData)',
      ),
    )

    // The 12 words of `orderData`, with dynamic fields pre-hashed per EIP-712.
    const orderData = encodeAbiParameters(
      parseAbiParameters(
        'address, address, address, uint256, uint256, uint32, bytes32, uint256, bytes32, bool, bytes32, bytes32',
      ),
      [
        ORDER.sellToken,
        ORDER.buyToken,
        ORDER.receiver,
        BigInt(ORDER.sellAmount),
        BigInt(ORDER.buyAmount),
        ORDER.validTo,
        computeOrderAppData(wrapper, NESTED_APP_DATA),
        BigInt(ORDER.feeAmount),
        keccak256(toHex(ORDER.kind)),
        ORDER.partiallyFillable,
        keccak256(toHex(ORDER.sellTokenBalance)),
        keccak256(toHex(ORDER.buyTokenBalance)),
      ],
    )
    expect((orderData.length - 2) / 2).toBe(384)

    const structHash = keccak256(concatHex([orderTypeHash, orderData]))
    const expectedDigest: Hex = keccak256(concatHex(['0x1901', domainSeparator, structHash]))

    expect(hashTypedData(typedData)).toBe(expectedDigest)
  })

  it('places the envelope in the appData slot of the order message', () => {
    const { message } = buildWrapperOrderTypedData(wrapper, CHAIN_ID, ORDER, NESTED_APP_DATA)

    expect(message).not.toHaveProperty('appData')
    expect(message.wrapperAndAppData).toEqual({ nestedAppData: NESTED_APP_DATA, wrapperData: CONFIG.params })
  })
})
