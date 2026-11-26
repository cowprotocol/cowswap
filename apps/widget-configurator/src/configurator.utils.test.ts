import { SOLANA_TOKEN_LIST_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TradeType } from '@cowprotocol/widget-lib'

import {
  DEFAULT_CONFIGURATOR_FORM_VALUES,
  DEFAULT_DARK_PALETTE,
  DEFAULT_LIGHT_PALETTE,
  DEFAULT_TOKEN_LISTS,
} from './configurator.constants'
import {
  buildConfiguratorState,
  getCrossChainBlockedReason,
  getDefaultCustomColorsByTheme,
  isTradeTypeAvailableOnChain,
  getSolanaBlockedReason,
  getSolanaFeeNotice,
  isSolanaSelectable,
  resolveConfiguratorCustomColorsByTheme,
  resolveConfiguratorFormValues,
} from './configurator.utils'

const MAINNET_PARTNER_FEE_RECIPIENT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const ARBITRUM_PARTNER_FEE_RECIPIENT = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

jest.mock('@cowprotocol/common-const', () => {
  const actual = jest.requireActual<typeof import('@cowprotocol/common-const')>('@cowprotocol/common-const')
  const { SupportedChainId: ChainId } =
    jest.requireActual<typeof import('@cowprotocol/cow-sdk')>('@cowprotocol/cow-sdk')

  return {
    ...actual,
    DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK: {
      ...actual.DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK,
      [ChainId.MAINNET]: MAINNET_PARTNER_FEE_RECIPIENT,
      [ChainId.ARBITRUM_ONE]: ARBITRUM_PARTNER_FEE_RECIPIENT,
    },
  }
})

