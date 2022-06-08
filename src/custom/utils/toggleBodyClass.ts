export const toggleBodyClass = (className: string) => {
  if (!document.body.classList.contains(className)) {
    document.body.classList.add(className)
  } else {
    document.body.classList.remove(className)
  }
}

export const addBodyClass = (className: string) => {
  console.log('addBodyClass ', className)
  !document.body.classList.contains(className) && document.body.classList.add(className)
}

export const removeBodyClass = (className: string) => {
  console.log('removeBodyClass ', className)
  document.body.classList.contains(className) && document.body.classList.remove(className)
}
