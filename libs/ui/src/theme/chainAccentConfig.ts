import { BaseChainInfo, CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { transparentize } from 'color2k'

import { Color } from '../colors'

/**
 * Gets the chain name for CSS variables from CHAIN_INFO.
 * Only 2 chains have different names in CHAIN_INFO vs CSS variables, so we handle those explicitly.
 * For all other chains, CHAIN_INFO.name matches the CSS variable name format.
 */
const getChainName = (chainId: SupportedChainId): string => {
  const chainInfoName = CHAIN_INFO[chainId].name

  // Only 2 exceptions: arbitrum_one → arbitrum, gnosis_chain → gnosis
  // All other chains use CHAIN_INFO.name directly
  if (chainInfoName === 'arbitrum_one') return 'arbitrum'
  if (chainInfoName === 'gnosis_chain') return 'gnosis'

  return chainInfoName
}

/**
 * Generates CSS variable names for chain-specific colors.
 * This allows adding new chains without modifying the UI enum.
 */
const getChainColorVars = (chainName: string): { bgVar: string; borderVar: string; accentVar: string } => ({
  bgVar: `--cow-color-chain-${chainName}-bg`,
  borderVar: `--cow-color-chain-${chainName}-border`,
  accentVar: `--cow-color-chain-${chainName}-accent`,
})

export interface ChainAccentConfig {
  chainId: SupportedChainId
  bgVar: string
  borderVar: string
  accentVar: string
  lightBg: string
  darkBg: string
  lightBorder: string
  darkBorder: string
  lightColor: string
  darkColor: string
}

interface ChainAccentInput {
  chainId: SupportedChainId
  color?: string // Optional: defaults to CHAIN_INFO[chainId].color
  lightColor?: string
  darkColor?: string
  lightBgAlpha?: number
  darkBgAlpha?: number
  lightBorderAlpha?: number
  darkBorderAlpha?: number
}

// Override type excludes chainId since the Record key is the single source of truth
type ChainAccentOverride = Partial<Omit<ChainAccentInput, 'chainId'>>

const CHAIN_LIGHT_BG_ALPHA = 0.22
const CHAIN_DARK_BG_ALPHA = 0.32
const CHAIN_LIGHT_BORDER_ALPHA = 0.45
const CHAIN_DARK_BORDER_ALPHA = 0.65

// Fallback color if chain color is missing (uses neutral50 as approximation of UI.COLOR_TEXT)
const FALLBACK_CHAIN_COLOR = Color.neutral50

const chainAlpha = (color: string, alpha: number): string => transparentize(color, 1 - alpha)

function createChainAccent({
  chainId,
  color,
  lightColor,
  darkColor,
  lightBgAlpha = CHAIN_LIGHT_BG_ALPHA,
  darkBgAlpha = CHAIN_DARK_BG_ALPHA,
  lightBorderAlpha = CHAIN_LIGHT_BORDER_ALPHA,
  darkBorderAlpha = CHAIN_DARK_BORDER_ALPHA,
}: ChainAccentInput): ChainAccentConfig {
  // Use CHAIN_INFO.color as the single source of truth, allow override if needed
  // Fallback to neutral gray if color is missing
  const baseColor = color ?? CHAIN_INFO[chainId]?.color ?? FALLBACK_CHAIN_COLOR
  const finalLightColor = lightColor ?? baseColor
  const finalDarkColor = darkColor ?? baseColor

  const chainName = getChainName(chainId)
  const { bgVar, borderVar, accentVar } = getChainColorVars(chainName)

  return {
    chainId,
    bgVar,
    borderVar,
    accentVar,
    lightBg: chainAlpha(finalLightColor, lightBgAlpha),
    darkBg: chainAlpha(finalDarkColor, darkBgAlpha),
    lightBorder: chainAlpha(finalLightColor, lightBorderAlpha),
    darkBorder: chainAlpha(finalDarkColor, darkBorderAlpha),
    lightColor: finalLightColor,
    darkColor: finalDarkColor,
  }
}

/**
 * Chain accent color configuration.
 *
 * NEW NETWORKS WORK OUT OF THE BOX:
 * - When a new network is added to CHAIN_INFO (from @cowprotocol/cow-sdk), it automatically gets accent colors
 * - Colors are derived from CHAIN_INFO[chainId].color (single source of truth)
 * - Chain names and CSS variables are generated automatically from CHAIN_INFO
 *
 * CUSTOMIZATION:
 * - Override colors in CHAIN_ACCENT_OVERRIDES if CHAIN_INFO color differs from design (e.g., MAINNET)
 */

// Color overrides for chains where CHAIN_INFO color differs from original design
const CHAIN_ACCENT_OVERRIDES: Partial<Record<SupportedChainId, ChainAccentOverride>> = {
  [SupportedChainId.MAINNET]: {
    // Override: Original color #627EEA differs from SDK's #62688F
    color: '#627EEA',
  },
}

/**
 * Helper function to create a Record with all SupportedChainId keys.
 * Since CHAIN_INFO is Record<SupportedChainId, BaseChainInfo>, TypeScript ensures
 * all keys are present when iterating over CHAIN_INFO entries.
 *
 * Note: TypeScript cannot statically verify completeness of dynamically constructed Records,
 * but since we iterate over all CHAIN_INFO entries (which is a complete Record), all keys
 * are guaranteed to be present at runtime.
 */
function createChainAccentConfig(): Record<SupportedChainId, ChainAccentConfig> {
  const config = {} as Record<SupportedChainId, ChainAccentConfig>

  // Iterate over all CHAIN_INFO entries - since CHAIN_INFO is Record<SupportedChainId, BaseChainInfo>,
  // all SupportedChainId keys are guaranteed to be present
  for (const [key, _chainInfo] of Object.entries(CHAIN_INFO) as [string, BaseChainInfo][]) {
    const chainId = Number(key) as SupportedChainId
    config[chainId] = createChainAccent({
      chainId,
      ...CHAIN_ACCENT_OVERRIDES[chainId],
    })
  }

  return config satisfies Record<SupportedChainId, ChainAccentConfig>
}

/**
 * Map of chain accent colors keyed by SupportedChainId for programmatic access.
 * This allows components to access theme-aware chain colors without using CSS variables.
 *
 * TypeScript verifies completeness: since CHAIN_INFO is Record<SupportedChainId, BaseChainInfo>,
 * iterating over all entries ensures all SupportedChainId keys are present.
 *
 * @example
 * ```tsx
 * import { CHAIN_ACCENT_CONFIG } from '@cowprotocol/ui'
 *
 * const colors = CHAIN_ACCENT_CONFIG[SupportedChainId.MAINNET]
 * // colors.bgVar, colors.borderVar, colors.lightBg, colors.darkBg, etc.
 * ```
 */
export const CHAIN_ACCENT_CONFIG: Record<SupportedChainId, ChainAccentConfig> = createChainAccentConfig()

/**
 * Helper function to get chain accent colors for a given chainId.
 * All chains have accent colors configured.
 *
 * @example
 * ```tsx
 * import { getChainAccentColors } from '@cowprotocol/ui'
 *
 * const colors = getChainAccentColors(SupportedChainId.MAINNET)
 * // Use colors.lightBg, colors.darkBg, etc.
 * ```
 */
export function getChainAccentColors(chainId: SupportedChainId): ChainAccentConfig {
  return CHAIN_ACCENT_CONFIG[chainId]
}

export const CHAIN_ACCENT_CONFIG_ARRAY: ChainAccentConfig[] = Object.values(CHAIN_ACCENT_CONFIG)
