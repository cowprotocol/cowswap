import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import { useIsRwaToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useGeoStatus } from './useGeoStatus'
import { useRwaConsentStatus } from './useRwaConsentStatus'
import { RwaTokenStatus, RwaTokenStatusResult, useRwaTokenStatus } from './useRwaTokenStatus'
import { useTokenRestriction } from './useTokenRestriction'

import { TokenRestriction } from '../api/fetchTokenRestriction'

jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: jest.fn() }))
jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('@cowprotocol/tokens', () => ({ useIsRwaToken: jest.fn() }))
jest.mock('./useGeoStatus', () => ({ useGeoStatus: jest.fn() }))
jest.mock('./useRwaConsentStatus', () => ({ useRwaConsentStatus: jest.fn() }))
jest.mock('./useTokenRestriction', () => ({ useTokenRestriction: jest.fn() }))

const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseIsRwaToken = useIsRwaToken as jest.MockedFunction<typeof useIsRwaToken>
const mockUseGeoStatus = useGeoStatus as jest.MockedFunction<typeof useGeoStatus>
const mockUseRwaConsentStatus = useRwaConsentStatus as jest.MockedFunction<typeof useRwaConsentStatus>
const mockUseTokenRestriction = useTokenRestriction as jest.MockedFunction<typeof useTokenRestriction>

const SOLANA_RWA_TOKEN = new Token(
  SupportedChainId.SOLANA,
  'AMC1qwR9KhiyrQBRPrxnfo4JfMeMZqEBvt5tgTytNNoc',
  6,
  'AMC',
  'AMC Entertainment',
)

const EVM_RWA_TOKEN = new Token(
  SupportedChainId.MAINNET,
  '0x1234567890123456789012345678901234567890',
  18,
  'AMCx',
  'AMC xStock',
)

const EVM_OTHER_TOKEN = new Token(SupportedChainId.MAINNET, '0x2234567890123456789012345678901234567890', 6, 'USDC')

const RESTRICTED: TokenRestriction = { restricted: true, tokenList: 'xStocks Token List' }
const NOT_RESTRICTED: TokenRestriction = { restricted: false }

function mockRestrictions(restrictions: Map<Token, TokenRestriction>): void {
  mockUseTokenRestriction.mockImplementation((token) => (token ? restrictions.get(token) : undefined))
}

function mockRwaTokens(...tokens: Token[]): void {
  mockUseIsRwaToken.mockImplementation((token) => !!token && tokens.includes(token as Token))
}

function render(inputToken: Token | undefined, outputToken?: Token): RwaTokenStatusResult {
  return renderHook(() => useRwaTokenStatus({ inputCurrency: inputToken, outputCurrency: outputToken })).result.current
}

