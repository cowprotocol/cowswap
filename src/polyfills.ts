import 'polyfill-object.fromentries'

import flat from 'array.prototype.flat'
import flatMap from 'array.prototype.flatmap'
import { isEns, isProd, isStaging } from 'utils/environments'

flat.shim()
flatMap.shim()

const originalConsole = window.console
// define a new console
const proxiedConsole = new Proxy(window.console, {
  get(obj, prop: keyof Console) {
    // show logs in all environments EXCEPT production & ens
    if (!isProd || !isEns || !isStaging) {
      return obj[prop]
    } else {
      return () => undefined
    }
  },
})

window.console = Object.assign({}, proxiedConsole, { force: originalConsole })
console = window.console
