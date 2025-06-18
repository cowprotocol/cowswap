// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function autofocus(e: React.FocusEvent<HTMLInputElement, Element>) {
  e.target.select()
}
