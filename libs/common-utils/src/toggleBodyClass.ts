// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const toggleBodyClass = (className: string) => {
  if (!document.body.classList.contains(className)) {
    document.body.classList.add(className)
  } else {
    document.body.classList.remove(className)
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const addBodyClass = (className: string) => {
  !document.body.classList.contains(className) && document.body.classList.add(className)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const removeBodyClass = (className: string) => {
  document.body.classList.contains(className) && document.body.classList.remove(className)
}
