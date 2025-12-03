import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { CHAIN_ACCENT_CONFIG, getChainAccentColors } from './ThemeColorVars'

import { Color } from '../colors'

describe('Chain Accent Colors', () => {
  describe('getChainAccentColors', () => {
    it('should return accent colors for MAINNET', () => {
      const colors = getChainAccentColors(SupportedChainId.MAINNET)

      expect(colors).toBeDefined()
      expect(colors?.chainId).toBe(SupportedChainId.MAINNET)
      expect(colors?.bgVar).toBe('--cow-color-chain-ethereum-bg')
      expect(colors?.borderVar).toBe('--cow-color-chain-ethereum-border')
      expect(colors?.accentVar).toBe('--cow-color-chain-ethereum-accent')
      expect(colors?.lightColor).toBe('#627EEA') // Override applied
      expect(colors?.darkColor).toBe('#627EEA')
    })

    it('should return accent colors for LENS with darkColor override', () => {
      const colors = getChainAccentColors(SupportedChainId.LENS)

      expect(colors).toBeDefined()
      expect(colors?.chainId).toBe(SupportedChainId.LENS)
      expect(colors?.lightColor).toBe('#5A5A5A') // Override applied
      expect(colors?.darkColor).toBe('#D7D7D7') // Dark color override applied
    })

    it('should return accent colors for BNB using CHAIN_INFO color', () => {
      const colors = getChainAccentColors(SupportedChainId.BNB)

      expect(colors).toBeDefined()
      expect(colors?.chainId).toBe(SupportedChainId.BNB)
      expect(colors?.lightColor).toBe(CHAIN_INFO[SupportedChainId.BNB].color)
      expect(colors?.darkColor).toBe(CHAIN_INFO[SupportedChainId.BNB].color)
    })
  })

  describe('CHAIN_ACCENT_CONFIG', () => {
    it('should include all chains from CHAIN_INFO', () => {
      const chainIdsInChainInfo = Object.keys(CHAIN_INFO).map((key) => Number(key) as SupportedChainId)

      // All chains from CHAIN_INFO should be in the config
      chainIdsInChainInfo.forEach((chainId) => {
        const config = CHAIN_ACCENT_CONFIG[chainId]
        expect(config).toBeDefined()
      })
    })

    it('should have correct CSS variable format for all chains', () => {
      Object.values(CHAIN_ACCENT_CONFIG).forEach((config) => {
        expect(config.bgVar).toMatch(/^--cow-color-chain-[a-z_]+-bg$/)
        expect(config.borderVar).toMatch(/^--cow-color-chain-[a-z_]+-border$/)
        expect(config.accentVar).toBeDefined()
        expect(config.accentVar).not.toBeUndefined()
        expect(typeof config.accentVar).toBe('string')
        expect(config.accentVar).toMatch(/^--cow-color-chain-[a-z_]+-accent$/)
      })
    })

    it('should normalize arbitrum_one to arbitrum in CSS variables', () => {
      const colors = getChainAccentColors(SupportedChainId.ARBITRUM_ONE)

      expect(colors).toBeDefined()
      expect(colors?.bgVar).toBe('--cow-color-chain-arbitrum-bg')
      expect(colors?.borderVar).toBe('--cow-color-chain-arbitrum-border')
      expect(colors?.accentVar).toBe('--cow-color-chain-arbitrum-accent')
      // Verify it's NOT using the CHAIN_INFO name directly
      expect(colors?.bgVar).not.toContain('arbitrum_one')
    })

    it('should normalize gnosis_chain to gnosis in CSS variables', () => {
      const colors = getChainAccentColors(SupportedChainId.GNOSIS_CHAIN)

      expect(colors).toBeDefined()
      expect(colors?.bgVar).toBe('--cow-color-chain-gnosis-bg')
      expect(colors?.borderVar).toBe('--cow-color-chain-gnosis-border')
      expect(colors?.accentVar).toBe('--cow-color-chain-gnosis-accent')
      // Verify it's NOT using the CHAIN_INFO name directly
      expect(colors?.bgVar).not.toContain('gnosis_chain')
    })

    it('should use CHAIN_INFO.name directly for other chains', () => {
      const colors = getChainAccentColors(SupportedChainId.POLYGON)

      expect(colors).toBeDefined()
      expect(colors?.bgVar).toBe('--cow-color-chain-polygon-bg')
      // Polygon name in CHAIN_INFO is 'polygon', so it should match exactly
      expect(CHAIN_INFO[SupportedChainId.POLYGON].name).toBe('polygon')
    })
  })

  describe('Color overrides', () => {
    it('should apply MAINNET color override', () => {
      const colors = getChainAccentColors(SupportedChainId.MAINNET)
      const sdkColor = CHAIN_INFO[SupportedChainId.MAINNET].color

      expect(colors?.lightColor).toBe('#627EEA')
      expect(colors?.lightColor).not.toBe(sdkColor) // Should differ from SDK
      expect(sdkColor).toBe('#62688F') // Verify SDK color is different
    })

    it('should apply LENS color and darkColor overrides', () => {
      const colors = getChainAccentColors(SupportedChainId.LENS)
      const sdkColor = CHAIN_INFO[SupportedChainId.LENS].color

      expect(colors?.lightColor).toBe('#5A5A5A')
      expect(colors?.darkColor).toBe('#D7D7D7')
      expect(colors?.lightColor).not.toBe(sdkColor) // Should differ from SDK
      expect(sdkColor).toBe('#FFFFFF') // Verify SDK color is different
    })

    it('should use CHAIN_INFO color for chains without overrides', () => {
      const colors = getChainAccentColors(SupportedChainId.BASE)
      const sdkColor = CHAIN_INFO[SupportedChainId.BASE].color

      expect(colors?.lightColor).toBe(sdkColor)
      expect(colors?.darkColor).toBe(sdkColor)
    })
  })

  describe('ChainAccentConfig structure', () => {
    it('should have all required properties', () => {
      const colors = getChainAccentColors(SupportedChainId.MAINNET)

      expect(colors).toHaveProperty('chainId')
      expect(colors).toHaveProperty('bgVar')
      expect(colors).toHaveProperty('borderVar')
      expect(colors).toHaveProperty('accentVar')
      expect(colors).toHaveProperty('lightBg')
      expect(colors).toHaveProperty('darkBg')
      expect(colors).toHaveProperty('lightBorder')
      expect(colors).toHaveProperty('darkBorder')
      expect(colors).toHaveProperty('lightColor')
      expect(colors).toHaveProperty('darkColor')
    })

    it('should have calculated alpha colors', () => {
      const colors = getChainAccentColors(SupportedChainId.MAINNET)

      // lightBg should be transparentized version of lightColor
      expect(colors?.lightBg).toBeDefined()
      expect(colors?.lightBg).not.toBe(colors?.lightColor)
      expect(colors?.lightBg).toContain('rgba') // transparentize returns rgba

      // darkBg should be transparentized version of darkColor
      expect(colors?.darkBg).toBeDefined()
      expect(colors?.darkBg).not.toBe(colors?.darkColor)
      expect(colors?.darkBg).toContain('rgba')

      // Borders should also be transparentized
      expect(colors?.lightBorder).toContain('rgba')
      expect(colors?.darkBorder).toContain('rgba')
    })
  })

  describe('Automatic chain inclusion', () => {
    it('should automatically include new chains from CHAIN_INFO', () => {
      // This test verifies that the system automatically picks up all chains
      // If a new chain is added to CHAIN_INFO, it should appear in CHAIN_ACCENT_CONFIG
      const allChainIds = Object.keys(CHAIN_INFO).map((key) => Number(key) as SupportedChainId)

      allChainIds.forEach((chainId) => {
        const config = CHAIN_ACCENT_CONFIG[chainId]
        expect(config).toBeDefined()
        expect(config.chainId).toBe(chainId)
      })
    })

    it('should have consistent chainId in config', () => {
      Object.entries(CHAIN_ACCENT_CONFIG).forEach(([key, config]) => {
        const chainId = Number(key) as SupportedChainId
        expect(config.chainId).toBe(chainId)
      })
    })
  })

  describe('Fallback color handling', () => {
    it('should use Color.neutral50 as fallback when chain color is missing', () => {
      // Verify the fallback color constant exists and has the correct value
      // This is defensive - in practice all chains in CHAIN_INFO should have colors
      const fallbackColor = Color.neutral50
      expect(fallbackColor).toBe('#827474')

      // Verify all chains have valid colors (ensuring fallback logic doesn't break anything)
      Object.values(CHAIN_ACCENT_CONFIG).forEach((config) => {
        expect(config.lightColor).toBeDefined()
        expect(config.darkColor).toBeDefined()
        expect(typeof config.lightColor).toBe('string')
        expect(typeof config.darkColor).toBe('string')
        // Colors should be valid hex or rgba format
        expect(config.lightColor).toMatch(/^#[\da-fA-F]{6}$|^rgba?\(/)
        expect(config.darkColor).toMatch(/^#[\da-fA-F]{6}$|^rgba?\(/)
      })
    })
  })
})
