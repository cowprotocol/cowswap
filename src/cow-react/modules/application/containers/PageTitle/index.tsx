import { Helmet } from 'react-helmet'
import { APP_TITLE } from 'constants/index'

type PageTitleProps = {
  title?: string
}

export function PageTitle({ title }: PageTitleProps) {
  return (
    <Helmet>
      <title>
        {title ? `${title} - ` : ''}
        {APP_TITLE}
      </title>
    </Helmet>
  )
}
