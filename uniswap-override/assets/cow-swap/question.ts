export function questionIcon(darkMode: boolean): string {
  return `<svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0H6a6 6 0 0 0-6 6v2a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6V6a6 6 0 0 0-6-6Z" fill="${
      darkMode ? '#C9DAED' : '#FFFFFF'
    }"/>
    <path fill="${
      darkMode ? '#1E385E' : '#000000'
    }" fill-rule="evenodd" clip-rule="evenodd" d="M10.258 5.734c-.2 1.8-1.5 2.4-2.8 3-1.3.4-1.9-1.5-.6-1.8.4-.2 1.5-.8 1.4-1.2 0-.9-1-1.4-1.7-1-.29.145-.423.396-.55.638-.048.09-.095.18-.15.262-.4.6-1.4.4-1.6-.2-.4-1 .5-1.9 1.3-2.4 1.9-1.3 4.7.3 4.7 2.7Zm-3.1 3.9c-1.3 0-1.3 2 0 2 1.3-.1 1.3-2 0-2Z" />
  </svg>`
}
