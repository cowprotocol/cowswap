import { SupportedChainId, COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from '@cowprotocol/cow-sdk'

import { Order } from '../../../api/operator'
import { Contract, Trade, Transfer } from '../../../api/tenderly'
import { buildBatchInsights } from '../../../explorer/components/TransanctionBatchGraph/batchInsights'
import { SETTLEMENT_RESIDUAL_LABEL } from '../../../explorer/components/TransanctionBatchGraph/types'
import { SingleErc20State } from '../../../state/erc20'

const USER = '0x1111111111111111111111111111111111111111'
const EXTERNAL_A = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const EXTERNAL_B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const SPECIAL_FLOW = '0x40a50cf069e992aa4536211b23f286ef88752187'
const TOKEN_A = '0x00000000000000000000000000000000000000a1'
const TOKEN_B = '0x00000000000000000000000000000000000000b1'

const MAINNET_SETTLEMENT = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET].toLowerCase()

function createTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    owner: USER,
    sellToken: TOKEN_A,
    buyToken: TOKEN_B,
    sellAmount: '1000000000000000000',
    buyAmount: '2000000000000000000',
    orderUid: 'order-uid-1',
    feeAmount: '0',
    ...overrides,
  }
}

function createTransfer(overrides: Partial<Transfer> = {}): Transfer {
  return {
    from: USER,
    to: MAINNET_SETTLEMENT,
    token: TOKEN_A,
    value: '1000000000000000000',
    ...overrides,
  }
}

function createContract(overrides: Partial<Contract> = {}): Contract {
  return {
    address: EXTERNAL_A,
    contract_name: 'UniswapV3Pool',
    ...overrides,
  }
}

function createToken(symbol: string, address: string, decimals = 18): SingleErc20State {
  return {
    address,
    symbol,
    name: symbol,
    decimals,
  } as unknown as SingleErc20State
}

function createTokens(): Record<string, SingleErc20State> {
  return {
    [TOKEN_A.toLowerCase()]: createToken('TKNA', TOKEN_A),
    [TOKEN_B.toLowerCase()]: createToken('TKNB', TOKEN_B),
  }
}

function getNonMainnetSettlement(): { chainId: SupportedChainId; address: string } {
  const entry = Object.entries(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS).find(
    ([chainId, address]) => Number(chainId) !== SupportedChainId.MAINNET && Boolean(address),
  )

  if (!entry) {
    throw new Error('No non-mainnet settlement address found in SDK constants')
  }

  return {
    chainId: Number(entry[0]) as SupportedChainId,
    address: entry[1].toLowerCase(),
  }
}

