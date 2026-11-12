import { validateLocalSvgUrls } from './svgUrls.utils'

export interface SafeSvg {
  text: string
  width: number
  height: number
}

export function readSvg(text: string): SafeSvg {
  if (/<!DOCTYPE|<!ENTITY/i.test(text))
    throw new Error('Use a self-contained SVG without a document type or external entities.')
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
  if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg')
    throw new Error('This SVG could not be read. Try exporting it again from your design tool.')
  const root = doc.documentElement
  const elements = [root, ...Array.from(root.querySelectorAll('*'))]
  if (elements.length > 15000) throw new Error('This SVG is very complex. Simplify it or upload a PNG.')
  elements.forEach(validateElement)
  const box = getViewBox(root)
  if (Math.max(box[2], box[3]) > 32768)
    throw new Error('The SVG artboard is too large. Use an artboard below 32768 pixels.')
  root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  root.setAttribute('width', String(box[2]))
  root.setAttribute('height', String(box[3]))
  return { text: new XMLSerializer().serializeToString(root), width: box[2], height: box[3] }
}

function getViewBox(root: Element): number[] {
  const box = (root.getAttribute('viewBox') || '')
    .trim()
    .split(/[\s,]+/)
    .map(Number)
  if (box.length === 4 && box.every(Number.isFinite) && box[2] > 0 && box[3] > 0) return box
  const width = readDimension(root.getAttribute('width')),
    height = readDimension(root.getAttribute('height'))
  if (!(width > 0 && height > 0))
    throw new Error('Your SVG needs a viewBox or explicit width and height. Export it again with those included.')
  const fallback = [0, 0, width, height]
  root.setAttribute('viewBox', fallback.join(' '))
  return fallback
}

function readDimension(value: string | null): number {
  const text = value || ''
  return /^\d+(\.\d+)?(px)?$/.test(text) ? parseFloat(text) : NaN
}

function validateAttribute(attribute: Attr): void {
  const name = attribute.localName.toLowerCase(),
    value = attribute.value.trim()
  if (name.startsWith('on')) throw new Error('Use a static SVG without event handlers.')
  if (['href', 'src'].includes(name) && value && !value.startsWith('#'))
    throw new Error(
      'This SVG links to an image or external resource. Upload a self-contained vector SVG or a PNG instead.',
    )
  validateLocalSvgUrls(value)
}

function validateElement(node: Element): void {
  if (
    [
      'script',
      'foreignobject',
      'iframe',
      'object',
      'embed',
      'animate',
      'animatetransform',
      'animatemotion',
      'set',
    ].includes(node.localName.toLowerCase())
  )
    throw new Error('Use a static SVG without scripts, animation or embedded web content.')
  Array.from(node.attributes).forEach(validateAttribute)
  if (node.localName === 'style') {
    const text = node.textContent || ''
    if (/@import|@font-face/i.test(text))
      throw new Error('Use an SVG with outlined lettering and no external styles or fonts.')
    validateLocalSvgUrls(text)
  }
}
