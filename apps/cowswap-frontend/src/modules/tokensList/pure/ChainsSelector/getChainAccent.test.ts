import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getChainAccentColors } from '@cowprotocol/ui'

import { getChainAccent } from './index'

jest.mock('@cowprotocol/ui', () => ({
  ...jest.requireActual('@cowprotocol/ui'),
  getChainAccentColors: jest.fn(),
}))

const mockGetChainAccentColors = getChainAccentColors as jest.MockedFunction<typeof getChainAccentColors>

describe('getChainAccent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return ChainAccentVars for valid chain ID', () => {
    const mockAccentConfig = {
      chainId: SupportedChainId.MAINNET,
      bgVar: '--cow-color-chain-ethereum-bg',
      borderVar: '--cow-color-chain-ethereum-border',
      accentVar: '--cow-color-chain-ethereum-accent',
      lightBg: 'rgba(98, 126, 234, 0.22)',
      darkBg: 'rgba(98, 126, 234, 0.32)',
      lightBorder: 'rgba(98, 126, 234, 0.45)',
      darkBorder: 'rgba(98, 126, 234, 0.65)',
      lightColor: '#627EEA',
      darkColor: '#627EEA',
    }

    mockGetChainAccentColors.mockReturnValue(mockAccentConfig)

    const result = getChainAccent(SupportedChainId.MAINNET)

    expect(result).toEqual({
      backgroundVar: '--cow-color-chain-ethereum-bg',
      borderVar: '--cow-color-chain-ethereum-border',
      accentColorVar: '--cow-color-chain-ethereum-accent',
    })
    expect(mockGetChainAccentColors).toHaveBeenCalledWith(SupportedChainId.MAINNET)
  })

  it('should return ChainAccentVars for different chain IDs', () => {
    const mockAccentConfig = {
      chainId: SupportedChainId.POLYGON,
      bgVar: '--cow-color-chain-polygon-bg',
      borderVar: '--cow-color-chain-polygon-border',
      accentVar: '--cow-color-chain-polygon-accent',
      lightBg: 'rgba(130, 71, 229, 0.22)',
      darkBg: 'rgba(130, 71, 229, 0.32)',
      lightBorder: 'rgba(130, 71, 229, 0.45)',
      darkBorder: 'rgba(130, 71, 229, 0.65)',
      lightColor: '#8247E5',
      darkColor: '#8247E5',
    }

    mockGetChainAccentColors.mockReturnValue(mockAccentConfig)

    const result = getChainAccent(SupportedChainId.POLYGON)

    expect(result).toEqual({
      backgroundVar: '--cow-color-chain-polygon-bg',
      borderVar: '--cow-color-chain-polygon-border',
      accentColorVar: '--cow-color-chain-polygon-accent',
    })
    expect(mockGetChainAccentColors).toHaveBeenCalledWith(SupportedChainId.POLYGON)
  })

  it('should return undefined when getChainAccentColors returns undefined', () => {
    mockGetChainAccentColors.mockReturnValue(undefined as unknown as ReturnType<typeof getChainAccentColors>)

    const result = getChainAccent(999 as SupportedChainId)

    expect(result).toBeUndefined()
    expect(mockGetChainAccentColors).toHaveBeenCalledWith(999)
  })

  it('should return undefined when getChainAccentColors returns null', () => {
    mockGetChainAccentColors.mockReturnValue(null as unknown as ReturnType<typeof getChainAccentColors>)

    const result = getChainAccent(SupportedChainId.MAINNET)

    expect(result).toBeUndefined()
  })

  it('should correctly map all ChainAccentConfig properties to ChainAccentVars', () => {
    const mockAccentConfig = {
      chainId: SupportedChainId.ARBITRUM_ONE,
      bgVar: '--cow-color-chain-arbitrum-bg',
      borderVar: '--cow-color-chain-arbitrum-border',
      accentVar: '--cow-color-chain-arbitrum-accent',
      lightBg: 'rgba(27, 74, 221, 0.22)',
      darkBg: 'rgba(27, 74, 221, 0.32)',
      lightBorder: 'rgba(27, 74, 221, 0.45)',
      darkBorder: 'rgba(27, 74, 221, 0.65)',
      lightColor: '#1B4ADD',
      darkColor: '#1B4ADD',
    }

    mockGetChainAccentColors.mockReturnValue(mockAccentConfig)

    const result = getChainAccent(SupportedChainId.ARBITRUM_ONE)

    expect(result).toBeDefined()
    expect(result).toHaveProperty('backgroundVar', mockAccentConfig.bgVar)
    expect(result).toHaveProperty('borderVar', mockAccentConfig.borderVar)
    expect(result).toHaveProperty('accentColorVar', mockAccentConfig.accentVar)
    expect(result).not.toHaveProperty('chainId')
    expect(result).not.toHaveProperty('lightBg')
    expect(result).not.toHaveProperty('darkBg')
  })

  it('should handle all supported chain IDs', () => {
    const supportedChains = [
      SupportedChainId.MAINNET,
      SupportedChainId.BNB,
      SupportedChainId.BASE,
      SupportedChainId.ARBITRUM_ONE,
      SupportedChainId.POLYGON,
      SupportedChainId.AVALANCHE,
      SupportedChainId.GNOSIS_CHAIN,
      SupportedChainId.LENS,
      SupportedChainId.SEPOLIA,
      SupportedChainId.LINEA,
      SupportedChainId.PLASMA,
    ]

    supportedChains.forEach((chainId) => {
      const mockAccentConfig = {
        chainId,
        bgVar: `--cow-color-chain-test-bg`,
        borderVar: `--cow-color-chain-test-border`,
        accentVar: `--cow-color-chain-test-accent`,
        lightBg: 'rgba(0, 0, 0, 0.22)',
        darkBg: 'rgba(0, 0, 0, 0.32)',
        lightBorder: 'rgba(0, 0, 0, 0.45)',
        darkBorder: 'rgba(0, 0, 0, 0.65)',
        lightColor: '#000000',
        darkColor: '#000000',
      }

      mockGetChainAccentColors.mockReturnValue(mockAccentConfig)

      const result = getChainAccent(chainId)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('backgroundVar')
      expect(result).toHaveProperty('borderVar')
      expect(result).toHaveProperty('accentColorVar')
      expect(typeof result?.backgroundVar).toBe('string')
      expect(typeof result?.borderVar).toBe('string')
      expect(typeof result?.accentColorVar).toBe('string')
    })
  })
})