describe('buildBatchInsights', () => {
  it('uses external contract fallback label and address when metadata is missing', () => {
    const trades = [createTrade()]
    const transfers = [
      createTransfer({ from: USER, to: MAINNET_SETTLEMENT }),
      createTransfer({ from: MAINNET_SETTLEMENT, to: EXTERNAL_A, token: TOKEN_B, value: '2000000000000000000' }),
    ]

    const insights = buildBatchInsights({
      networkId: SupportedChainId.MAINNET,
      orders: undefined,
      trades,
      transfers,
      contracts: [],
      tokens: createTokens(),
      txSender: undefined,
    })

    expect(insights.dexLabel).toBe('External Contract')
    expect(insights.dexAddress).toBe(EXTERNAL_A)
  })

  it('falls back to settlement residual route when there are no external interaction addresses', () => {
    const trades = [createTrade()]
    const transfers = [
      createTransfer({ from: USER, to: MAINNET_SETTLEMENT }),
      createTransfer({ from: MAINNET_SETTLEMENT, to: USER, token: TOKEN_B, value: '2000000000000000000' }),
    ]

    const insights = buildBatchInsights({
      networkId: SupportedChainId.MAINNET,
      orders: undefined,
      trades,
      transfers,
      contracts: [],
      tokens: createTokens(),
      txSender: undefined,
    })

    expect(insights.dexLabel).toBe(SETTLEMENT_RESIDUAL_LABEL)
    expect(insights.dexAddress).toBeUndefined()
  })

  it('builds execution breakdown even when contractTrades are empty', () => {
    const trades = [createTrade()]
    const transfers = [
      createTransfer({ from: SPECIAL_FLOW, to: MAINNET_SETTLEMENT, token: TOKEN_B, value: '2000000000000000000' }),
    ]

    const insights = buildBatchInsights({
      networkId: SupportedChainId.MAINNET,
      orders: undefined,
      trades,
      transfers,
      contracts: [],
      tokens: createTokens(),
      txSender: undefined,
    })

    expect(insights.executionBreakdown).toBeDefined()
    expect(insights.executionBreakdown?.hops).toHaveLength(1)
    expect(insights.executionBreakdown?.hops[0].fromKind).toBe('special-flow')
    expect(insights.executionBreakdown?.hops[0].toKind).toBe('settlement')
  })

  it('classifies settlement addresses correctly on non-mainnet chains', () => {
    const { chainId, address: nonMainnetSettlement } = getNonMainnetSettlement()

    const trades = [createTrade()]
    const transfers = [
      createTransfer({ from: nonMainnetSettlement, to: EXTERNAL_A, token: TOKEN_A }),
      createTransfer({ from: EXTERNAL_A, to: nonMainnetSettlement, token: TOKEN_B, value: '2000000000000000000' }),
    ]

    const insights = buildBatchInsights({
      networkId: chainId,
      orders: undefined,
      trades,
      transfers,
      contracts: [createContract({ address: EXTERNAL_A, contract_name: 'CurvePool' })],
      tokens: createTokens(),
      txSender: undefined,
    })

    expect(insights.executionBreakdown?.venues.some((venue) => venue.address === nonMainnetSettlement)).toBe(false)
    expect(insights.executionBreakdown?.hops.some((hop) => hop.fromAddress === nonMainnetSettlement)).toBe(true)
    expect(insights.executionBreakdown?.hops.some((hop) => hop.fromKind === 'settlement')).toBe(true)
  })

  it('keeps hops between distinct addresses even when endpoint labels are the same', () => {
    const dexOne = '0x1000000000000000000000000000000000000001'
    const dexTwo = '0x2000000000000000000000000000000000000002'

    const trades = [createTrade()]
    const transfers = [createTransfer({ from: dexOne, to: dexTwo, token: TOKEN_A })]

    const insights = buildBatchInsights({
      networkId: SupportedChainId.MAINNET,
      orders: undefined,
      trades,
      transfers,
      contracts: [
        createContract({ address: dexOne, contract_name: 'UniswapV3Pool' }),
        createContract({ address: dexTwo, contract_name: 'UniswapV3Pool' }),
      ],
      tokens: createTokens(),
      txSender: undefined,
    })

    expect(insights.executionBreakdown?.hops).toHaveLength(1)
    expect(insights.executionBreakdown?.hops[0].fromAddress).toBe(dexOne)
    expect(insights.executionBreakdown?.hops[0].toAddress).toBe(dexTwo)
    expect(insights.executionBreakdown?.hops[0].fromLabel).toBe('Uniswap V3')
    expect(insights.executionBreakdown?.hops[0].toLabel).toBe('Uniswap V3')
  })

  it('counts surplus orders safely when orders are undefined', () => {
    const insights = buildBatchInsights({
      networkId: SupportedChainId.MAINNET,
      orders: undefined as unknown as Order[],
      trades: [createTrade()],
      transfers: [createTransfer({ from: USER, to: MAINNET_SETTLEMENT })],
      contracts: [],
      tokens: createTokens(),
      txSender: undefined,
    })

    expect(insights.surplusOrdersCount).toBe(0)
  })

  it('derives dexAddress from first interaction when dex contract is unresolved', () => {
    const trades = [createTrade()]
    const transfers = [
      createTransfer({ from: USER, to: MAINNET_SETTLEMENT }),
      createTransfer({ from: MAINNET_SETTLEMENT, to: EXTERNAL_A, token: TOKEN_A }),
      createTransfer({ from: MAINNET_SETTLEMENT, to: EXTERNAL_B, token: TOKEN_B, value: '500000000000000000' }),
    ]

    const insights = buildBatchInsights({
      networkId: SupportedChainId.MAINNET,
      orders: undefined,
      trades,
      transfers,
      contracts: [
        createContract({ address: '0xcccccccccccccccccccccccccccccccccccccccc', contract_name: 'ERC20Token' }),
      ],
      tokens: createTokens(),
      txSender: undefined,
    })

    expect(insights.dexAddress).toBe(EXTERNAL_A)
  })
})
