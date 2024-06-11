// Utility function to strip HTML tags
export function stripHtmlTags(html: string): string {
  if (typeof window === 'undefined') {
    return html
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim()
}
