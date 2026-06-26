import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_CONFIGURATOR_FORM_VALUES, DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE } from './configurator.constants'
import {
  buildConfiguratorState,
  getDefaultCustomColorsByTheme,
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

  it('returns defaults when no value is persisted', () => {
    expect(resolveConfiguratorFormValues(null)).toEqual(DEFAULT_CONFIGURATOR_FORM_VALUES)
    expect(resolveConfiguratorCustomColorsByTheme(null)).toEqual(getDefaultCustomColorsByTheme())
  })

  it('merges persisted form values with defaults', () => {
    const resolved = resolveConfiguratorFormValues({ appCode: 'dedicated-key-app' })

    expect(resolved.appCode).toBe('dedicated-key-app')
    expect(resolved.theme).toBe(DEFAULT_CONFIGURATOR_FORM_VALUES.theme)
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
      },
      effectiveChainId: SupportedChainId.ARBITRUM_ONE,
      colorPalette: DEFAULT_LIGHT_PALETTE,
      defaultPalette: DEFAULT_DARK_PALETTE,
      disableToastMessages: false,
    })

    expect(state.chainId).toBe(SupportedChainId.ARBITRUM_ONE)
    expect(state.partnerFeeRecipient).toBe(ARBITRUM_PARTNER_FEE_RECIPIENT)
    expect(state.partnerFeeRecipient).not.toBe(MAINNET_PARTNER_FEE_RECIPIENT)
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
