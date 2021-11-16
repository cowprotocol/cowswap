import Head from 'next/head'
import Link from 'next/link'
import { GetStaticProps } from 'next'

import { getSortedPostsData } from '../lib/posts'
import Layout, { SITE_TITLE } from '../components/Layout'
import Date from '../components/Date'

import utilStyles from '../styles/utils.module.scss'

import { Trans } from '@lingui/macro'
import { loadTranslation } from '../lib/i18n'
import { toPostPath } from '../util/posts'
import { useRouter } from 'next/router'
import Alert from '../components/Alerts'
// import { useRouter } from 'next/router'

export default function Home({ allPostsData }) {
  const { locale } = useRouter()
  return (
    <Layout home>
      <Head>
        <title>{SITE_TITLE}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        {/* https://blog.logrocket.com/complete-guide-internationalization-nextjs/ */}
        <p><Trans>MetaDEX Aggregator Exchange with MEV Protection</Trans></p>

      </section>

      {/* Add this <section> tag below the existing <section> tag */}
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}><Trans>Blog</Trans></h2>
        {locale !== 'en' && (
          <Alert type="warning"><Trans>Posts are not internationalized yet. This is just a PoC</Trans></Alert>
        )}
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, locale, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${toPostPath(id, locale)}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const translation = await loadTranslation(
    ctx.locale!,
    process.env.NODE_ENV === 'production'
  )

  // Get external data
  const allPostsData = getSortedPostsData(ctx.locale)

  // 
  return {
    props: {
      allPostsData,
      translation
    }
  }
}