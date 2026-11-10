import { useCallback } from 'react'

import { CANVAS } from './raster.utils'

import type { WallRefs } from './wall.types'

export interface WallPixels {
  /** Current wall colour at a cell, from the live pixel buffer. */
  wallColorAt: (x: number, y: number) => number
  /** Write server cells into the pixel buffer and flag it for re-upload. */
  applyCells: (cells: Array<[number, number, number]>) => void
}

export function useWallPixels({ pixelsRef, dirtyRef, requestRenderRef }: WallRefs): WallPixels {
  const wallColorAt = useCallback(
    (x: number, y: number): number => {
      const px = pixelsRef.current
      const i = (y * CANVAS.w + x) * 4

      return (px[i] << 16) | (px[i + 1] << 8) | px[i + 2]
    },
    [pixelsRef],
  )

  const applyCells = useCallback(
    (cells: Array<[number, number, number]>): void => {
      const pixels = pixelsRef.current

      for (const [x, y, rgb] of cells) {
        if (x < 0 || y < 0 || x >= CANVAS.w || y >= CANVAS.h) continue

        const i = (y * CANVAS.w + x) * 4

        pixels[i] = (rgb >> 16) & 0xff
        pixels[i + 1] = (rgb >> 8) & 0xff
        pixels[i + 2] = rgb & 0xff
        pixels[i + 3] = 255
      }

      if (cells.length > 0) {
        dirtyRef.current = true
        requestRenderRef.current()
      }
    },
    [dirtyRef, pixelsRef, requestRenderRef],
  )

  return { wallColorAt, applyCells }
}
