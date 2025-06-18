import { getContrastText } from '@cowprotocol/ui-utils'

import { darken, lighten, transparentize } from 'color2k'
import { css } from 'styled-components/macro'

import { UI } from '../enum'

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

    ${UI.COLOR_BORDER}: var(${UI.COLOR_PAPER_DARKER});
    ${UI.BOX_SHADOW}: 0 12px 12px ${({ theme }) => transparentize(theme.primary, 0.94)};
    ${UI.BOX_SHADOW_2}: 0px 4px 8px ${({ theme }) => transparentize(theme.primary, 0.94)};

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
    ${UI.COLOR_WHITE}: ${({ theme }) => theme.white};
    ${UI.COLOR_BLUE}: ${({ theme }) => theme.blueDark2};
    ${UI.COLOR_BLUE_100_PRIMARY}: ${({ theme }) => theme.blue100Primary};
    ${UI.COLOR_BLUE_300_PRIMARY}: ${({ theme }) => theme.blue300Primary};
    ${UI.COLOR_BLUE_400_PRIMARY}: ${({ theme }) => theme.blue400Primary};
    ${UI.COLOR_BLUE_900_PRIMARY}: ${({ theme }) => theme.blue900Primary};
    ${UI.COLOR_LIGHT_BLUE_OPACITY_90}: ${({ theme }) => theme.info};
    ${UI.COLOR_LIGHT_BLUE_OPACITY_80}: ${({ theme }) => transparentize(theme.info, 0.2)}; // 80% opacity
    ${UI.COLOR_YELLOW_LIGHT}: ${({ theme }) => theme.alert2};
    ${UI.COLOR_GREEN}: ${({ theme }) => theme.success};
    ${UI.COLOR_RED}: ${({ theme }) => theme.danger};

    // CoW AMM Colors
    ${UI.COLOR_COWAMM_DARK_GREEN}: #194d05;
    ${UI.COLOR_COWAMM_DARK_GREEN_OPACITY_30}: ${() => transparentize('#194d05', 0.7)};
    ${UI.COLOR_COWAMM_DARK_GREEN_OPACITY_15}: ${() => transparentize('#194d05', 0.85)};
    ${UI.COLOR_COWAMM_GREEN}: #2b6f0b;
    ${UI.COLOR_COWAMM_LIGHT_GREEN}: #bcec79;
    ${UI.COLOR_COWAMM_LIGHT_GREEN_OPACITY_30}: ${() => transparentize('#bcec79', 0.7)};
    ${UI.COLOR_COWAMM_LIGHTER_GREEN}: #dcf8a7;
    ${UI.COLOR_COWAMM_BLUE}: #3fc4ff;
    ${UI.COLOR_COWAMM_DARK_BLUE}: #012F7A;
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

    // Animation
    ${UI.ANIMATION_DURATION}: 0.1s;
    ${UI.ANIMATION_DURATION_SLOW}: 0.2s;
  }

  body {
    scrollbar-color: ${({ theme }) => theme.colorScrollbar};
    color: var(${UI.COLOR_TEXT_PAPER});
  }
`
