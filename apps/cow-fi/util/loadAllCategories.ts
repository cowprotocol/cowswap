import { Category, getCategories } from '../services/cms'

export interface CategoryLink {
  name: string
  slug: string
}

export async function loadAllCategories(): Promise<CategoryLink[]> {
  try {
    const categories = await getCategories()

    return (
      categories?.map((category: Category) => ({
        name: category?.attributes?.name || '',
        slug: category?.attributes?.slug || '',
      })) || []
    )
  } catch (error) {
    console.error('Error loading categories for resources page:', error)
    return []
  }
}
