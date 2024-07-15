import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

import { CowAnalytics } from '../CowAnalytics'

function sendWebVitals(cowAnalytics: CowAnalytics, { name, delta, id }: Metric) {
  cowAnalytics.sendTiming('Web Vitals', name, Math.round(name === 'CLS' ? delta * 1000 : delta), id)
}

export class WebVitalsAnalytics {
  constructor(private cowAnalytics: CowAnalytics) {}

  reportWebVitals() {
    const sendMetric = (metric: Metric) => sendWebVitals(this.cowAnalytics, metric)

    getFCP(sendMetric)
    getFID(sendMetric)
    getLCP(sendMetric)
    getCLS(sendMetric)
  }
}
