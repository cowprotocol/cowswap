import { DEBUG_PROGRESS_BAR_QUERY_FLAG, isDebugProgressBarRouteEnabled } from './RoutesApp.utils'

describe('isDebugProgressBarRouteEnabled', () => {
  it('always enables the route in development', () => {
    expect(isDebugProgressBarRouteEnabled('', 'development')).toBe(true)
    expect(isDebugProgressBarRouteEnabled(`?${DEBUG_PROGRESS_BAR_QUERY_FLAG}=0`, 'development')).toBe(true)
  })

  it('enables the route in non-development only when the query flag is set', () => {
    expect(isDebugProgressBarRouteEnabled(`?${DEBUG_PROGRESS_BAR_QUERY_FLAG}=1`, 'preview')).toBe(true)
    expect(isDebugProgressBarRouteEnabled(`?${DEBUG_PROGRESS_BAR_QUERY_FLAG}=true`, 'preview')).toBe(false)
    expect(isDebugProgressBarRouteEnabled('', 'preview')).toBe(false)
  })
})
