import Head from 'next/head'
import Link from 'next/link'
import { GetStaticProps } from 'next'

import { getSortedPostsData } from '../lib/posts'
import Layout from '../components/Layout'
import Date from '../components/Date'

import { Trans } from '@lingui/macro'
import { loadTranslation } from '../lib/i18n'
import { toPostPath } from '../util/posts'
import { useRouter } from 'next/router'
import Alert from '../components/Alerts'
// import { useRouter } from 'next/router'
import { SiteConfig } from '../const/meta'

const { title, descriptionShort} = SiteConfig

export default function Home({ allPostsData }) {
  const { locale } = useRouter()
  return (
    <Layout home>

      <Head>
        <title>{title} - {descriptionShort}</title>
      </Head>

        {/* https://blog.logrocket.com/complete-guide-internationalization-nextjs/ */}
        <h1><Trans>MetaDEX Aggregator Exchange with MEV Protection</Trans></h1>



        <h2><Trans>Blog</Trans></h2>
        {locale !== 'en' && (
          <Alert type="warning"><Trans>Posts are not internationalized yet. This is just a PoC</Trans></Alert>
        )}
        <ul>
          {allPostsData.map(({ id, date, locale, title }) => (
            <li key={id}>
              <Link href={`/posts/${toPostPath(id, locale)}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
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