import { LATEST_APP_DATA_VERSION } from '@cowprotocol/app-data'
import { MetadataApi } from '@cowprotocol/app-data'
import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { ALL_ENVIRONMENTS, EnvironmentName } from '@cowprotocol/common-utils'

import { getFullAppDataByEnv } from './fullAppData'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getAppData = (env: EnvironmentName | undefined) => JSON.parse(getFullAppDataByEnv(env))
const metadataApi = new MetadataApi()

describe('getFullAppDataByEnv', () => {
  ALL_ENVIRONMENTS.forEach((env) => {
    it(`[${env}] AppData is on its last version and has the right content`, () => {
      const appData = getAppData(env)
      expect(appData).toEqual({
        version: LATEST_APP_DATA_VERSION,
        appCode: DEFAULT_APP_CODE,
        environment: env,
        metadata: {},
      })
    })

    it(`[${env}] AppData is valid`, async () => {
      const appData = getAppData(env)
      const result = await metadataApi.validateAppDataDoc(appData)
      expect(result).toEqual({ success: true, errors: undefined })
    })
  })

  it(`[DEFAULT_FULL_APP_DATA] AppData is on its last version and has the right content`, () => {
    const appData = getAppData(undefined)
    expect(appData).toEqual({ version: LATEST_APP_DATA_VERSION, appCode: DEFAULT_APP_CODE, metadata: {} })
  })

  it(`[DEFAULT_FULL_APP_DATA] AppData is valid`, async () => {
    const appData = getAppData(undefined)

    const result = await metadataApi.validateAppDataDoc(appData)
    expect(result).toEqual({ success: true, errors: undefined })
  })
})
