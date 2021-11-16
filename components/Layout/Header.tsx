import Image from 'next/image'
import Link from 'next/link'

import utilStyles from '../../styles/utils.module.scss'

import { LayoutProps, SITE_TITLE } from '.'

export default function Header(props: LayoutProps) {
  const { home = false } = props

  return (
    <header className="header">
      {home ? (
        <>
          <Image
            priority
            src="/favicon.png"
            className={utilStyles.borderCircle}
            height={144}
            width={144}
            alt={SITE_TITLE}
          />
          <h1 className={utilStyles.heading2Xl}>{SITE_TITLE}</h1>
        </>
      ) : (
        <>
          <Link href="/">
            <a>
              <Image
                priority
                src="/favicon.png"
                className={utilStyles.borderCircle}
                height={108}
                width={108}
                alt={SITE_TITLE}
              />
            </a>
          </Link>
          <h2 className={utilStyles.headingLg}>
            <Link href="/">
              <a className={utilStyles.colorInherit}>{SITE_TITLE}</a>
            </Link>
          </h2>
        </>
      )}
      <style jsx>{`
        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </header>
  )
}