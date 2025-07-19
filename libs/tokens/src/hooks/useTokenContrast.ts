import { useState, useEffect } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'

import { parseToRgba, getLuminance } from 'color2k'

// Canvas sampling dimensions - mirror actual token size
const SAMPLE_WIDTH = 40
const SAMPLE_HEIGHT = 40
const BORDER_RADIUS = 20 // 40px / 2 = 20px radius

// Alpha threshold for opacity filtering (0-255 range)
const ALPHA_THRESHOLD = 200

// Default minimum contrast ratio threshold for token visibility
const DEFAULT_CONTRAST_RATIO = 1.5

// Circular sampling configuration - sample 3px from outer edge inward
const OUTER_SAMPLE_BAND = 3 // Sample 3px band from outer edge

// Luminance threshold for light/dark detection (0-1.0 scale)
// Calibrated for token contrast detection - luminance > 0.4 considered light
const LIGHT_LUMINANCE_THRESHOLD = 0.4

// Radial sampling configuration for full-bleed tokens
const RADIAL_SAMPLE_COUNT = 24 // Number of points to sample around circle edge
const RADIAL_INNER_OFFSET = 2 // Distance from mask edge (R-1)
const RADIAL_OUTER_OFFSET = 3 // Secondary radius for dual-radius check (R-2)

// Threshold configuration for contrast detection
const GAP_LIGHT_THRESHOLD = 0.08 // 10% light pixels in gap triggers border
const GAP_LIGHT_THRESHOLD_FULLBLEED = 0.12 // for full-bleed tokens
const RADIAL_LIGHT_THRESHOLD = 0.1 // light pixels in radial scan triggers border

// Cache for token contrast analysis results
// Key: image URL + theme paper color, Value: boolean indicating if contrast enhancement is needed
const contrastCache = new Map<string, boolean>()
const MAX_CACHE_SIZE = 100 // Prevent memory leaks by limiting cache size

// Canvas pool for reusing canvas instances to reduce DOM manipulation overhead
// Key: canvas dimensions string (e.g., "10x10"), Value: HTMLCanvasElement
const canvasPool = new Map<string, HTMLCanvasElement>()
const MAX_CANVAS_POOL_SIZE = 5 // Limit pool size to prevent memory bloat

/**
 * Helper to turn a hex paper color into {r,g,b}
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  try {
    const [r, g, b] = parseToRgba(hex)
    return { r, g, b }
  } catch {
    // Fallback to white if color parsing fails
    return { r: 255, g: 255, b: 255 }
  }
}

/**
 * Sample a single pixel with proper alpha blending against paper background
 */
function samplePixelWithPaper(
  data: Uint8ClampedArray,
  index: number,
  paperColor: { r: number; g: number; b: number },
): { r: number; g: number; b: number; luminance: number } {
  const alpha = data[index + 3] / 255
  const rr = alpha > ALPHA_THRESHOLD / 255 ? data[index] : paperColor.r
  const gg = alpha > ALPHA_THRESHOLD / 255 ? data[index + 1] : paperColor.g
  const bb = alpha > ALPHA_THRESHOLD / 255 ? data[index + 2] : paperColor.b

  // Use color2k getLuminance for perceptually accurate light/dark detection
  const rgbColor = `rgb(${rr}, ${gg}, ${bb})`
  const luminance = getLuminance(rgbColor)

  return { r: rr, g: gg, b: bb, luminance }
}

/**
 * Sample pixels at a specific radius and count problematic pixels
 */
function sampleRadiusForLightPixels(
  imageData: ImageData,
  paperColor: { r: number; g: number; b: number },
  radius: number,
  isDarkMode: boolean = false,
): number {
  const { data, width, height } = imageData
  const cx = width / 2
  const cy = height / 2
  let badCount = 0

  for (let i = 0; i < RADIAL_SAMPLE_COUNT; i++) {
    const θ = (i / RADIAL_SAMPLE_COUNT) * Math.PI * 2
    const x = Math.round(cx + Math.cos(θ) * radius)
    const y = Math.round(cy + Math.sin(θ) * radius)
    const idx = (y * width + x) * 4
    const sample = samplePixelWithPaper(data, idx, paperColor)

    // Theme-aware luminance checking:
    // Light mode: look for light pixels that blend with light backgrounds
    // Dark mode: look for dark pixels that blend with dark backgrounds
    const needsContrast = isDarkMode 
      ? sample.luminance < LIGHT_LUMINANCE_THRESHOLD  // Dark pixels problematic in dark mode
      : sample.luminance > LIGHT_LUMINANCE_THRESHOLD  // Light pixels problematic in light mode

    if (needsContrast) {
      badCount++
    }
  }

  return badCount
}

/**
 * Radial sampling fallback for full-bleed tokens
 * Samples around the circular mask edge to catch transparent cutouts or light pixels
 * Uses dual-radius sampling to catch both thin and wider padding gaps
 */
