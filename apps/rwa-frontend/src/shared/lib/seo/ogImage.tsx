import 'server-only'

import { ImageResponse } from 'next/og'

import { SITE_NAME } from './site'

import { CowLogo } from '@/shared/ui/cow-logo'

export const OG_IMAGE_SIZE = { width: 1200, height: 630 }

export const OG_IMAGE_CONTENT_TYPE = 'image/png'

const BACKGROUND = '#052b65'
const TEXT = '#ffffff'
const TEXT_SECONDARY = '#cae9ff'
const ACCENT = '#65d9ff'

interface OgImageParams {
  title: string
  subtitle: string
  /** Shown above the title, e.g. a ticker */
  eyebrow?: string
}

export function renderOgImage({ title, subtitle, eyebrow }: OgImageParams): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: BACKGROUND,
          color: TEXT,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 40, fontWeight: 700 }}>
          <CowLogo height={40} />
          {SITE_NAME}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {eyebrow && <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, color: ACCENT }}>{eyebrow}</div>}
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 36, color: TEXT_SECONDARY }}>{subtitle}</div>
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  )
}
