import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getContrastText } from '@cowprotocol/ui-utils'

import { darken, lighten, transparentize } from 'color2k'
import { css } from 'styled-components/macro'

import { Color } from '../colors'
import { UI } from '../enum'

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
  accentVar?: string
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
 * - Override colors in CHAIN_ACCENT_OVERRIDES if CHAIN_INFO color differs from design (e.g., MAINNET, LENS)
 */

// Color overrides for chains where CHAIN_INFO color differs from original design
const CHAIN_ACCENT_OVERRIDES: Partial<Record<SupportedChainId, Partial<ChainAccentInput>>> = {
  [SupportedChainId.MAINNET]: {
    // Override: Original color #627EEA differs from SDK's #62688F
    color: '#627EEA',
  },
  [SupportedChainId.LENS]: {
    // Override: Original color #5A5A5A differs from SDK's #FFFFFF
    color: '#5A5A5A',
    darkColor: '#D7D7D7',
  },
}

// Automatically generate accent colors for all chains in CHAIN_INFO
const CHAIN_ACCENT_CONFIG_ARRAY: ChainAccentConfig[] = Object.keys(CHAIN_INFO)
  .map((key) => Number(key) as SupportedChainId)
  .filter((chainId) => {
    // Type guard: ensure chainId exists in CHAIN_INFO
    return CHAIN_INFO[chainId]
  })
  .map((chainId) =>
    createChainAccent({
      chainId,
      ...CHAIN_ACCENT_OVERRIDES[chainId],
    }),
  )

/**
 * Map of chain accent colors keyed by SupportedChainId for programmatic access.
 * This allows components to access theme-aware chain colors without using CSS variables.
 *
 * @example
 * ```tsx
 * import { CHAIN_ACCENT_CONFIG } from '@cowprotocol/ui'
 *
 * const colors = CHAIN_ACCENT_CONFIG[SupportedChainId.MAINNET]
 * // colors.bgVar, colors.borderVar, colors.lightBg, colors.darkBg, etc.
 * ```
 */
export const CHAIN_ACCENT_CONFIG: Record<SupportedChainId, ChainAccentConfig> = CHAIN_ACCENT_CONFIG_ARRAY.reduce(
  (acc, config) => {
    acc[config.chainId] = config
    return acc
  },
  {} as Record<SupportedChainId, ChainAccentConfig>,
)

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

const CHAIN_ACCENT_VAR_DECLARATIONS = CHAIN_ACCENT_CONFIG_ARRAY.map(
  ({ bgVar, borderVar, accentVar, lightBg, darkBg, lightBorder, darkBorder, lightColor, darkColor }) => css`
    ${bgVar}: ${({ theme }) => (theme.darkMode ? darkBg : lightBg)};
    ${borderVar}: ${({ theme }) => (theme.darkMode ? darkBorder : lightBorder)};
    ${accentVar
      ? css`
          ${accentVar}: ${({ theme }) => (theme.darkMode ? darkColor : lightColor)};
        `
      : ''}
  `,
)

