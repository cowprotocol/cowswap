import { isDev, isStaging, isProd, isEns, isPreStaging } from './environments'

function getAnalyticsId(): string | undefined {
  if (isDev || isPreStaging) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_DEV || 'UA-190948266-3'
  } else if (isStaging) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_STAGING || 'UA-190948266-4'
  } else if (isEns) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_ENS || 'UA-190948266-5'
  } else if (isProd) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_PROD || 'UA-190948266-1'
  }

  // Undefined by default
  return undefined
}

export const analyticsId = getAnalyticsId()
