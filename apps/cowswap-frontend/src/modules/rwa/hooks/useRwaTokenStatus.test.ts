import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import { useAnyRestrictedToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useGeoStatus } from './useGeoStatus'
import { useRwaConsentStatus } from './useRwaConsentStatus'
import { RwaTokenStatus, useRwaTokenStatus } from './useRwaTokenStatus'

jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: jest.fn() }))
jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('@cowprotocol/tokens', () => ({
  useAnyRestrictedToken: jest.fn(),
  getCountryAsKey: (country: string) => country.toUpperCase(),
}))
jest.mock('./useGeoStatus', () => ({ useGeoStatus: jest.fn() }))
jest.mock('./useRwaConsentStatus', () => ({ useRwaConsentStatus: jest.fn() }))

const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseAnyRestrictedToken = useAnyRestrictedToken as jest.MockedFunction<typeof useAnyRestrictedToken>
const mockUseGeoStatus = useGeoStatus as jest.MockedFunction<typeof useGeoStatus>
const mockUseRwaConsentStatus = useRwaConsentStatus as jest.MockedFunction<typeof useRwaConsentStatus>

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

function render(token: Token): RwaTokenStatus {
  return renderHook(() => useRwaTokenStatus({ inputCurrency: token, outputCurrency: undefined })).result.current.status
}

function restrictedInfoFor(token: Token): ReturnType<typeof useAnyRestrictedToken> {
  return {
    token: {
      chainId: token.chainId,
      address: token.address,
      decimals: token.decimals,
      symbol: token.symbol ?? '',
      name: token.name ?? '',
    },
    restrictedCountries: ['US', 'DE'],
    consentHash: 'bafkreiconsenthash',
  }
}

describe('useRwaTokenStatus', () => {
  beforeEach(() => {
    mockUseFeatureFlags.mockReturnValue({ isRwaGeoblockEnabled: true })
    mockUseWalletInfo.mockReturnValue({ account: '0xowner' } as ReturnType<typeof useWalletInfo>)
    mockUseRwaConsentStatus.mockReturnValue({ consentStatus: 'none' } as ReturnType<typeof useRwaConsentStatus>)
    mockUseGeoStatus.mockReturnValue({ country: null, isLoading: false, error: null })
  })

  describe('known location', () => {
    it('blocks a restricted country', () => {
      mockUseAnyRestrictedToken.mockReturnValue(restrictedInfoFor(SOLANA_RWA_TOKEN))
      mockUseGeoStatus.mockReturnValue({ country: 'DE', isLoading: false, error: null })

      expect(render(SOLANA_RWA_TOKEN)).toBe(RwaTokenStatus.Restricted)
    })

    it('allows an unrestricted country', () => {
      mockUseAnyRestrictedToken.mockReturnValue(restrictedInfoFor(SOLANA_RWA_TOKEN))
      mockUseGeoStatus.mockReturnValue({ country: 'BR', isLoading: false, error: null })

      expect(render(SOLANA_RWA_TOKEN)).toBe(RwaTokenStatus.Allowed)
    })
  })

  /**
   * A consent is carried in the appData document and a Solana order only references its hash, so a consent
   * collected here could never be proven against the order. Solana therefore has to fail closed where EVM
   * can fall back to asking.
   */
  describe('unknown location', () => {
    it('blocks a Solana RWA token when the lookup failed', () => {
      mockUseAnyRestrictedToken.mockReturnValue(restrictedInfoFor(SOLANA_RWA_TOKEN))
      mockUseGeoStatus.mockReturnValue({ country: null, isLoading: false, error: 'network down' })

      expect(render(SOLANA_RWA_TOKEN)).toBe(RwaTokenStatus.Restricted)
    })

    it('blocks a Solana RWA token while the lookup is still in flight', () => {
      mockUseAnyRestrictedToken.mockReturnValue(restrictedInfoFor(SOLANA_RWA_TOKEN))
      mockUseGeoStatus.mockReturnValue({ country: null, isLoading: true, error: null })

      expect(render(SOLANA_RWA_TOKEN)).toBe(RwaTokenStatus.Restricted)
    })

    it('blocks a Solana RWA token even when a consent was already signed', () => {
      mockUseAnyRestrictedToken.mockReturnValue(restrictedInfoFor(SOLANA_RWA_TOKEN))
      mockUseRwaConsentStatus.mockReturnValue({ consentStatus: 'valid' } as ReturnType<typeof useRwaConsentStatus>)

      expect(render(SOLANA_RWA_TOKEN)).toBe(RwaTokenStatus.Restricted)
    })

    it('still asks for consent on EVM', () => {
      mockUseAnyRestrictedToken.mockReturnValue(restrictedInfoFor(EVM_RWA_TOKEN))

      expect(render(EVM_RWA_TOKEN)).toBe(RwaTokenStatus.RequiredConsent)
    })

    it('accepts a signed consent on EVM', () => {
      mockUseAnyRestrictedToken.mockReturnValue(restrictedInfoFor(EVM_RWA_TOKEN))
      mockUseRwaConsentStatus.mockReturnValue({ consentStatus: 'valid' } as ReturnType<typeof useRwaConsentStatus>)

      expect(render(EVM_RWA_TOKEN)).toBe(RwaTokenStatus.ConsentIsSigned)
    })
  })

  it('allows everything while the geoblock flag is off', () => {
    mockUseFeatureFlags.mockReturnValue({ isRwaGeoblockEnabled: false })
    mockUseAnyRestrictedToken.mockReturnValue(restrictedInfoFor(SOLANA_RWA_TOKEN))
    mockUseGeoStatus.mockReturnValue({ country: 'DE', isLoading: false, error: null })

    expect(render(SOLANA_RWA_TOKEN)).toBe(RwaTokenStatus.Allowed)
  })

  it('allows a token that is not restricted at all', () => {
    mockUseAnyRestrictedToken.mockReturnValue(undefined)

    expect(render(SOLANA_RWA_TOKEN)).toBe(RwaTokenStatus.Allowed)
  })
})
