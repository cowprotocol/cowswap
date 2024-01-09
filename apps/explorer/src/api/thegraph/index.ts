import { TheGraphApi } from './TheGraphApi'
import { TheGraphApiProxy } from './TheGraphApiProxy'

export function createTheGraphApi(): TheGraphApi {
  const { type, config } = CONFIG.theGraphApi
  let theGraphApi: TheGraphApi
  switch (type) {
    case 'the-graph':
      theGraphApi = new TheGraphApiProxy(config)
      break

    default:
      throw new Error('Unknown implementation for TheGraphApi: ' + type)
  }

  window['theGraphApi'] = theGraphApi
  return theGraphApi
}
