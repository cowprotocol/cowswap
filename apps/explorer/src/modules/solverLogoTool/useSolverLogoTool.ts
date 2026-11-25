import { useCallback, useMemo, useState } from 'react'

import { drawArtwork } from './artwork.utils'
import { createCanvas } from './canvas.utils'
import { clamp, fitMark, MAX_SCALE, MIN_SCALE, POSITION_LIMIT } from './geometry.utils'
import { INITIAL_TRANSFORM } from './solverLogoTool.constants'
import { LogoAsset, LogoTransform, SampleKey } from './solverLogoTool.types'
import { useLogoPackExport } from './useLogoPackExport'
import { useLogoSource } from './useLogoSource'

export interface SolverLogoController {
  asset: LogoAsset | null
  artwork: HTMLCanvasElement | null
  transform: LogoTransform
  solverName: string
  sampleKey: SampleKey | null
  loading: boolean
  error: string
  exporting: 'logo' | 'ai' | null
  status: string
  setSolverName(name: string): void
  setError(error: string): void
  loadFile(file: File): Promise<void>
  loadSample(key: SampleKey): Promise<void>
  updateTransform(patch: Partial<LogoTransform>): void
  setScale(scale: number): void
  setPosition(x: number, y: number): void
  fit(): void
  reset(): void
  exportPack(kind: 'logo' | 'ai'): Promise<void>
}

export function useSolverLogoTool(): SolverLogoController {
  const source = useLogoSource()
  const { asset } = source
  const [edits, setEdits] = useState<{ source: LogoAsset | null; transform: LogoTransform }>({
    source: null,
    transform: INITIAL_TRANSFORM,
  })
  const transform = edits.source === asset ? edits.transform : INITIAL_TRANSFORM
  const artwork = useMemo(() => {
    if (!asset) return null
    const canvas = createCanvas()
    drawArtwork(canvas, asset, transform)
    return canvas
  }, [asset, transform])
  const updateTransform = useCallback(
    (patch: Partial<LogoTransform>): void => {
      setEdits((previous) => ({
        source: asset,
        transform: { ...(previous.source === asset ? previous.transform : INITIAL_TRANSFORM), ...patch },
      }))
    },
    [asset],
  )
  const setScale = (scale: number): void => updateTransform({ scale: Math.round(clamp(scale, MIN_SCALE, MAX_SCALE)) })
  const setPosition = (x: number, y: number): void =>
    updateTransform({
      x: Math.round(clamp(x, -POSITION_LIMIT, POSITION_LIMIT)),
      y: Math.round(clamp(y, -POSITION_LIMIT, POSITION_LIMIT)),
    })
  const fit = (): void => {
    if (asset) updateTransform(fitMark(asset))
  }
  const reset = (): void => setEdits({ source: asset, transform: INITIAL_TRANSFORM })
  const pack = useLogoPackExport(source, transform)
  return { ...source, ...pack, artwork, transform, updateTransform, setScale, setPosition, fit, reset }
}
