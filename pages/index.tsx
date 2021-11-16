import Head from 'next/head'
import Link from 'next/link'
import { GetStaticProps } from 'next'

import { getSortedPostsData } from '../lib/posts'
// import Alert from '../components/Alerts'
import Layout, { siteTitle } from '../components/Layout'
import Date from '../components/Date'

import utilStyles from '../styles/utils.module.scss'


export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Hi there, I'm reviewing how easy it is to develop for NEXT.js</p>
      </section>

      {/* Add this <section> tag below the existing <section> tag */}
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>
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

export const getStaticProps: GetStaticProps = () => {
  // Get external data
  const allPostsData = getSortedPostsData()

  // 
  return {
    props: {
      allPostsData
    }
  }
}