describe('useRwaTokenStatus', () => {
  beforeEach(() => {
    mockUseFeatureFlags.mockReturnValue({ isRwaGeoblockEnabled: true })
    mockUseWalletInfo.mockReturnValue({ account: '0xowner' } as ReturnType<typeof useWalletInfo>)
    mockUseRwaConsentStatus.mockReturnValue({ consentStatus: 'none' } as ReturnType<typeof useRwaConsentStatus>)
    mockUseGeoStatus.mockReturnValue({ country: null, isLoading: false, error: null })
    mockRwaTokens(SOLANA_RWA_TOKEN, EVM_RWA_TOKEN)
    mockRestrictions(new Map())
  })

  describe('restriction known', () => {
    beforeEach(() => {
      mockUseGeoStatus.mockReturnValue({ country: 'DE', isLoading: false, error: null })
    })

    it('blocks a token the BFF reports as restricted', () => {
      mockRestrictions(new Map([[SOLANA_RWA_TOKEN, RESTRICTED]]))

      expect(render(SOLANA_RWA_TOKEN).status).toBe(RwaTokenStatus.Restricted)
    })

    it('allows an RWA token the BFF reports as not restricted', () => {
      mockRestrictions(new Map([[EVM_RWA_TOKEN, NOT_RESTRICTED]]))

      expect(render(EVM_RWA_TOKEN)).toEqual({ status: RwaTokenStatus.Allowed, rwaTokenInfo: null })
    })

    it('blocks a restricted token that is in no RWA list', () => {
      mockRwaTokens()
      mockRestrictions(new Map([[EVM_OTHER_TOKEN, RESTRICTED]]))

      expect(render(EVM_OTHER_TOKEN).status).toBe(RwaTokenStatus.Restricted)
    })

    it('blocks when the output token is restricted', () => {
      mockRestrictions(
        new Map([
          [EVM_OTHER_TOKEN, NOT_RESTRICTED],
          [EVM_RWA_TOKEN, RESTRICTED],
        ]),
      )

      const result = render(EVM_OTHER_TOKEN, EVM_RWA_TOKEN)

      expect(result.status).toBe(RwaTokenStatus.Restricted)
      expect(result.rwaTokenInfo?.token).toBe(EVM_RWA_TOKEN)
    })

    it('prefers a restricted token over one whose restriction is still unknown', () => {
      mockRestrictions(new Map([[EVM_OTHER_TOKEN, RESTRICTED]]))

      const result = render(EVM_RWA_TOKEN, EVM_OTHER_TOKEN)

      expect(result.status).toBe(RwaTokenStatus.Restricted)
      expect(result.rwaTokenInfo?.token).toBe(EVM_OTHER_TOKEN)
    })
  })

  /**
   * No answer from the BFF covers an unknown country, a request in flight and a failed request alike.
   * A consent is carried in the appData document and a Solana order only references its hash, so a consent
   * collected here could never be proven against the order. Solana therefore has to fail closed where EVM
   * can fall back to asking.
   */
  describe('restriction unknown', () => {
    it('blocks a Solana RWA token', () => {
      expect(render(SOLANA_RWA_TOKEN).status).toBe(RwaTokenStatus.Restricted)
    })

    it('blocks a Solana RWA token even when a consent was already signed', () => {
      mockUseRwaConsentStatus.mockReturnValue({ consentStatus: 'valid' } as ReturnType<typeof useRwaConsentStatus>)

      expect(render(SOLANA_RWA_TOKEN).status).toBe(RwaTokenStatus.Restricted)
    })

    it('asks for consent on EVM', () => {
      expect(render(EVM_RWA_TOKEN).status).toBe(RwaTokenStatus.RequiredConsent)
    })

    it('asks for consent on EVM while the country is known but the BFF has not answered', () => {
      mockUseGeoStatus.mockReturnValue({ country: 'BR', isLoading: false, error: null })

      expect(render(EVM_RWA_TOKEN).status).toBe(RwaTokenStatus.RequiredConsent)
    })

    it('accepts a signed consent on EVM', () => {
      mockUseRwaConsentStatus.mockReturnValue({ consentStatus: 'valid' } as ReturnType<typeof useRwaConsentStatus>)

      expect(render(EVM_RWA_TOKEN).status).toBe(RwaTokenStatus.ConsentIsSigned)
    })

    it('allows a token that is in no RWA list', () => {
      mockRwaTokens()

      expect(render(EVM_OTHER_TOKEN)).toEqual({ status: RwaTokenStatus.Allowed, rwaTokenInfo: null })
    })
  })

  it('allows everything while the geoblock flag is off', () => {
    mockUseFeatureFlags.mockReturnValue({ isRwaGeoblockEnabled: false })
    mockUseGeoStatus.mockReturnValue({ country: 'DE', isLoading: false, error: null })
    mockRestrictions(new Map([[SOLANA_RWA_TOKEN, RESTRICTED]]))

    expect(render(SOLANA_RWA_TOKEN).status).toBe(RwaTokenStatus.Allowed)
  })
})
