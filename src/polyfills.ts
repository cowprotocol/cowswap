import 'polyfill-object.fromentries'
import 'text-encoding-polyfill'

import flat from 'array.prototype.flat'
import flatMap from 'array.prototype.flatmap'

flat.shim()
flatMap.shim()
