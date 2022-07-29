import ReactAppzi from 'react-appzi'

export const isAppziEnabled =
  process.env.REACT_APP_FEEDBACK_ENABLED_DEV === 'true' || process.env.NODE_ENV === 'production'

export const FEEDBACK_KEY = process.env.REACT_APP_APPZI_FEEDBACK_KEY || 'f7591eca-72f7-4888-b15f-e7ff5fcd60cd'
export const NPS_KEY = process.env.REACT_APP_APPZI_FEEDBACK_KEY || '55872789-593b-4c6c-9e49-9b5c7693e90a'

const APPZI_TOKEN = process.env.REACT_APP_APPZI_TOKEN || '5ju0G'

// const DEFAULT_SETTINGS: AppziCustomSettings = {
//   tradeCount: 10,
//   userJustTraded: 'true',
// }

declare global {
  interface Window {
    appzi?: {
      openWidget: (key: string) => void
    }
    appziSettings: {
      data: AppziCustomSettings
    }
  }
}

interface AppziCustomSettings {
  tradeCount: number
  userJustTraded: 'true' | 'false'
}

function initialize() {
  if (isAppziEnabled) {
    // window.appziSettings = { data: DEFAULT_SETTINGS }
    // updateSettingsAppzi(DEFAULT_SETTINGS)

    ReactAppzi.initialize(APPZI_TOKEN)
    // // const appziScript = document.getElementById('react-appzi')
    // // if (appziScript) {
    // //   appziScript.onload = () => {
    // //     console.log('appZi ready')
    // //     // updateAppziSettings({
    // //     //   tradeCount: 0,
    // //     //   userJustTraded: 'true',
    // //     // })
    // //   }
    // // } else {
    // //   console.error('Unable to initialize AppZi settings: react-appzi script not present')
    // // }
  }
}

export function updateSettingsAppzi(settings: Partial<AppziCustomSettings>) {
  window.appziSettings.data = {
    ...window.appziSettings.data,
    ...settings,
  }
  console.log('window.appziSettings', window.appziSettings)
}

export function openFeedbackAppzi() {
  window.appzi?.openWidget(FEEDBACK_KEY)
}

export function openNpsAppzi() {
  window.appzi?.openWidget(NPS_KEY)
}

initialize()
