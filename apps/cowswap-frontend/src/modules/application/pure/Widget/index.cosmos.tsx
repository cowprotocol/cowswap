import { Widget, AppBodyProps } from '.'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Custom({ children, className }: AppBodyProps) {
  return (
    <Widget className={className}>
      <div style={{ border: '1px dashed gray' }}>{children}</div>
    </Widget>
  )
}

const fixtures = {
  smallContent: <Custom>This is a small content</Custom>,
  tallContent: (
    <Custom>
      <div style={{ height: '500px' }}>This is tall content</div>
    </Custom>
  ),
}

export default fixtures
