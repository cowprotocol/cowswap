import React from 'react'

// Simple render tracking without hook interference
const renderCounts = new Map<string, number>()
const slowComponents = new Set<string>()

const logComponentRender = (componentName: string, duration?: number): void => {
  const count = renderCounts.get(componentName) || 0
  renderCounts.set(componentName, count + 1)

  if (duration !== undefined) {
    if (duration > 16) {
      slowComponents.add(componentName)
      console.warn(`[PERF] 🐌 Slow render: ${componentName} took ${duration.toFixed(2)}ms (render #${count + 1})`)
    } else {
      console.log(`[PERF] ⚡ <${componentName}> rendered in ${duration.toFixed(2)}ms (render #${count + 1})`)
    }
  } else {
    console.log(`[PERF] 🔄 <${componentName}> re-rendered (count: ${count + 1})`)
  }
}

const logPerformanceSummary = (): void => {
  console.group('[PERF] 📊 Performance Summary')
  console.log('🔄 Render counts:', Object.fromEntries(renderCounts))
  if (slowComponents.size > 0) {
    console.warn('🐌 Slow components:', Array.from(slowComponents))
  }
  console.groupEnd()
}

type WebVitalsMetric = {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  entries: PerformanceEntry[]
}

type WebVitalsCallback = (callback: (metric: WebVitalsMetric) => void) => void

const setupFCP = (onFCP: WebVitalsCallback | undefined): void => {
  if (onFCP && typeof onFCP === 'function') {
    onFCP((metric: WebVitalsMetric) => {
      console.log('[PERF] 📊 FCP (First Contentful Paint):', {
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id,
      })
    })
  }
}

const setupLCP = (onLCP: WebVitalsCallback | undefined): void => {
  if (onLCP && typeof onLCP === 'function') {
    onLCP((metric: WebVitalsMetric) => {
      console.log('[PERF] 📊 LCP (Largest Contentful Paint):', {
        value: Math.round(metric.value),
        rating: metric.rating,
        entries: metric.entries.length,
        id: metric.id,
      })
    })
  }
}

const setupINP = (onINP: WebVitalsCallback | undefined): void => {
  if (onINP && typeof onINP === 'function') {
    onINP((metric: WebVitalsMetric) => {
      console.log('[PERF] 📊 INP (Interaction to Next Paint):', {
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id,
      })
      if (metric.value > 200) {
        console.warn('[PERF] ⚠️ Poor INP detected - investigate slow interactions')
      }
    })
  }
}

const setupCLS = (onCLS: WebVitalsCallback | undefined): void => {
  if (onCLS && typeof onCLS === 'function') {
    onCLS((metric: WebVitalsMetric) => {
      console.log('[PERF] 📊 CLS (Cumulative Layout Shift):', {
        value: metric.value.toFixed(3),
        rating: metric.rating,
        entries: metric.entries.length,
        id: metric.id,
      })
    })
  }
}

const setupTTFB = (onTTFB: WebVitalsCallback | undefined): void => {
  if (onTTFB && typeof onTTFB === 'function') {
    onTTFB((metric: WebVitalsMetric) => {
      console.log('[PERF] 📊 TTFB (Time to First Byte):', {
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id,
      })
    })
  }
}

const setupWebVitalsHandlers = (
  onFCP: WebVitalsCallback | undefined,
  onLCP: WebVitalsCallback | undefined,
  onINP: WebVitalsCallback | undefined,
  onCLS: WebVitalsCallback | undefined,
  onTTFB: WebVitalsCallback | undefined,
): void => {
  setupFCP(onFCP)
  setupLCP(onLCP)
  setupINP(onINP)
  setupCLS(onCLS)
  setupTTFB(onTTFB)
}

