import { ReactNode } from 'react'

import * as styledEl from './CowLoadingIcon.styles'
import { VIEWBOX_SIZE, HEAD_OFFSET_X, HEAD_OFFSET_Y, EYE_RADIUS } from './CowLoadingIcon.styles'

import { getThemeColors } from '../../colors'

export interface CowLoadingIconPalette {
  background: string
  head: string
  eyes: string
}

export interface CowLoadingIconProps {
  size?: number
  className?: string
  isDarkMode?: boolean
  palette?: CowLoadingIconPalette
}

function getDefaultPalette(isDarkMode: boolean): CowLoadingIconPalette {
  const themeColors = getThemeColors(isDarkMode)

  return isDarkMode
    ? {
        background: themeColors.paperDarkerCustom,
        head: themeColors.text,
        eyes: themeColors.paperDarkerCustom,
      }
    : {
        background: themeColors.blue900Primary,
        head: themeColors.paper,
        eyes: themeColors.blue900Primary,
      }
}

export function CowLoadingIcon({
  size = 36,
  className,
  isDarkMode = false,
  palette: paletteOverride,
}: CowLoadingIconProps = {}): ReactNode {
  const palette = paletteOverride ?? getDefaultPalette(isDarkMode)

  return (
    <styledEl.Svg
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden="true"
      className={className}
      $size={size}
    >
      <styledEl.Background $fill={palette.background} />
      <styledEl.Head
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.653 24C12.802 24.0009 11.9729 23.731 11.2854 23.2294C10.598 22.7279 10.0879 22.0206 9.829 21.21L7.11 12.666H5.44C4.58874 12.667 3.75924 12.3971 3.07158 11.8953C2.38392 11.3936 1.87377 10.686 1.615 9.875L0 4.8H6.058L2.863 0H33.137L29.942 4.8H36L34.385 9.876C34.126 10.6868 33.6158 11.3942 32.9282 11.8957C32.2405 12.3973 31.4111 12.6671 30.56 12.666H28.89L26.17 21.21C25.9111 22.0206 25.401 22.7279 24.7136 23.2294C24.0261 23.731 23.197 24.0009 22.346 24H13.653Z"
        $fill={palette.head}
      />
      <styledEl.Eye
        cx={13.756 + HEAD_OFFSET_X}
        cy={10.333 + HEAD_OFFSET_Y}
        r={EYE_RADIUS}
        $delay={0}
        $fill={palette.eyes}
      />
      <styledEl.Eye
        cx={22.244 + HEAD_OFFSET_X}
        cy={10.333 + HEAD_OFFSET_Y}
        r={EYE_RADIUS}
        $delay={160}
        $fill={palette.eyes}
      />
    </styledEl.Svg>
  )
}