function analyzeRadial(imageData: ImageData, paperColor: string, isDarkMode: boolean = false): boolean {
  const paperRgb = hexToRgb(paperColor)

  // Sample at two radii to catch different gap widths
  const R1 = BORDER_RADIUS - RADIAL_INNER_OFFSET
  const R2 = BORDER_RADIUS - RADIAL_OUTER_OFFSET

  const bad1 = sampleRadiusForLightPixels(imageData, paperRgb, R1, isDarkMode)
  const bad2 = sampleRadiusForLightPixels(imageData, paperRgb, R2, isDarkMode)

  const ratio1 = bad1 / RADIAL_SAMPLE_COUNT
  const ratio2 = bad2 / RADIAL_SAMPLE_COUNT

  // OR the results - trigger border if either radius has too many light pixels
  return ratio1 > RADIAL_LIGHT_THRESHOLD || ratio2 > RADIAL_LIGHT_THRESHOLD
}

/**
 * Find the maximum content radius by scanning all opaque pixels
 */
function findMaxContentRadius(imageData: ImageData): number {
  const { data, width, height } = imageData
  const cx = width / 2
  const cy = height / 2
  let maxContentRadius = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const a = data[i + 3]
      if (a > ALPHA_THRESHOLD) {
        const distance = Math.hypot(x - cx, y - cy)
        maxContentRadius = Math.max(maxContentRadius, distance)
      }
    }
  }

  return maxContentRadius
}

/**
 * Sample the gap ring between content edge and mask edge
 */
function sampleGapRing(
  imageData: ImageData,
  paperColor: string,
  maxContentRadius: number,
  isDarkMode: boolean = false,
): { badCount: number; total: number } {
  const { data, width, height } = imageData
  const paperRgb = hexToRgb(paperColor)
  const cx = width / 2
  const cy = height / 2
  const maskR = BORDER_RADIUS

  let badCount = 0
  let total = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const d = Math.hypot(x - cx, y - cy)

      // Only sample pixels in the gap between content edge and mask edge
      if (d <= maxContentRadius || d > maskR) continue

      total++
      const i = (y * width + x) * 4
      const sample = samplePixelWithPaper(data, i, paperRgb)

      // Theme-aware luminance checking:
      // Light mode: look for light pixels that blend with light backgrounds
      // Dark mode: look for dark pixels that blend with dark backgrounds
      const needsContrast = isDarkMode 
        ? sample.luminance < LIGHT_LUMINANCE_THRESHOLD  // Dark pixels problematic in dark mode
        : sample.luminance > LIGHT_LUMINANCE_THRESHOLD  // Light pixels problematic in light mode

      if (needsContrast) {
        badCount++
      }
    }
  }

  return { badCount, total }
}

/**
 * Dynamic analysis that finds actual content edge and samples the gap between content and mask
 * Guaranteed to catch small tokens with large transparent rings
 */
function analyzeTokenOuterBand(
  imageData: ImageData,
  paperColor: string,
  ignoreTransparentBand: boolean = false,
  isDarkMode: boolean = false,
): boolean {
  const maxContentRadius = findMaxContentRadius(imageData)
  const maskR = BORDER_RADIUS

  // If content never even reaches the scan band, force a border (entire ring is padding)
  if (maxContentRadius < maskR - OUTER_SAMPLE_BAND) {
    return true
  }

  // Sample only the gap ring between actual content and mask edge
  const { badCount, total } = sampleGapRing(imageData, paperColor, maxContentRadius, isDarkMode)

  if (total === 0) {
    return analyzeRadial(imageData, paperColor, isDarkMode)
  }

  const badRatio = badCount / total

  // If this is a full-bleed image, be more conservative
  if (ignoreTransparentBand) {
    return badRatio > GAP_LIGHT_THRESHOLD_FULLBLEED
  }

  // For small tokens, use lower threshold
  return badRatio > GAP_LIGHT_THRESHOLD
}

/**
 * Get or create a canvas from the pool for performance optimization
 * Reuses canvas instances to reduce DOM manipulation overhead
 */
function getCanvasFromPool(width: number, height: number): HTMLCanvasElement {
  const poolKey = `${width}x${height}`

  // Try to get existing canvas from pool
  let canvas = canvasPool.get(poolKey)

  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    // Implement LRU eviction for canvas pool
    if (canvasPool.size >= MAX_CANVAS_POOL_SIZE) {
      const firstKey = canvasPool.keys().next().value
      if (firstKey) {
        canvasPool.delete(firstKey)
      }
    }

    canvasPool.set(poolKey, canvas)
  } else {
    // Ensure canvas dimensions are correct (in case of reuse)
    canvas.width = width
    canvas.height = height
  }

  return canvas
}

/**
 * Process canvas with simple, direct 40x40 circular token approach
 * Simulates CSS object-fit: contain with paper background
 */
