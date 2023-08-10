import { UpdateWidgetCallback } from '../cowSwapWidget'

// eslint-disable-next-line max-lines-per-function
export function Settings(updateWidget: UpdateWidgetCallback) {
  const appSettingsForm = document.getElementById('appSettingsForm') as HTMLFormElement
  const tradeSettingsForm = document.getElementById('tradeSettingsForm') as HTMLFormElement

  function applySettings() {
    const tradeSettingsState = Object.fromEntries(new FormData(tradeSettingsForm) as never)
    const appSettingsState = Object.fromEntries(new FormData(appSettingsForm) as never)

    updateWidget({
      urlParams: {
        env: tradeSettingsState['env'],
        chainId: tradeSettingsState['chainId'],
        theme: tradeSettingsState['theme'],
        tradeType: tradeSettingsState['tradeType'],
        tradeAssets: {
          sell: {
            asset: tradeSettingsState['tradeAssets.sell.asset'],
            amount: tradeSettingsState['tradeAssets.sell.amount'],
          },
          buy: {
            asset: tradeSettingsState['tradeAssets.buy.asset'],
            amount: tradeSettingsState['tradeAssets.buy.amount'],
          },
        },
      },
      appParams: {
        logoUrl: appSettingsState['logoUrl'],
        hideLogo: appSettingsState['hideLogo'],
        hideNetworkSelector: appSettingsState['hideNetworkSelector'],
      },
    })
  }

  ;['submit', 'change'].forEach((eventName) => {
    ;[tradeSettingsForm, appSettingsForm].forEach((form) => {
      form.addEventListener(eventName, (event) => {
        event.preventDefault()
        applySettings()
      })
    })
  })
}
