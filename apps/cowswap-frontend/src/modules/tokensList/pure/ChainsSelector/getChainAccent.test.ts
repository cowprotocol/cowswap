import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getChainAccentColors } from '@cowprotocol/ui'

import { transparentize } from 'color2k'

import { getChainAccent } from './getChainAccent'

import { createChainInfoForTests } from '../../test-utils/createChainInfoForTests'

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

    const chain = createChainInfoForTests(SupportedChainId.MAINNET)
    const result = getChainAccent(chain)

    expect(result).toEqual({
      backgroundVar: '--cow-color-chain-ethereum-bg',
      borderVar: '--cow-color-chain-ethereum-border',
      accentColorVar: '--cow-color-chain-ethereum-accent',
    })
    expect(mockGetChainAccentColors).toHaveBeenCalledWith(chain.id)
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

    const chain = createChainInfoForTests(SupportedChainId.POLYGON)
    const result = getChainAccent(chain)

    expect(result).toEqual({
      backgroundVar: '--cow-color-chain-polygon-bg',
      borderVar: '--cow-color-chain-polygon-border',
      accentColorVar: '--cow-color-chain-polygon-accent',
    })
    expect(mockGetChainAccentColors).toHaveBeenCalledWith(chain.id)
  })

  it('should return derived colors when getChainAccentColors returns undefined', () => {
    const baseColor = '#f7931a'
    const chain = createChainInfoForTests(SupportedChainId.MAINNET, { id: 999, color: baseColor })

    mockGetChainAccentColors.mockReturnValue(undefined as unknown as ReturnType<typeof getChainAccentColors>)

    const result = getChainAccent(chain)

    expect(result).toEqual({
      backgroundColor: transparentize(baseColor, 1 - 0.22),
      backgroundColorDark: transparentize(baseColor, 1 - 0.32),
      borderColor: transparentize(baseColor, 1 - 0.45),
      borderColorDark: transparentize(baseColor, 1 - 0.65),
      accentColor: baseColor,
      accentColorDark: baseColor,
    })
    expect(mockGetChainAccentColors).toHaveBeenCalledWith(chain.id)
  })

  it('should return derived colors when getChainAccentColors returns null', () => {
    const baseColor = '#14f195'
    const chain = createChainInfoForTests(SupportedChainId.MAINNET, { id: 998, color: baseColor })

    mockGetChainAccentColors.mockReturnValue(null as unknown as ReturnType<typeof getChainAccentColors>)

    const result = getChainAccent(chain)

    expect(result).toEqual({
      backgroundColor: transparentize(baseColor, 1 - 0.22),
      backgroundColorDark: transparentize(baseColor, 1 - 0.32),
      borderColor: transparentize(baseColor, 1 - 0.45),
      borderColorDark: transparentize(baseColor, 1 - 0.65),
      accentColor: baseColor,
      accentColorDark: baseColor,
    })
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

    const chain = createChainInfoForTests(SupportedChainId.ARBITRUM_ONE)
    const result = getChainAccent(chain)

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

      const chain = createChainInfoForTests(chainId)
      const result = getChainAccent(chain)

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
