import { Category, getCategories } from '../services/cms'

export interface CategoryLink {
  name: string
  slug: string
}

/**
 * Loads CMS categories for the Resources pages.
 * Entries missing a name or slug are dropped so no empty links or React keys are rendered.
 * Returns an empty list if the CMS request fails.
 */
export async function loadAllCategories(): Promise<CategoryLink[]> {
  try {
    const categories = await getCategories()

    return (categories ?? []).reduce<CategoryLink[]>((acc, category: Category) => {
      const name = category?.attributes?.name
      const slug = category?.attributes?.slug

      if (name && slug) acc.push({ name, slug })

      return acc
    }, [])
  } catch (error) {
    console.error('Error loading categories for resources page:', error)
    return []
  }
}
