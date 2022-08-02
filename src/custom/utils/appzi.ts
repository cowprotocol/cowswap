import ReactAppzi from 'react-appzi'

export const isAppziEnabled =
  process.env.REACT_APP_FEEDBACK_ENABLED_DEV === 'true' || process.env.NODE_ENV === 'production'

export const FEEDBACK_KEY = process.env.REACT_APP_APPZI_FEEDBACK_KEY || 'f7591eca-72f7-4888-b15f-e7ff5fcd60cd'
export const NPS_KEY = process.env.REACT_APP_APPZI_FEEDBACK_KEY || '55872789-593b-4c6c-9e49-9b5c7693e90a'

const APPZI_TOKEN = process.env.REACT_APP_APPZI_TOKEN || '5ju0G'

declare global {
  interface Window {
    appzi?: {
      openWidget: (key: string) => void
    }
    appziSettings: {
      userId: string
      data: AppziCustomSettings
    }
  }
}

interface AppziCustomSettings {
  userTradedOrWaitedForLong?: 'required-to-be-set'
}

function initialize() {
  if (isAppziEnabled) {
    ReactAppzi.initialize(APPZI_TOKEN)
  }
}

type AppziSettings = {
  userId?: string
  data?: Partial<AppziCustomSettings>
}

export function updateAppziSettings({ data = {}, userId = '' }: AppziSettings) {
  window.appziSettings = { ...(window.appziSettings || {}), data, userId }
}

export function openFeedbackAppzi() {
  console.debug(`Showing appzi feedback. Always!`)
  window.appzi?.openWidget(FEEDBACK_KEY)
}

export function openNpsAppzi() {
  console.debug(`Showing appzi NPS. Always!`)
  window.appzi?.openWidget(NPS_KEY)

  // Add a unique class based on NPS_KEY
  const appziRoot = document.querySelector("div[id^='appzi-wfo-']")
  if (appziRoot) {
    appziRoot.classList.add(`appzi-nps-${NPS_KEY}`)
  }
}

/**
 * Opening of the modal is delegated to Appzi
 * It'll display only if the trigger rules are met
 * Check https://portal.appzi.com/portals/5ju0G/configs/55872789-593b-4c6c-9e49-9b5c7693e90a/trigger
 */
export function openNpsAppziSometimes() {
  console.debug(`Showing appzi NPS. Sometimes...`)
  updateAppziSettings({ data: { userTradedOrWaitedForLong: 'required-to-be-set' } })
}

initialize()
