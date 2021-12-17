import { AppProps } from 'next/app'
import GlobalStyles from 'const/styles/global'
import Head from 'next/head'
import { meta } from 'const/meta'

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
        {meta}
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"></meta>
      </Head>
      {/* <I18nProvider i18n={i18n}> */}
      <GlobalStyles />
      <Component {...pageProps} />
      {/* </I18nProvider> */}
    </>

  )
}