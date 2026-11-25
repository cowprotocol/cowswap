export interface ImageRect {
  x: number
  y: number
  width: number
  height: number
}

export interface LogoAsset {
  name: string
  type: 'png' | 'svg'
  bytes: Uint8Array<ArrayBuffer>
  svg: string | null
  image: HTMLImageElement
  url: string
  width: number
  height: number
  inkPoints: [number, number][]
  bounds: ImageRect
  dispose(): void
}

export type LogoContext = 'row' | 'winner' | 'stack'

export interface LogoPack {
  blob: Blob
  filename: string
}

export interface LogoSnapshot {
  name: string
  asset: LogoAsset
  state: LogoTransform
  artwork: HTMLCanvasElement
}

export interface LogoTransform {
  scale: number
  x: number
  y: number
  background: string
}

export type PreviewTheme = 'light' | 'dark'
export type SampleKey = 'fibrous' | 'dfusion' | 'brrr'
export interface ZipEntry {
  name: string
  data: string | Blob | Uint8Array<ArrayBuffer>
}
