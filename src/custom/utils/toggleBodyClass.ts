export const toggleBodyClass = (className: string, isAdd: boolean) => {
  if (isAdd) {
    document.body.classList.add(className)
  } else {
    document.body.classList.remove(className)
  }
}
