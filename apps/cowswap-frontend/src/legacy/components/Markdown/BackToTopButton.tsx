export function BackToTopButton() {
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} id="back-to-top">
      Back to top ↑
    </button>
  )
}
