import { ReactNode, useEffect } from 'react'

import { APP_TITLE } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'

type PageTitleProps = {
  title?: string
}

export function PageTitle({ title }: PageTitleProps): ReactNode {
  const { i18n } = useLingui()

  useEffect(() => {
    document.title = `${title ? `${title} - ` : ''}${i18n._(APP_TITLE)}`
  }, [i18n, title])

  return (
    <Helmet key={i18n.locale} defer={false}>
      <meta charSet="utf-8" />
    </Helmet>
  )
}
