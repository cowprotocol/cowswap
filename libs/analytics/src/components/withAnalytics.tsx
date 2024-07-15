import React from 'react'

import { CowAnalytics } from '../CowAnalytics'

/**
 * HoC to inject the cowAnalytics instance into a component
 *
 * @param cowAnalytics intance of CoW Analytics
 * @param WrappedComponent wrapped component that requires a cowAnalytics instance
 *
 * @returns a new component with the cowAnalytics instance injected
 */
export function withAnalytics<T>(
  cowAnalytics: CowAnalytics,
  WrappedComponent: React.ComponentType<T & { cowAnalytics: CowAnalytics }>
) {
  return function WrappedComponentWithAnalytics(props: T) {
    return <WrappedComponent {...(props as T)} cowAnalytics={cowAnalytics} />
  }
}
