const MAX_APP_ID = 255
const DEFAULT_DEV_APP_ID = 1
const IS_DEV = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

function getAppId(config) {
  const appId = Number(process.env.APP_ID || config.appId || (IS_DEV ? DEFAULT_DEV_APP_ID : undefined))

  let error
  if (!appId) {
    error = 'The appId config, or APP_ID environment variable is required'
  } else {
    if (!Number.isInteger(appId) || appId < 1 || appId > MAX_APP_ID) {
      error = `appId config or APP_ID environment variable isn't valid. Expected a positive integer <= ${MAX_APP_ID}, got ${appId}`
    }
  }

  if (error) {
    throw new Error(error + '. Read more in https://github.com/gnosis/gp-v1-ui/wiki/App-Ids-for-Forks')
  }

  return appId
}

function overrideEnvConfig(config) {
  return {
    ...config,
    appId: getAppId(config),
  }
}

module.exports = overrideEnvConfig
