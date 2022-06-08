export const toggleBodyClass = (className: string) => {
  if (!document.body.classList.contains(className)) {
    document.body.classList.add(className)
  } else {
    document.body.classList.remove(className)
  }
}

export const addBodyClass = (className: string) => {
  !document.body.classList.contains(className) && document.body.classList.add(className)
}

export const removeBodyClass = (className: string) => {
  document.body.classList.contains(className) && document.body.classList.remove(className)
}
