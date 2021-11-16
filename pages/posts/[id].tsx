import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'

import Layout from '../../components/Layout'
import Date from '../../components/Date'
import utilStyles from '../../styles/utils.module.scss'
import { getAllPostIds, getPostData } from '../../lib/posts'
import { Post } from '../../types'


export default function Post({ postData }) {
  const { id, title, date, contentHtml } = postData
  return (
    <Layout>
      <Head>
        <title>CoW - {title}</title>
      </Head>
      <h1 className={utilStyles.headingXl}>{postData.title}</h1>
      <div className={utilStyles.lightText}>
        <Date dateString={date} />
      </div>
      {/* <pre>{ JSON.stringify(postData, null, 2) }</pre> */}
      <div data-post-id={id} dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async (props) => {
  const { params } = props

  const postData = await getPostData(params.id as string)
  return {
    props: {
      postData
    }
  }
}