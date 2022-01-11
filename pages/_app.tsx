import { AppProps } from 'next/app'
import GlobalStyles from 'const/styles/global'
import Head from 'next/head'

import { siteConfig } from '@/const/meta'
import { Analytics } from '@/components/Analytics'

// import { i18n } from '@lingui/core'
// import { I18nProvider } from "@lingui/react";
// import { initTranslation } from '../lib/i18n'
// import { useRouter } from 'next/router'
// import { useEffect, useRef } from 'react'

// initTranslation(i18n)

export default function App(props: AppProps) {
  const { Component, pageProps } = props

  // const router = useRouter()
  // const locale = router.locale || router.defaultLocale
  // const firstRender = useRef(true)

  // const translation = pageProps['translation']
  // if (translation && firstRender.current) {
  //   //load the translations for the locale
  //   i18n.load(locale, translation)
  //   i18n.activate(locale)
  //   // render only once
  //   firstRender.current = false
  // }

  // listen for the locale changes
  // useEffect(() => {
  //   if (translation) {
  //     i18n.load(locale, translation)
  //     i18n.activate(locale)
  //   }
  // }, [locale, translation])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />

        <meta name="description" content={siteConfig.description} />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="white" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#163861" />

        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/images/logo-square-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/images/logo-square-512.png" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteConfig.title} />

        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:image" content={siteConfig.url.root + "/images/og-meta-cowswap.png"} />
        <meta property="og:url" content={siteConfig.url.root} /> {/* TODO: Add URL */}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={siteConfig.social.twitter.account} />
        <meta name="twitter:title" content={siteConfig.title} />
        <meta name="twitter:image" content={siteConfig.url.root + "/images/og-meta-cowswap.png"} />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"></meta>
      </Head>
      {/* <I18nProvider i18n={i18n}> */}
      <GlobalStyles />
      <Analytics />
      <Component {...pageProps} />
      {/* </I18nProvider> */}
    </>

  )
}