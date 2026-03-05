import { ReactNode, useMemo } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const SAD_COW_FACE_MAIN_SOURCE_FILL = '#d9d9d9'
const SAD_COW_FACE_EYES_SOURCE_FILL = '#23191a'

const SAD_COW_FACE_LIGHT_COLORS = {
  main: '#d9d9d9',
  eyes: '#23191a',
} as const

const SAD_COW_FACE_DARK_COLORS = {
  main: `var(${UI.COLOR_PRIMARY})`,
  eyes: `var(${UI.COLOR_PAPER})`,
} as const

const IneligibleImageSvg = styled(SVG)`
  width: 100%;
  max-width: 180px;
  height: auto;
`

interface IneligibleImageProps {
  src: string
  ariaHidden?: boolean
}

export function IneligibleImage({ src, ariaHidden }: IneligibleImageProps): ReactNode {
  const { darkMode } = useTheme()
  const preProcessor = useMemo(() => {
    const palette = darkMode ? SAD_COW_FACE_DARK_COLORS : SAD_COW_FACE_LIGHT_COLORS

    return (code: string): string =>
      code
        .replaceAll(SAD_COW_FACE_MAIN_SOURCE_FILL, palette.main)
        .replaceAll(SAD_COW_FACE_EYES_SOURCE_FILL, palette.eyes)
  }, [darkMode])

  return (
    <IneligibleImageSvg
      key={`${src}-${darkMode ? 'dark' : 'light'}`}
      src={src}
      preProcessor={preProcessor}
      aria-hidden={ariaHidden}
    />
  )
}
