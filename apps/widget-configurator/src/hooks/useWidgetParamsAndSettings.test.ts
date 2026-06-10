import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TradeType } from '@cowprotocol/widget-lib'

import { renderHook } from '@testing-library/react'

import { useWidgetParams } from './useWidgetParamsAndSettings'

import {
  CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK,
  DEFAULT_CONFIGURATOR_FORM_VALUES,
  DEFAULT_LIGHT_PALETTE,
} from '../configurator.constants'
import { ConfiguratorFormValues, ConfiguratorState } from '../configurator.types'
import { buildConfiguratorState } from '../configurator.utils'

const MAINNET_PARTNER_FEE_RECIPIENT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

jest.mock('@cowprotocol/common-const', () => {
  const actual = jest.requireActual<typeof import('@cowprotocol/common-const')>('@cowprotocol/common-const')
  const { SupportedChainId: ChainId } =
    jest.requireActual<typeof import('@cowprotocol/cow-sdk')>('@cowprotocol/cow-sdk')

  return {
    ...actual,
    DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK: {
      ...actual.DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK,
      [ChainId.MAINNET]: MAINNET_PARTNER_FEE_RECIPIENT,
    },
  }
})

function createConfiguratorState(overrides: Partial<ConfiguratorFormValues> = {}): ConfiguratorState {
  return buildConfiguratorState({
    formValues: { ...DEFAULT_CONFIGURATOR_FORM_VALUES, ...overrides },
    effectiveChainId: SupportedChainId.MAINNET,
    colorPalette: DEFAULT_LIGHT_PALETTE,
    defaultPalette: DEFAULT_LIGHT_PALETTE,
    disableToastMessages: false,
  })
}

describe('useWidgetParams', () => {
  it('returns null params when configurator state is null', () => {
    const { result } = renderHook(({ state }) => useWidgetParams(state), {
      initialProps: { state: null as ConfiguratorState | null },
    })

    expect(result.current[0]).toBeNull()
  })

  it('uses the preview appCode fallback when appCode is blank', () => {
    const state = createConfiguratorState({ appCode: '   ' })
    const { result } = renderHook(({ state }) => useWidgetParams(state), { initialProps: { state } })

    expect(result.current[0]?.appCode).toBe(CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK)
  })

  it('omits partnerFee when partnerFeeBps is zero', () => {
    const state = createConfiguratorState({ partnerFeeBps: 0 })
    const { result } = renderHook(({ state }) => useWidgetParams(state), { initialProps: { state } })

    expect(result.current[0]?.partnerFee).toBeUndefined()
  })

  it('maps partnerFee when partnerFeeBps is positive', () => {
    const state = createConfiguratorState({ partnerFeeBps: 50 })
    const { result } = renderHook(({ state }) => useWidgetParams(state), { initialProps: { state } })

    expect(result.current[0]?.partnerFee).toEqual({
      bps: 50,
      recipient: MAINNET_PARTNER_FEE_RECIPIENT,
    })
  })

  describe('forcedOrderDeadline', () => {
    it('returns the global scalar when no per-trade deadlines are set', () => {
      const state = createConfiguratorState({
        deadline: 30,
        swapDeadline: undefined,
        limitDeadline: undefined,
        advancedDeadline: undefined,
      })
      const { result } = renderHook(({ state }) => useWidgetParams(state), { initialProps: { state } })

      expect(result.current[0]?.forcedOrderDeadline).toBe(30)
    })

    it('falls back to the global deadline for unset per-trade fields', () => {
      const state = createConfiguratorState({
        deadline: 30,
        swapDeadline: 5,
        limitDeadline: undefined,
        advancedDeadline: undefined,
      })
      const { result } = renderHook(({ state }) => useWidgetParams(state), { initialProps: { state } })

      expect(result.current[0]?.forcedOrderDeadline).toEqual({
        [TradeType.SWAP]: 5,
        [TradeType.LIMIT]: 30,
        [TradeType.ADVANCED]: 30,
      })
    })

    it('uses per-trade values when all are explicitly set', () => {
      const state = createConfiguratorState({
        deadline: 30,
        swapDeadline: 5,
        limitDeadline: 10,
        advancedDeadline: 15,
      })
      const { result } = renderHook(({ state }) => useWidgetParams(state), { initialProps: { state } })

      expect(result.current[0]?.forcedOrderDeadline).toEqual({
        [TradeType.SWAP]: 5,
        [TradeType.LIMIT]: 10,
        [TradeType.ADVANCED]: 15,
      })
    })
  })
})
