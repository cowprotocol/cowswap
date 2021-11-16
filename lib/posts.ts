import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

import { remark } from 'remark'
import html from 'remark-html'
import { NotFoundItem, Post, PostDetails } from '../types'

const postsDirectory = path.join(process.cwd(), 'posts')

const regex = /(.+)(?=__(\w{2}(?:_\w{2})?)$)/;


export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData: Post[] = fileNames.map(fileName => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
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

export function getAllPostIds() {
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
  return fileNames.map(fileName => {
    const name = fileName.replace(/\.md$/, '')
    const match = regex.exec(name)
    const params = match && match.length >=3  ? { id: match[1], locale: match[2] } : { id: name, locale: 'es'}

    return {
      params
    }
  })
}

export async function getPostData(id: string, locale: string): Promise<PostDetails | NotFoundItem> {
  const fullPath = path.join(postsDirectory, locale === 'en' ? `${id}.md` : `${id}__${locale}.md`)
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
  const contentHtml = locale + '----' +processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data
  }
}