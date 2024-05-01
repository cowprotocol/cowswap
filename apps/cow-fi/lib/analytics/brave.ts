export function initBraveAnalytics() {
  const params = new URLSearchParams(window.location.search)

  // Put UTM labels from query-string to cookies
  if (params) {
    const utm_source = params.get('utm_source')
    const utm_medium = params.get('utm_medium')
    const utm_campaign = params.get('utm_campaign')

    if (utm_source) {
      document.cookie = `source=${utm_source};domain=.cow.fi;path=/`
    }

    if (utm_medium) {
      document.cookie = `medium=${utm_medium};domain=.cow.fi;path=/`
    }

    if (utm_campaign) {
      document.cookie = `campaign=${utm_campaign};domain=.cow.fi;path=/`
    }
  }
}
