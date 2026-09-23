import { ReactNode } from 'react'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { SettingsBox } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

// ponytail: TESTING ONLY (fast-path preview). Lets testers switch the quote/order backend between
// prod (api.cow.fi) and staging (barn.api.cow.fi) by flipping the existing forceProdApi/
// forceStagingApi localStorage flags + reloading. Remove together with the fast-path preview.
export function BackendToggle(): ReactNode {
  const isProd = !isBarnBackendEnv

  const toggle = (): void => {
    if (isProd) {
      localStorage.setItem('forceStagingApi', '1')
      localStorage.removeItem('forceProdApi')
    } else {
      localStorage.setItem('forceProdApi', '1')
      localStorage.removeItem('forceStagingApi')
    }
    window.location.reload()
  }

  return (
    <SettingsBox
      id="toggle-backend-env-button"
      title={t`Use Prod backend`}
      tooltip={
        isProd
          ? t`Quotes and orders go to api.cow.fi (prod). Turn off to use barn.api.cow.fi (staging). Reloads the page.`
          : t`Quotes and orders go to barn.api.cow.fi (staging). Turn on to use api.cow.fi (prod). Reloads the page.`
      }
      checked={isProd}
      toggle={toggle}
    />
  )
}
