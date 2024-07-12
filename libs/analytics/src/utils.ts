export function serviceWorkerAnalytics() {
  if (typeof window !== 'undefined') {
    const installed = Boolean(window.navigator.serviceWorker?.controller)
    const hit = Boolean((window as any).__isDocumentCached)
    const action = installed ? (hit ? 'Cache hit' : 'Cache miss') : 'Not installed'

    sendEvent({
      category: Category.SERVICE_WORKER,
      nonInteraction: true,
      action,
    })
  }
}
