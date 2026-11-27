import { SOLANA_TOKEN_LIST_URL, USDC, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
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
  getDefaultTokenPair,
  getSolanaDappModeNotice,
  isTradeTypeAvailableOnChain,
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

  it('keeps the default pair on a chain where COW is deployed', () => {
    expect(getDefaultTokenPair(SupportedChainId.MAINNET)).toEqual({
      sellToken: DEFAULT_CONFIGURATOR_FORM_VALUES.sellToken,
      buyToken: DEFAULT_CONFIGURATOR_FORM_VALUES.buyToken,
    })
  })

  it('falls back to wrapped native / USDC where COW has no deployment', () => {
    const { sellToken, buyToken } = getDefaultTokenPair(SupportedChainId.SOLANA)

    expect(sellToken).toBe(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)
    expect(buyToken).toBe(USDC[SupportedChainId.SOLANA]?.address)
    expect(buyToken).not.toBe(DEFAULT_CONFIGURATOR_FORM_VALUES.buyToken)
  })

  it('covers every chain the configurator can select', () => {
    const chainIds = Object.values(SupportedChainId).filter((value): value is SupportedChainId =>
      Number.isInteger(value),
    )

    const incomplete = chainIds.filter((chainId) => {
      const { sellToken, buyToken } = getDefaultTokenPair(chainId)

      return !sellToken || !buyToken
    })

    expect(incomplete).toEqual([])
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

  it('adds a new list switched off when the persisted config selects none', () => {
    const allSwitchedOff = DEFAULT_TOKEN_LISTS.filter(({ url }) => url !== SOLANA_TOKEN_LIST_URL).map((list) => ({
      ...list,
      enabled: false,
      enabledForSell: false,
      enabledForBuy: false,
    }))

    const { tokenListUrls } = resolveConfiguratorFormValues({ tokenListUrls: allSwitchedOff })

    expect(tokenListUrls.map(({ url }) => url)).toContain(SOLANA_TOKEN_LIST_URL)
    expect(tokenListUrls.filter(({ enabled }) => enabled)).toEqual([])
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

  it('drops the trade types the effective chain cannot run', () => {
    const state = buildConfiguratorState({
      formValues: {
        ...DEFAULT_CONFIGURATOR_FORM_VALUES,
        enabledTradeTypes: [TradeType.SWAP, TradeType.LIMIT, TradeType.ADVANCED, TradeType.YIELD],
        currentTradeType: TradeType.ADVANCED,
      },
      effectiveChainId: SupportedChainId.SOLANA,
      colorPalette: DEFAULT_LIGHT_PALETTE,
      defaultPalette: DEFAULT_DARK_PALETTE,
      disableToastMessages: false,
    })

    expect(state.enabledTradeTypes).toEqual([TradeType.SWAP, TradeType.LIMIT])
    expect(state.currentTradeType).toBe(TradeType.SWAP)
  })

  it('keeps every trade type on an EVM chain', () => {
    const enabledTradeTypes = [TradeType.SWAP, TradeType.LIMIT, TradeType.ADVANCED, TradeType.YIELD]

    const state = buildConfiguratorState({
      formValues: { ...DEFAULT_CONFIGURATOR_FORM_VALUES, enabledTradeTypes, currentTradeType: TradeType.ADVANCED },
      effectiveChainId: SupportedChainId.MAINNET,
      colorPalette: DEFAULT_LIGHT_PALETTE,
      defaultPalette: DEFAULT_DARK_PALETTE,
      disableToastMessages: false,
    })

    expect(state.enabledTradeTypes).toEqual(enabledTradeTypes)
    expect(state.currentTradeType).toBe(TradeType.ADVANCED)
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

  const OPTED_IN_DAPP = { ...OPTED_IN, widgetMode: 'dapp' } as const

  it('is off in the shipped defaults, which the API docs promise', () => {
    expect(isSolanaSelectable(DEFAULT_CONFIGURATOR_FORM_VALUES)).toBe(false)
    expect(DEFAULT_CONFIGURATOR_FORM_VALUES.enableSolana).toBe(false)
  })

  it('is selectable once a standalone widget opts in', () => {
    expect(isSolanaSelectable(OPTED_IN)).toBe(true)
    expect(getSolanaDappModeNotice(OPTED_IN, false)).toBeUndefined()
    expect(getSolanaFeeNotice(OPTED_IN)).toBeUndefined()
  })

  it('is not selectable until the partner opts in, but the switch stays usable', () => {
    const values = { ...OPTED_IN, enableSolana: false }

    expect(isSolanaSelectable(values)).toBe(false)
    expect(getSolanaDappModeNotice(values, false)).toBeUndefined()
  })

  it('stays selectable with a partner fee set, and warns that Solana earns none', () => {
    const values = { ...OPTED_IN, partnerFeeBps: 50 }

    expect(isSolanaSelectable(values)).toBe(true)
    expect(getSolanaDappModeNotice(values, false)).toBeUndefined()
    expect(getSolanaFeeNotice(values)).toEqual(expect.any(String))
  })

  it('tells a dapp-mode integrator to connect a Solana wallet, while Solana stays selectable', () => {
    expect(getSolanaDappModeNotice(OPTED_IN_DAPP, false)).toEqual(expect.any(String))
    expect(isSolanaSelectable(OPTED_IN_DAPP)).toBe(true)
  })

  it('drops the notice in dapp mode once the host wallet is connected', () => {
    expect(getSolanaDappModeNotice(OPTED_IN_DAPP, true)).toBeUndefined()
  })
})
