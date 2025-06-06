import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

import { CowAnalytics } from '../CowAnalytics'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function sendWebVitals(cowAnalytics: CowAnalytics, { name, delta, id }: Metric) {
  cowAnalytics.sendTiming('Web Vitals', name, Math.round(name === 'CLS' ? delta * 1000 : delta), id)
}

export class WebVitalsAnalytics {
  constructor(private cowAnalytics: CowAnalytics) {}

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  reportWebVitals() {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const sendMetric = (metric: Metric) => sendWebVitals(this.cowAnalytics, metric)

    getFCP(sendMetric)
    getFID(sendMetric)
    getLCP(sendMetric)
    getCLS(sendMetric)
  }
}