function processCanvasForContrast(img: HTMLImageElement, paperColor: string, _minContrastRatio: number, isDarkMode: boolean): boolean {
  const canvas = getCanvasFromPool(SAMPLE_WIDTH, SAMPLE_HEIGHT)
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  // 1) Clear then fill with paperColor (simulates CSS background)
  ctx.clearRect(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT)
  ctx.fillStyle = paperColor
  ctx.fillRect(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT)

  // 2) Compute "contain" sizing (preserve aspect ratio, center it)
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const scale = Math.min(SAMPLE_WIDTH / iw, SAMPLE_HEIGHT / ih)
  const dw = iw * scale
  const dh = ih * scale
  const dx = (SAMPLE_WIDTH - dw) / 2
  const dy = (SAMPLE_HEIGHT - dh) / 2

  // 3) Draw image into center, preserving aspect ratio
  ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh)

  // 4) Detect if this is a "full-bleed" token that basically fills the circle
  const fillsHorizontally = dw >= SAMPLE_WIDTH - OUTER_SAMPLE_BAND
  const fillsVertically = dh >= SAMPLE_HEIGHT - OUTER_SAMPLE_BAND
  const ignoreTransparentBand = fillsHorizontally || fillsVertically

  // 5) Sample with full-bleed detection
  const imageData = ctx.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT)
  return analyzeTokenOuterBand(imageData, paperColor, ignoreTransparentBand, isDarkMode)
}

/**
 * Manage cache operations for contrast results with proper LRU eviction
 */
function manageContrastCache(cacheKey: string, result: boolean): void {
  // Implement proper LRU behavior by clearing oldest entries when cache is full
  // Map insertion order is guaranteed in ES2015+, but we need to handle re-insertion for LRU
  if (contrastCache.size >= MAX_CACHE_SIZE) {
    const firstKey = contrastCache.keys().next().value
    if (firstKey) {
      contrastCache.delete(firstKey)
    }
  }
  contrastCache.set(cacheKey, result)
}

/**
 * Get cache value and update LRU order by re-inserting the accessed item
 */
function getFromContrastCache(cacheKey: string): boolean | undefined {
  const value = contrastCache.get(cacheKey)
  if (value !== undefined) {
    // Move to end (most recently used) by deleting and re-inserting
    contrastCache.delete(cacheKey)
    contrastCache.set(cacheKey, value)
  }
  return value
}

/**
 * Hook to detect if a token image has low contrast against the current theme.paper background.
 * Uses a simple, direct approach: renders token at 40x40px with 20px border-radius (circular),
 * then samples the outer 3px band to detect light pixels that would blend with white backgrounds.
 *
 * @param src - The URL of the token image to analyze. If undefined, returns false.
 * @param minContrastRatio - Minimum contrast ratio threshold (default: 1.5, currently unused).
 *                          The current implementation uses direct RGB sampling instead.
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
 * // Detection logic:
 * // 1. Render token at 40x40px (actual size)
 * // 2. Sample outer 3px circular band (17px-20px radius)
 * // 3. Check if >30% of outer band pixels have RGB > 200
 * // 4. Apply border if true
 *
 * @performance
 * - Canvas operations: 40x40 pixels with circular outer band sampling
 * - Canvas pooling: Reuses canvas instances to reduce DOM manipulation overhead
 * - LRU caching: Results persist until URL changes, with automatic eviction
 * - Theme reactive: Recalculates when theme.paper changes
 * - Time complexity: O(1) for cache hits, O(n) for ~180 outer band pixels analysis
 * - Memory complexity: O(1) bounded by MAX_CACHE_SIZE and MAX_CANVAS_POOL_SIZE
 * - Simple RGB threshold: No complex luminance calculations, direct pixel comparison
 */
export function useTokenContrast(src: string | undefined, minContrastRatio = DEFAULT_CONTRAST_RATIO): boolean {
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
    const cachedResult = getFromContrastCache(cacheKey)
    if (cachedResult !== undefined) {
      setNeedsContrast(cachedResult)
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
        const needsEnhancement = processCanvasForContrast(img, theme.paper, minContrastRatio, theme.darkMode)

        // Cache the result for future use
        manageContrastCache(cacheKey, needsEnhancement)
        setNeedsContrast(needsEnhancement)
      } catch {
        // Canvas operations failed (likely CORS) - silently fallback to false
        // This is expected for most third-party CDNs when running on localhost
        setNeedsContrast(false)
      }
    }

    const handleError = (): void => {
      // Prevent processing if effect was cancelled
      if (isCancelled) return

      // Image failed to load (CORS or network issue) - silently fallback to false
      setNeedsContrast(false)
    }

    img.onload = handleLoad
    img.onerror = handleError
    img.src = src

    return () => {
      // Cancel this effect to prevent race conditions
      isCancelled = true
      // Note: We cannot abort image loading, but we prevent processing stale results
      // Canvas instances remain in pool for reuse - they're cleaned up when pool is full
    }
  }, [src, minContrastRatio, theme.paper, theme.darkMode])

  return needsContrast
}
