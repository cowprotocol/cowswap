import { useState, useEffect } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'

import { getContrast } from 'color2k'

/**
 * Hook to detect if a token image has low contrast against the current theme.paper background.
 * Uses canvas to sample a small version of the token image and calculate W3C WCAG compliant contrast ratio.
 *
 * @param src - The URL of the token image to analyze. If undefined, returns false.
 * @param minContrastRatio - Minimum contrast ratio threshold (default: 1.5).
 *                          Values below this trigger contrast enhancement.
 *                          - 1.0 = identical colors (no contrast)
 *                          - 1.5 = low contrast (default threshold)
 *                          - 3.0 = AA accessibility standard
 *                          - 4.5 = AA accessibility standard for text
 *
 * @returns Boolean indicating if the token needs contrast enhancement (border).
 *
 * @example
 * // Basic usage for token logo contrast detection
 * const needsBorder = useTokenContrast(tokenImageUrl)
 * <TokenWrapper needsContrast={needsBorder}>
 *   <img src={tokenImageUrl} />
 * </TokenWrapper>
 *
 * @example
 * // With custom contrast threshold
 * const needsBorder = useTokenContrast(tokenImageUrl, 2.0) // More strict
 *
 * @example
 * // Typical contrast ratios:
 * // - White token (xDAI) on white background: ~1.06 (needs border)
 * // - Blue token (ETH) on white background: ~5.1 (no border needed)
 * // - White token on dark background: ~8.96 (no border needed)
 *
 * @performance
 * - Canvas operations: ~100 pixels sampled per image (negligible CPU impact)
 * - Cached per URL: Results persist until URL changes
 * - Theme reactive: Recalculates when theme.paper changes
 */
export function useTokenContrast(src: string | undefined, minContrastRatio = 1.5): boolean {
  const [needsContrast, setNeedsContrast] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    if (!src) {
      setNeedsContrast(false)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    const handleLoad = (): void => {
      try {
        const w = 10
        const h = 10
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Draw a small version of the image
        ctx.drawImage(img, 0, 0, w, h)

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, w, h)
        const data = imageData.data

        let totalR = 0
        let totalG = 0
        let totalB = 0
        let pixelCount = 0

        // Calculate average RGB values from opaque pixels
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const alpha = data[i + 3]

          // Only count opaque pixels
          if (alpha > 128) {
            totalR += r
            totalG += g
            totalB += b
            pixelCount++
          }
        }

        if (pixelCount > 0) {
          // Calculate average RGB values
          const avgR = Math.round(totalR / pixelCount)
          const avgG = Math.round(totalG / pixelCount)
          const avgB = Math.round(totalB / pixelCount)

          // Construct average token color
          const avgTokenColor = `rgba(${avgR}, ${avgG}, ${avgB}, 1)`

          // Get the actual paper background color from theme
          const paperColor = theme.paper

          // Calculate contrast ratio using color2k (W3C WCAG compliant)
          const contrastRatio = getContrast(avgTokenColor, paperColor)

          // Need contrast enhancement if contrast ratio is too low
          const needsEnhancement = contrastRatio < minContrastRatio

          setNeedsContrast(needsEnhancement)
        }
      } catch {
        // Fallback to false if canvas fails (e.g., CORS issues)
        setNeedsContrast(false)
      }
    }

    const handleError = (): void => {
      setNeedsContrast(false)
    }

    img.onload = handleLoad
    img.onerror = handleError
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, minContrastRatio, theme.paper])

  return needsContrast
}
