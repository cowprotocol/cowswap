import { useState, useEffect } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'

import { getContrast } from 'color2k'

// Canvas sampling dimensions for token contrast analysis
// Small sample size for performance while maintaining accuracy
const SAMPLE_WIDTH = 10
const SAMPLE_HEIGHT = 10

// Alpha threshold for opacity filtering (0-255 range)
// Only pixels with alpha > 128 (50% opacity) are considered for contrast calculation
const ALPHA_THRESHOLD = 128

// Cache for token contrast analysis results
// Key: image URL + theme paper color, Value: boolean indicating if contrast enhancement is needed
const contrastCache = new Map<string, boolean>()
const MAX_CACHE_SIZE = 100 // Prevent memory leaks by limiting cache size

/**
 * Efficiently construct RGBA color string
 * More performant than template literals for repeated color construction
 */
function constructRgba(r: number, g: number, b: number, a: number): string {
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}

/**
 * Development-only logging for token contrast analysis
 * Disabled in production to avoid log noise
 */
function logTokenContrastError(message: string, context: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, context)
  }
}

function logTokenContrastWarning(message: string, context: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message, context)
  }
}

/**
 * Analyze image pixel data to calculate average RGB values from opaque pixels
 */
function analyzeImagePixels(imageData: ImageData): { avgR: number; avgG: number; avgB: number } | null {
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

    // Only count opaque pixels (above 50% opacity)
    if (alpha > ALPHA_THRESHOLD) {
      totalR += r
      totalG += g
      totalB += b
      pixelCount++
    }
  }

  if (pixelCount === 0) return null

  return {
    avgR: Math.round(totalR / pixelCount),
    avgG: Math.round(totalG / pixelCount),
    avgB: Math.round(totalB / pixelCount)
  }
}

/**
 * Process canvas to extract image color information and calculate contrast
 */
function processCanvasForContrast(
  img: HTMLImageElement,
  paperColor: string,
  minContrastRatio: number
): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_WIDTH
  canvas.height = SAMPLE_HEIGHT

  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  // Draw a small version of the image
  ctx.drawImage(img, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT)

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT)
  
  // Analyze pixel data
  const pixelAnalysis = analyzeImagePixels(imageData)
  if (!pixelAnalysis) return false

  const { avgR, avgG, avgB } = pixelAnalysis

  // Construct average token color
  const avgTokenColor = constructRgba(avgR, avgG, avgB, 1)

  // Calculate contrast ratio using color2k (W3C WCAG compliant)
  const contrastRatio = getContrast(avgTokenColor, paperColor)

  // Need contrast enhancement if contrast ratio is too low
  return contrastRatio < minContrastRatio
}

/**
 * Manage cache operations for contrast results
 */
function manageContrastCache(cacheKey: string, result: boolean): void {
  // Implement LRU-like behavior by clearing oldest entries when cache is full
  if (contrastCache.size >= MAX_CACHE_SIZE) {
    const firstKey = contrastCache.keys().next().value
    if (firstKey) {
      contrastCache.delete(firstKey)
    }
  }
  contrastCache.set(cacheKey, result)
}

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
 * - Canvas operations: 10x10 pixels sampled per image (negligible CPU impact)
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

    // Create cache key including theme to handle light/dark mode switches
    const cacheKey = `${src}:${theme.paper}`
    
    // Check if result is already cached (before creating Image object)
    if (contrastCache.has(cacheKey)) {
      setNeedsContrast(contrastCache.get(cacheKey)!)
      return
    }

    // Track if this effect has been cancelled to prevent race conditions
    let isCancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const handleLoad = (): void => {
      // Prevent processing if effect was cancelled (component unmounted or deps changed)
      if (isCancelled) return

      try {
        // Process canvas and calculate contrast
        const needsEnhancement = processCanvasForContrast(img, theme.paper, minContrastRatio)

        // Cache the result for future use
        manageContrastCache(cacheKey, needsEnhancement)
        setNeedsContrast(needsEnhancement)
      } catch (error) {
        // Log the error for debugging purposes (development only)
        logTokenContrastError('Error processing canvas for token contrast:', {
          src: src?.substring(src.lastIndexOf('/') + 1),
          error: error instanceof Error ? error.message : error
        })
        // Fallback to false if canvas fails (e.g., CORS issues, canvas creation failures)
        setNeedsContrast(false)
      }
    }

    const handleError = (): void => {
      // Prevent processing if effect was cancelled
      if (isCancelled) return

      logTokenContrastWarning('Failed to load token image for contrast analysis:', {
        src: src?.substring(src.lastIndexOf('/') + 1)
      })
      setNeedsContrast(false)
    }

    img.onload = handleLoad
    img.onerror = handleError
    img.src = src

    return () => {
      // Cancel this effect to prevent race conditions
      isCancelled = true
      // Clean up event listeners
      img.onload = null
      img.onerror = null
      // Note: We cannot abort image loading, but we prevent processing stale results
    }
  }, [src, minContrastRatio, theme.paper])

  return needsContrast
}
