export const toggleBodyClass = (className: string): void => {
  if (!document.body.classList.contains(className)) {
    document.body.classList.add(className)
  } else {
    document.body.classList.remove(className)
  }
}

export const addBodyClass = (className: string): void => {
  !document.body.classList.contains(className) && document.body.classList.add(className)
}

export const removeBodyClass = (className: string): void => {
  document.body.classList.contains(className) && document.body.classList.remove(className)
}
