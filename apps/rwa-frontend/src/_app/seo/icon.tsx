import { ImageResponse } from 'next/og'

import { withBasePath } from '@/shared/config'
import { CowLogo } from '@/shared/ui/cow-logo'

const BACKGROUND = '#052b65'
const FOREGROUND = '#ffffff'

const APPLE_ICON_SIZE = 180
const MANIFEST_ICON_SIZES = [192, 512]
const ICON_SIZES = [APPLE_ICON_SIZE, ...MANIFEST_ICON_SIZES]

export const ICON_CONTENT_TYPE = 'image/png'

interface FaviconLink {
  url: string
  type: string
  media: string
}

interface IconLink {
  url: string
  sizes: string
  type: string
}

export const FAVICON: FaviconLink[] = [
  toFaviconLink('light', '(prefers-color-scheme: light)'),
  toFaviconLink('dark', '(prefers-color-scheme: dark)'),
  toFaviconLink('light', '(prefers-color-scheme: no-preference)'),
]
export const APPLE_ICON = toIconLink(APPLE_ICON_SIZE)
export const MANIFEST_ICONS = MANIFEST_ICON_SIZES.map(toIconLink)

interface IconRouteProps {
  params: Promise<{ size: string }>
}

export function generateIconStaticParams(): { size: string }[] {
  return ICON_SIZES.map((size) => ({ size: String(size) }))
}

export async function getIcon(_request: Request, { params }: IconRouteProps): Promise<ImageResponse> {
  const size = Number((await params).size)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BACKGROUND,
          color: FOREGROUND,
        }}
      >
        <CowLogo height={Math.round(size * 0.45)} />
      </div>
    ),
    { width: size, height: size },
  )
}

function toFaviconLink(theme: 'light' | 'dark', media: string): FaviconLink {
  return { url: withBasePath(`/favicon-${theme}-mode.png`), type: ICON_CONTENT_TYPE, media }
}

function toIconLink(size: number): IconLink {
  return { url: withBasePath(`/icons/${size}`), sizes: `${size}x${size}`, type: ICON_CONTENT_TYPE }
}
