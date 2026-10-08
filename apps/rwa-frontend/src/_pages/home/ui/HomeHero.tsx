import type { ReactNode } from 'react'

import Image from 'next/image'

import styles from './HomeHero.module.css'

const ISSUER_LOGO_SIZE = 20

interface IssuerProps {
  name: string
  logo: string
  /** Black logo, inverted on dark backgrounds */
  monochrome?: boolean
}

export function HomeHero(): ReactNode {
  return (
    <header className={styles.hero}>
      <h1 className={styles.heading}>Explore tokenized real-world assets</h1>
      <p className={styles.subtitle}>
        Trade tokenized stocks and ETFs from <Issuer name="Ondo" logo="/issuers/ondo.svg" monochrome />,{' '}
        <Issuer name="xStocks" logo="/issuers/xstocks.svg" /> and other issuers across chains, powered by CoW Protocol.
      </p>
    </header>
  )
}

function Issuer({ name, logo, monochrome = false }: IssuerProps): ReactNode {
  return (
    <span className={styles.issuer}>
      <Image
        className={monochrome ? styles.monochromeLogo : undefined}
        src={logo}
        alt=""
        width={ISSUER_LOGO_SIZE}
        height={ISSUER_LOGO_SIZE}
        unoptimized
      />
      {name}
    </span>
  )
}