describe('configurator.utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('blocks advanced and yield on Solana, which cannot run them', () => {
    expect(isTradeTypeAvailableOnChain(TradeType.ADVANCED, SupportedChainId.SOLANA)).toBe(false)
    expect(isTradeTypeAvailableOnChain(TradeType.YIELD, SupportedChainId.SOLANA)).toBe(false)
  })

  it('keeps swap and limit available on Solana', () => {
    expect(isTradeTypeAvailableOnChain(TradeType.SWAP, SupportedChainId.SOLANA)).toBe(true)
    expect(isTradeTypeAvailableOnChain(TradeType.LIMIT, SupportedChainId.SOLANA)).toBe(true)
  })

  it('leaves every trade type available on EVM chains', () => {
    for (const tradeType of Object.values(TradeType)) {
      expect(isTradeTypeAvailableOnChain(tradeType, SupportedChainId.MAINNET)).toBe(true)
    }
  })

  it('ships the Solana token list enabled, which the widget needs to show any token there', () => {
    const solanaList = DEFAULT_TOKEN_LISTS.find((list) => list.url === SOLANA_TOKEN_LIST_URL)

    expect(solanaList?.enabled).toBe(true)
  })

  it('adds token lists introduced after a config was persisted', () => {
    const staleTokenLists = [{ url: 'https://app.tryroll.com/tokens.json', enabled: true }]

    const { tokenListUrls } = resolveConfiguratorFormValues({ tokenListUrls: staleTokenLists })

    expect(tokenListUrls.map(({ url }) => url)).toContain(SOLANA_TOKEN_LIST_URL)
  })

  it('leaves the flags a user already chose untouched when adding new lists', () => {
    const staleTokenLists = [
      { url: 'https://app.tryroll.com/tokens.json', enabled: true, enabledForSell: true, enabledForBuy: false },
    ]

    const { tokenListUrls } = resolveConfiguratorFormValues({ tokenListUrls: staleTokenLists })

    expect(tokenListUrls[0]).toEqual(staleTokenLists[0])
  })

  it('blocks cross-chain swaps while Solana is the selected network', () => {
    const values = { ...DEFAULT_CONFIGURATOR_FORM_VALUES, chainId: SupportedChainId.SOLANA }

    expect(getCrossChainBlockedReason(values)).toEqual(expect.any(String))
  })

  it('leaves cross-chain swaps alone on EVM chains', () => {
    const values = { ...DEFAULT_CONFIGURATOR_FORM_VALUES, chainId: SupportedChainId.MAINNET }

    expect(getCrossChainBlockedReason(values)).toBeUndefined()
  })

  it('returns defaults when no value is persisted', () => {
    expect(resolveConfiguratorFormValues(null)).toEqual(DEFAULT_CONFIGURATOR_FORM_VALUES)
    expect(resolveConfiguratorCustomColorsByTheme(null)).toEqual(getDefaultCustomColorsByTheme())
  })

  it('merges persisted form values with defaults', () => {
    const resolved = resolveConfiguratorFormValues({ appCode: 'dedicated-key-app' })

    expect(resolved.appCode).toBe('dedicated-key-app')
    expect(resolved.theme).toBe(DEFAULT_CONFIGURATOR_FORM_VALUES.theme)
    expect(resolved.disableWindowOpen).toBe(false)
  })

  it('merges persisted custom colors with defaults', () => {
    const defaults = getDefaultCustomColorsByTheme()
    const resolved = resolveConfiguratorCustomColorsByTheme({
      light: { ...defaults.light, primary: '#111111' },
      dark: defaults.dark,
    })

    expect(resolved.light.primary).toBe('#111111')
    expect(resolved.dark).toEqual(defaults.dark)
  })

  it('derives partnerFeeRecipient from effectiveChainId rather than persisted chainId', () => {
    const state = buildConfiguratorState({
      formValues: {
        ...DEFAULT_CONFIGURATOR_FORM_VALUES,
        chainId: SupportedChainId.MAINNET,
        disableWindowOpen: true,
      },
      effectiveChainId: SupportedChainId.ARBITRUM_ONE,
      colorPalette: DEFAULT_LIGHT_PALETTE,
      defaultPalette: DEFAULT_DARK_PALETTE,
      disableToastMessages: false,
    })

    expect(state.chainId).toBe(SupportedChainId.ARBITRUM_ONE)
    expect(state.partnerFeeRecipient).toBe(ARBITRUM_PARTNER_FEE_RECIPIENT)
    expect(state.partnerFeeRecipient).not.toBe(MAINNET_PARTNER_FEE_RECIPIENT)
    expect(state.disableWindowOpen).toBe(true)
  })

  it('throws when effectiveChainId is undefined', () => {
    expect(() =>
      buildConfiguratorState({
        formValues: DEFAULT_CONFIGURATOR_FORM_VALUES,
        effectiveChainId: undefined as unknown as SupportedChainId,
        colorPalette: DEFAULT_LIGHT_PALETTE,
        defaultPalette: DEFAULT_DARK_PALETTE,
        disableToastMessages: false,
      }),
    ).toThrow('buildConfiguratorState requires effectiveChainId')
  })
})

describe('Solana availability', () => {
  const OPTED_IN = {
    ...DEFAULT_CONFIGURATOR_FORM_VALUES,
    enableSolana: true,
    widgetMode: 'standalone',
    partnerFeeBps: 0,
  } as const

  it('is selectable once a standalone widget opts in', () => {
    expect(isSolanaSelectable(OPTED_IN)).toBe(true)
    expect(getSolanaBlockedReason(OPTED_IN)).toBeUndefined()
    expect(getSolanaFeeNotice(OPTED_IN)).toBeUndefined()
  })

  it('is not selectable until the partner opts in, but the switch stays usable', () => {
    const values = { ...OPTED_IN, enableSolana: false }

    expect(isSolanaSelectable(values)).toBe(false)
    expect(getSolanaBlockedReason(values)).toBeUndefined()
  })

  it('stays selectable with a partner fee set, and warns that Solana earns none', () => {
    const values = { ...OPTED_IN, partnerFeeBps: 50 }

    expect(isSolanaSelectable(values)).toBe(true)
    expect(getSolanaBlockedReason(values)).toBeUndefined()
    expect(getSolanaFeeNotice(values)).toEqual(expect.any(String))
  })

  it('blocks the opt-in in dapp mode', () => {
    const values = { ...OPTED_IN, widgetMode: 'dapp' } as const

    expect(getSolanaBlockedReason(values)).toEqual(expect.any(String))
    expect(isSolanaSelectable(values)).toBe(false)
  })
})
