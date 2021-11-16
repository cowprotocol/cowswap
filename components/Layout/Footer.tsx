import Link from 'next/link'

import { useRouter } from 'next/router'
import cn from 'classnames'

export default function Footer() {
  const { locale, asPath } = useRouter()

  return (
    <footer>
      Languages:
      <Link href={asPath} locale="en">
        <a className={cn({
          active: locale === "en"
        })}>English</a>
      </Link> | <Link href={asPath} locale="es">
        <a className={cn({
          active: locale === "es"
        })}>Español</a>
      </Link>
    </footer>
  )
}