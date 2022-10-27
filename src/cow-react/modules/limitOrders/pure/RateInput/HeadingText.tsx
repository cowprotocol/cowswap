type Props = {
  currency: string | undefined
}

export function HeadingText({ currency }: Props) {
  if (!currency) {
    return <span>Select input and output</span>
  }

  return (
    <span>
      Price per <strong>{currency}</strong>
    </span>
  )
}
