import { APP_TITLE } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'

type PageTitleProps = {
  title?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PageTitle({ title }: PageTitleProps) {
  const { i18n } = useLingui()

  return (
    <Helmet defer={false}>
      <meta charSet="utf-8" />
      <title>
        {title ? `${title} - ` : ''}
        {i18n._(APP_TITLE)}
      </title>
    </Helmet>
  )
}
