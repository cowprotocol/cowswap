import { APP_TITLE } from '@cowprotocol/common-const'

import { Helmet } from 'react-helmet'

type PageTitleProps = {
  title?: string
}

export function PageTitle({ title }: PageTitleProps) {
  return (
    <Helmet defer={false}>
      <meta charSet="utf-8" />
      <title>
        {title ? `${title} - ` : ''}
        {APP_TITLE}
      </title>
    </Helmet>
  )
}
