export interface Post {
  id: string
  date?: string
}

export interface PostDetails extends Post {
  contentHtml: string
}

export interface NotFoundItem {
  notFound: true
}