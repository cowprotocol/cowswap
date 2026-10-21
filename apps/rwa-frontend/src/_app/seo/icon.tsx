import { ImageResponse } from 'next/og'

import { withBasePath } from '@/shared/config'
import { CowLogo } from '@/shared/ui/cow-logo'

const BACKGROUND = '#052b65'
const FOREGROUND = '#ffffff'

const FAVICON_SIZE = 32
const APPLE_ICON_SIZE = 180
const MANIFEST_ICON_SIZES = [192, 512]
const ICON_SIZES = [FAVICON_SIZE, APPLE_ICON_SIZE, ...MANIFEST_ICON_SIZES]

export const ICON_CONTENT_TYPE = 'image/png'

interface IconLink {
  url: string
  sizes: string
  type: string
}

export const FAVICON = toIconLink(FAVICON_SIZE)
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
  // Platforms that install the app round the corners themselves, browser tabs show the favicon as is
  const isRounded = size === FAVICON_SIZE

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
          borderRadius: isRounded ? size * 0.22 : 0,
        }}
      >
        <CowLogo height={Math.round(size * 0.45)} />
      </div>
    ),
    { width: size, height: size },
  )
}

function toIconLink(size: number): IconLink {
  return { url: withBasePath(`/icons/${size}`), sizes: `${size}x${size}`, type: ICON_CONTENT_TYPE }
}
