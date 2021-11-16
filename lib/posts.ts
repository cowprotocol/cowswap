import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

import { remark } from 'remark'
import html from 'remark-html'
import { NotFoundItem, Post, PostDetails } from '../types'
import { toPostPath } from '../util/posts'

const postsDirectory = path.join(process.cwd(), 'posts')

const regex = /(.+)(?=__(\w{2}(?:_\w{2})?)$)/;


export function getSortedPostsData(locale: string) {
  const allPosts = getAllPostIds(locale)

  const allPostsData: Post[] = allPosts.map(post => {
    // Remove ".md" from file name to get id
    const { id, locale, fileName } = post.params

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      locale,
      ...matterResult.data
    }
  })

  // Sort posts by date
  return allPostsData.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1
    } else if (a > b) {
      return -1
    } else {
      return 0
    }
  })
}

export function getAllPostIds(locale?: string) {
  const fileNames = fs.readdirSync(postsDirectory)

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  const allPosts = fileNames.map(fileName => {
    const name = fileName.replace(/\.md$/, '')
    const match = regex.exec(name)
    const params = match && match.length >=3  ? { id: match[1], locale: match[2], fileName } : { id: name, locale: 'en', fileName}

    return {
      params
    }
  })

  return locale ? allPosts.filter(post => post.params.locale === locale) : allPosts
}

export async function getPostData(id: string, locale: string): Promise<PostDetails | NotFoundItem> {
  const fullPath = path.join(postsDirectory, toPostPath(id, locale) + '.md')
  if (!fs.existsSync(fullPath)) {
    return {
      notFound: true,
    }
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data
  }
}

