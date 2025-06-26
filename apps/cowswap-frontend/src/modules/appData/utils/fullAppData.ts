import { EnvironmentName, environmentName } from '@cowprotocol/common-utils'

import { AppDataInfo } from '../types'
import { toKeccak256 } from '../utils/buildAppData'

const DEFAULT_FULL_APP_DATA = '{"version":"1.4.0","appCode":"CoW Swap","metadata":{}}'

let appData: AppDataInfo = (() => {
  const fullAppData = getFullAppDataByEnv(environmentName)
  return _fromFullAppData(fullAppData)
})()

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getAppData() {
  return appData
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function updateFullAppData(fullAppData: string | undefined) {
  if (fullAppData) {
    appData = _fromFullAppData(fullAppData)
  }
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function getFullAppDataByEnv(environmentName: EnvironmentName | undefined): string {
  switch (environmentName) {
    case 'production':
      return process.env.REACT_APP_FULL_APP_DATA_PRODUCTION || DEFAULT_FULL_APP_DATA

    case 'ens':
      return process.env.REACT_APP_FULL_APP_DATA_ENS || DEFAULT_FULL_APP_DATA

    case 'barn':
      return process.env.REACT_APP_FULL_APP_DATA_BARN || DEFAULT_FULL_APP_DATA

    case 'staging':
      return process.env.REACT_APP_FULL_APP_DATA_STAGING || DEFAULT_FULL_APP_DATA

    case 'pr':
      return process.env.REACT_APP_FULL_APP_DATA_PR || DEFAULT_FULL_APP_DATA

    case 'development':
      return process.env.REACT_APP_FULL_APP_DATA_DEVELOPMENT || DEFAULT_FULL_APP_DATA

    case 'local':
      return process.env.REACT_APP_FULL_APP_DATA_LOCAL || DEFAULT_FULL_APP_DATA

    default:
      break
  }
  return DEFAULT_FULL_APP_DATA
}

function _fromFullAppData(fullAppData: string): AppDataInfo {
  return {
    doc: JSON.parse(fullAppData),
    fullAppData: fullAppData,
    appDataKeccak256: toKeccak256(fullAppData),
  }
}