export const ThemeColorVars = css`
  :root {
    // V3
    ${UI.COLOR_PRIMARY}: ${({ theme }) => theme.primary};
    ${UI.COLOR_PRIMARY_LIGHTER}: ${({ theme }) =>
      theme.darkMode ? lighten(theme.primary, 0.1) : lighten(theme.primary, 0.2)};
    ${UI.COLOR_PRIMARY_DARKER}: ${({ theme }) =>
      theme.darkMode ? darken(theme.primary, 0.2) : darken(theme.primary, 0.1)};
    ${UI.COLOR_PRIMARY_DARKEST}: ${({ theme }) =>
      theme.darkMode ? darken(theme.primary, 0.4) : darken(theme.primary, 0.1)};
    ${UI.COLOR_PRIMARY_PAPER}: ${({ theme }) => getContrastText(theme.paper, theme.primary)};
    ${UI.COLOR_PRIMARY_OPACITY_80}: ${({ theme }) => transparentize(theme.primary, 0.2)};
    ${UI.COLOR_PRIMARY_OPACITY_70}: ${({ theme }) => transparentize(theme.primary, 0.5)};
    ${UI.COLOR_PRIMARY_OPACITY_50}: ${({ theme }) => transparentize(theme.primary, 0.5)};
    ${UI.COLOR_PRIMARY_OPACITY_25}: ${({ theme }) => transparentize(theme.primary, 0.75)};
    ${UI.COLOR_PRIMARY_OPACITY_10}: ${({ theme }) => transparentize(theme.primary, 0.9)};

    ${UI.COLOR_SECONDARY}: ${({ theme }) => theme.primary};

    ${UI.COLOR_BACKGROUND}: ${({ theme }) => theme.background};

    ${UI.COLOR_PAPER}: ${({ theme }) => theme.paper};
    ${UI.COLOR_PAPER_OPACITY_99}: ${({ theme }) => transparentize(theme.paper, 0.99)};
    ${UI.COLOR_PAPER_DARKER}: ${({ theme }) =>
      theme.darkMode ? darken(theme.paper, 0.07) : darken(theme.paper, 0.05)};
    ${UI.COLOR_PAPER_DARKEST}: ${({ theme }) =>
      theme.darkMode ? darken(theme.paper, 0.1) : darken(theme.paper, 0.15)};
    ${UI.COLOR_PAPER_GRADIENT}: ${({ theme }) =>
      theme.darkMode
        ? `linear-gradient(90deg, ${transparentize(theme.text, 0.9)} 0%, ${transparentize(theme.text, 0.8)} 100%)`
        : `linear-gradient(90deg, ${transparentize(theme.text, 0.92)} 0%, ${transparentize(theme.text, 0.96)} 100%)`};

    ${UI.COLOR_BORDER}: var(${UI.COLOR_PAPER_DARKER});
    ${UI.BOX_SHADOW}: 0 12px 12px ${({ theme }) => transparentize(theme.primary, 0.94)};
    ${UI.BOX_SHADOW_2}: 0px 4px 8px ${({ theme }) => transparentize(theme.primary, 0.94)};
    ${UI.BOX_SHADOW_3}: ${({ theme }) =>
      theme.darkMode
        ? `0px 6px 12px -6px ${darken(theme.paper, 0.04)}, 0px 8px 24px -4px ${darken(theme.paper, 0.08)}`
        : `0px 6px 12px -6px ${transparentize(theme.text, 0.88)}, 0px 8px 24px -4px ${transparentize(theme.text, 0.92)}`};

    ${UI.COLOR_TEXT}: ${({ theme }) => theme.text};
    ${UI.COLOR_TEXT_PAPER}: ${({ theme }) => getContrastText(theme.paper, theme.text)};

    ${UI.COLOR_TEXT_OPACITY_70}: ${({ theme }) => transparentize(theme.text, 0.3)};
    ${UI.COLOR_TEXT_OPACITY_60}: ${({ theme }) => transparentize(theme.text, 0.4)};
    ${UI.COLOR_TEXT_OPACITY_50}: ${({ theme }) => transparentize(theme.text, 0.5)};
    ${UI.COLOR_TEXT_OPACITY_25}: ${({ theme }) => transparentize(theme.text, 0.75)};
    ${UI.COLOR_TEXT_OPACITY_10}: ${({ theme }) => transparentize(theme.text, 0.9)};

    ${UI.COLOR_DISABLED_TEXT}: ${({ theme }) => theme.disabledText};

    ${UI.COLOR_SECONDARY_TEXT}: ${({ theme }) =>
      theme.darkMode ? transparentize(theme.text, 0.6) : transparentize(theme.text, 0.5)};

    ${UI.COLOR_DARK_IMAGE_PAPER}: ${({ theme }) => getContrastText('#000000', theme.paper)};
    ${UI.COLOR_DARK_IMAGE_PAPER_TEXT}: ${({ theme }) =>
      getContrastText(getContrastText('#000000', theme.paper), theme.text)};

    ${UI.COLOR_BUTTON_TEXT}: ${({ theme }) => getContrastText(theme.primary, theme.buttonTextCustom)};

    ${UI.COLOR_BUTTON_TEXT_DISABLED}: ${({ theme }) =>
      getContrastText(theme.darkMode ? darken(theme.paper, 0.07) : darken(theme.paper, 0.05), theme.text)};

    ${UI.COLOR_SUCCESS}: ${({ theme }) => theme.success};
    ${UI.COLOR_SUCCESS_BG}: ${({ theme }) => transparentize(theme.success, 0.85)};
    ${UI.COLOR_SUCCESS_TEXT}: ${({ theme }) =>
      theme.darkMode ? lighten(theme.success, 0.04) : darken(theme.success, 0.1)};

    ${UI.COLOR_INFO}: ${({ theme }) => theme.info};
    ${UI.COLOR_INFO_BG}: ${({ theme }) => transparentize(theme.info, 0.85)};
    ${UI.COLOR_INFO_TEXT}: ${({ theme }) => (theme.darkMode ? lighten(theme.info, 0.04) : darken(theme.info, 0.04))};

    ${UI.COLOR_ALERT}: ${({ theme }) => theme.alert};
    ${UI.COLOR_ALERT_BG}: ${({ theme }) => transparentize(theme.alert, 0.85)};
    ${UI.COLOR_ALERT_TEXT}: ${({ theme }) => (theme.darkMode ? lighten(theme.alert, 0.06) : darken(theme.alert, 0.15))};
    ${UI.COLOR_ALERT_TEXT_DARKER}: ${({ theme }) =>
      getContrastText(theme.alert, theme.darkMode ? darken(theme.alert, 0.55) : darken(theme.alert, 0.35))};

    ${CHAIN_ACCENT_VAR_DECLARATIONS}

    ${UI.COLOR_WARNING}: ${({ theme }) => theme.warning};
    ${UI.COLOR_WARNING_BG}: ${({ theme }) => transparentize(theme.warning, 0.85)};
    ${UI.COLOR_WARNING_TEXT}: ${({ theme }) =>
      theme.darkMode ? lighten(theme.warning, 0.04) : darken(theme.warning, 0.04)};

    ${UI.COLOR_DANGER}: ${({ theme }) => theme.danger};
    ${UI.COLOR_DANGER_BG}: ${({ theme }) => transparentize(theme.danger, 0.85)};
    ${UI.COLOR_DANGER_TEXT}: ${({ theme }) =>
      theme.darkMode ? lighten(theme.danger, 0.04) : darken(theme.danger, 0.04)};

    // Badges
    ${UI.COLOR_BADGE_YELLOW_BG}: ${({ theme }) => theme.alert2};
    ${UI.COLOR_BADGE_YELLOW_TEXT}: ${({ theme }) => getContrastText(theme.alert2, darken(theme.alert2, 0.6))};

    // Colors
    ${UI.COLOR_BLUE}: ${({ theme }) => theme.blueDark2};
    ${UI.COLOR_BLUE_100_PRIMARY}: ${({ theme }) => theme.blue100Primary};
    ${UI.COLOR_BLUE_100_PRIMARY_OPACITY_15}: ${({ theme }) => transparentize(theme.blue100Primary, 0.85)};
    ${UI.COLOR_BLUE_200_PRIMARY}: ${({ theme }) => theme.blue200Primary};
    ${UI.COLOR_BLUE_300_PRIMARY}: ${({ theme }) => theme.blue300Primary};
    ${UI.COLOR_BLUE_400_PRIMARY}: ${({ theme }) => theme.blue400Primary};
    ${UI.COLOR_BLUE_500_PRIMARY}: ${({ theme }) => theme.blue500Primary};
    ${UI.COLOR_BLUE_700_PRIMARY}: ${({ theme }) => theme.blue700Primary};
    ${UI.COLOR_BLUE_700_PRIMARY_OPACITY_25}: ${({ theme }) => transparentize(theme.blue700Primary, 0.75)};
    ${UI.COLOR_BLUE_900_PRIMARY}: ${({ theme }) => theme.blue900Primary};
    ${UI.COLOR_PURPLE_200_PRIMARY}: ${({ theme }) => theme.purple200Primary};
    ${UI.COLOR_PURPLE_800_PRIMARY}: ${({ theme }) => theme.purple800Primary};
    ${UI.COLOR_LIGHT_BLUE_OPACITY_90}: ${({ theme }) => theme.info};
    ${UI.COLOR_LIGHT_BLUE_OPACITY_80}: ${({ theme }) => transparentize(theme.info, 0.2)}; // 80% opacity
    ${UI.COLOR_YELLOW_LIGHT}: ${({ theme }) => theme.alert2};
    ${UI.COLOR_GREEN}: ${({ theme }) => theme.success};
    ${UI.COLOR_RED}: ${({ theme }) => theme.danger};
    ${UI.COLOR_WHITE}: ${({ theme }) => theme.neutral100};
    ${UI.COLOR_NEUTRAL_100}: ${({ theme }) => theme.neutral100};
    ${UI.COLOR_NEUTRAL_98}: ${({ theme }) => theme.neutral98};
    ${UI.COLOR_NEUTRAL_95}: ${({ theme }) => theme.neutral95};
    ${UI.COLOR_NEUTRAL_90}: ${({ theme }) => theme.neutral90};
    ${UI.COLOR_NEUTRAL_80}: ${({ theme }) => theme.neutral80};
    ${UI.COLOR_NEUTRAL_70}: ${({ theme }) => theme.neutral70};
    ${UI.COLOR_NEUTRAL_60}: ${({ theme }) => theme.neutral60};
    ${UI.COLOR_NEUTRAL_50}: ${({ theme }) => theme.neutral50};
    ${UI.COLOR_NEUTRAL_40}: ${({ theme }) => theme.neutral40};
    ${UI.COLOR_NEUTRAL_30}: ${({ theme }) => theme.neutral30};
    ${UI.COLOR_NEUTRAL_20}: ${({ theme }) => theme.neutral20};
    ${UI.COLOR_NEUTRAL_10}: ${({ theme }) => theme.neutral10};
    ${UI.COLOR_NEUTRAL_0}: ${({ theme }) => theme.neutral0};
    ${UI.COLOR_BLACK}: ${({ theme }) => theme.neutral0};
    ${UI.COLOR_BLACK_OPACITY_70}: ${({ theme }) => transparentize(theme.neutral0, 0.3)};
    ${UI.COLOR_BLACK_OPACITY_30}: ${({ theme }) => transparentize(theme.neutral0, 0.7)};

    // CoW AMM Colors
    ${UI.COLOR_COWAMM_DARK_GREEN}: #194d05;
    ${UI.COLOR_COWAMM_DARK_GREEN_OPACITY_30}: ${() => transparentize('#194d05', 0.7)};
    ${UI.COLOR_COWAMM_DARK_GREEN_OPACITY_15}: ${() => transparentize('#194d05', 0.85)};
    ${UI.COLOR_COWAMM_GREEN}: #2b6f0b;
    ${UI.COLOR_COWAMM_LIGHT_GREEN}: #bcec79;
    ${UI.COLOR_COWAMM_LIGHT_GREEN_OPACITY_30}: ${() => transparentize('#bcec79', 0.7)};
    ${UI.COLOR_COWAMM_LIGHTER_GREEN}: #dcf8a7;
    ${UI.COLOR_COWAMM_BLUE}: #3fc4ff;
    ${UI.COLOR_COWAMM_LIGHT_BLUE}: #ccf8ff;
    ${UI.COLOR_COWAMM_LIGHT_ORANGE}: ${() => transparentize('#DB971E', 0.7)};

    // Base
    ${UI.COLOR_CONTAINER_BG_02}: var(${UI.COLOR_PAPER});
    ${UI.MODAL_BACKDROP}: var(${UI.COLOR_TEXT});
    ${UI.BORDER_RADIUS_NORMAL}: 24px;
    ${UI.PADDING_NORMAL}: 24px;

    // Icons
    ${UI.ICON_SIZE_LARGE}: 36px;
    ${UI.ICON_SIZE_NORMAL}: 20px;
    ${UI.ICON_SIZE_SMALL}: 16px;
    ${UI.ICON_SIZE_XSMALL}: 14px;
    ${UI.ICON_SIZE_TINY}: 10px;
    ${UI.ICON_COLOR_NORMAL}: ${({ theme }) => theme.text};

    // Text
    ${UI.COLOR_TEXT_OPACITY_25}: ${({ theme }) => transparentize(theme.text, 0.75)};
    ${UI.COLOR_TEXT_OPACITY_15}: ${({ theme }) => transparentize(theme.text, 0.85)};
    ${UI.COLOR_TEXT_OPACITY_10}: ${({ theme }) => transparentize(theme.text, 0.9)};
    ${UI.COLOR_TEXT2}: ${({ theme }) => transparentize(theme.text, 0.3)};
    ${UI.COLOR_LINK}: var(${UI.COLOR_PRIMARY});
    ${UI.COLOR_LINK_OPACITY_10}: ${({ theme }) => transparentize(theme.info, 0.9)};

    // Font Weights & Sizes
    ${UI.FONT_WEIGHT_NORMAL}: 400;
    ${UI.FONT_WEIGHT_MEDIUM}: 500;
    ${UI.FONT_WEIGHT_BOLD}: 600;
    ${UI.FONT_SIZE_SMALLER}: 10px;
    ${UI.FONT_SIZE_SMALL}: 12px;
    ${UI.FONT_SIZE_NORMAL}: 14px;
    ${UI.FONT_SIZE_MEDIUM}: 16px;
    ${UI.FONT_SIZE_LARGE}: 18px;
    ${UI.FONT_SIZE_LARGER}: 20px;
    ${UI.FONT_SIZE_LARGEST}: 24px;
    ${UI.FONT_FAMILY_PRIMARY}: 'studiofeixen', 'Inter var', 'Inter', Arial, sans-serif;

    // Animation
    ${UI.ANIMATION_DURATION}: 0.1s;
    ${UI.ANIMATION_DURATION_SLOW}: 0.2s;
  }

  body {
    scrollbar-color: ${({ theme }) => theme.colorScrollbar};
    color: var(${UI.COLOR_TEXT_PAPER});
  }
`
