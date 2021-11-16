import Head from 'next/head'
import Link from 'next/link'

import styles from './Layout.style'

import { PropsWithChildren } from 'react'

import { Trans } from '@lingui/macro'
import Header from './Header'
import Footer from './Footer'

export const SITE_TITLE = 'CoW Protocol'
export const URL_PRODUCTION = "https://cowswap.exchange"

export type LayoutProps = PropsWithChildren<{
  home?: boolean
}>

export default function Layout(props: LayoutProps) {
  const { children, home = false } = props

  return (
    <>
      <Head>
        <meta
          name="description"
          content="Ethereum's MetaDEX Aggregator that allows to trade with MEV protection while using ETH-less orders that are settled p2p among users or the best AMM."
        />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="white" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#163861" />

        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/images/logo-square-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/images/logo-square-512.png" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={SITE_TITLE} />

        <meta property="og:description" content="Ethereums MetaDEX Aggregator built by Gnosis. It allows users to trade tokens with MEV protection while using ETH-less orders that are settled p2p among users or into the best on-chain liquidity pool." />
        <meta property="og:image" content={URL_PRODUCTION + "/images/og-meta-cowswap.png"} />
        <meta property="og:url" content={URL_PRODUCTION} /> {/* TODO: Add URL */}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@MEVprotection" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:image" content={URL_PRODUCTION + "/images/og-meta-cowswap.png"} />
      </Head>
      <div className="container">
        <Header home={home} />
        <main>{children}</main>
        {!home && (
          <div className="backToHome">
            <Link href="/">
              <a>← {' '}<Trans>Back to home</Trans></a>
            </Link>
          </div>
        )}
      </div>
      <Footer />

      <style jsx>{styles}</style>
    </>
  )
}