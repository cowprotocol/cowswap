export function createCanvas(width = 1024, height = width): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

export function getCanvasContext(canvas: HTMLCanvasElement, willReadFrequently = false): CanvasRenderingContext2D {
  const context = canvas.getContext('2d', { willReadFrequently })
  if (!context) throw new Error('Your browser could not create a logo preview. Try another browser.')
  return context
}