const initWebVitals = (): void => {
  try {
    console.log('[PERF] ⏳ Loading web-vitals...')

    Promise.all([
      import('web-vitals').then((m) => m.onFCP),
      import('web-vitals').then((m) => m.onLCP),
      import('web-vitals').then((m) => m.onINP),
      import('web-vitals').then((m) => m.onCLS),
      import('web-vitals').then((m) => m.onTTFB),
    ])
      .then(([onFCP, onLCP, onINP, onCLS, onTTFB]) => {
        setupWebVitalsHandlers(onFCP, onLCP, onINP, onCLS, onTTFB)
        console.log('[PERF] ✅ Web Vitals v5.0.3 monitoring active - Core metrics available')
      })
      .catch((error) => {
        console.error('[PERF] ❌ Failed to load web-vitals:', error)
        console.log('[PERF] 💡 Fallback: Manual performance measurement available via measureInteraction()')
      })
  } catch (error) {
    console.error('[PERF] ❌ Failed to initialize web-vitals:', error)
  }
}

export const initPerformanceMonitoring = (): void => {
  if (import.meta.env.DEV) {
    console.log('[PERF] 🔧 Initializing simple performance monitoring...')

    // 1. Initialize Web Vitals v5.0.3
    initWebVitals()

    // 2. Set up performance summary logging
    setTimeout(() => logPerformanceSummary(), 10000) // Log summary after 10s
    setInterval(() => logPerformanceSummary(), 30000) // Then every 30s

    console.log('[PERF] 📋 Performance Tools Active:')
    console.log('[PERF]   • Simple render tracking: ✅ Active - No hook interference')
    console.log('[PERF]   • web-vitals v5.0.3: ✅ Active - Core Web Vitals (FCP, LCP, INP, CLS, TTFB)')
    console.log('[PERF]   • eslint-plugin-react-perf: ✅ Available - Run yarn lint for anti-patterns')
    console.log('[PERF]   • Manual profiling: ✅ Use useRenderCount() and createProfiler()')
    console.log('[PERF] 💡 Track components with: trackComponent(MyComponent) or useRenderCount("MyComponent")')
  }
}

export const useRenderCount = (componentName: string): number => {
  const renderCountRef = React.useRef(0)

  if (import.meta.env.DEV) {
    renderCountRef.current += 1
    logComponentRender(componentName)
  }

  return renderCountRef.current
}

export const createProfiler = (id: string) => {
  if (!import.meta.env.DEV) {
    return ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
  }

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      React.Profiler,
      {
        id,
        onRender: (profilerID: string, _phase: string, actualDuration: number) => {
          logComponentRender(profilerID, actualDuration)
        },
      },
      children,
    )
}

// Helper to manually trigger INP-like measurement for specific interactions
export const measureInteraction = (name: string, fn: () => void): void => {
  if (!import.meta.env.DEV) {
    fn()
    return
  }

  const start = performance.now()
  console.log(`[PERF] 🎯 Starting interaction: ${name}`)

  fn()

  requestAnimationFrame(() => {
    const end = performance.now()
    const duration = end - start
    console.log(`[PERF] 🎯 Interaction "${name}" completed in ${duration.toFixed(2)}ms`)

    if (duration > 50) {
      console.warn(`[PERF] ⚠️ Slow interaction detected: ${name} took ${duration.toFixed(2)}ms`)
    }
  })
}

// Helper to mark a component for simple render tracking
export const trackComponent = <T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  displayName?: string,
): React.ComponentType<T> => {
  if (!import.meta.env.DEV) return Component

  const name = displayName || Component.displayName || Component.name || 'Unknown'

  return React.memo((props: T) => {
    logComponentRender(name)
    return React.createElement(Component, props)
  })
}

// Helper to get current performance stats
export const getPerformanceStats = (): {
  renderCounts: Record<string, number>
  slowComponents: string[]
  totalRenders: number
} | null => {
  if (!import.meta.env.DEV) return null

  return {
    renderCounts: Object.fromEntries(renderCounts),
    slowComponents: Array.from(slowComponents),
    totalRenders: Array.from(renderCounts.values()).reduce((sum, count) => sum + count, 0),
  }
}
