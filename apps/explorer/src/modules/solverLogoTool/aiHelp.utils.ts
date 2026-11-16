import { LogoAsset, LogoSnapshot } from './solverLogoTool.types'

export function originalFilename(asset: Pick<LogoAsset, 'name' | 'type'>): string {
  return (
    asset.name
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/^\.+/, '')
      .slice(0, 100) || 'source.' + asset.type
  )
}

export const AI_GUIDELINES = `# Solver logo guidelines

Prepare one logo-only asset for CoW Swap. Keep the brand's shape, proportions and original colours. Do not redesign the logo or add lettering, decorative effects or UI rings.

## Position and spacing
- Prepare a 1024 × 1024 square PNG. The UI applies a circular crop; the exported file stays square.
- Keep the whole visible mark inside the circle with comfortable space around it. The editor's safe-area circle is 76% of the square's width: a starting point, not a rigid rule.
- Centre the visible mark optically. Preserve its aspect ratio; adjust scale and padding rather than stretching it.
- Inspect the actual small sizes: Row and Winner logos are 24px, Stack logos are 18px.

## Colour and contrast
- Check all six contexts: Row, Winner and Stack in light and dark themes.
- Light base: #ffffff. Dark base: #18193b. Row overlays: #00234e at 2% in light, #dee3e6 at 2% in dark. Winner overlays: #007b28 at 15% in light, #00d897 at 15% in dark. Stack uses the base.
- Each circular logo has a white backing, with the prepared square asset drawn over it. Transparent pixels show white inside the crop, including in dark mode.
- The UI adds an edge ring (#00234e at 24% in light, #dee3e6 at 24% in dark). Do not bake this ring into the logo.
- Preserve any intentional source background. Suggest a different background only when it helps contrast, and explain the choice. Do not silently recolour the mark.

## Source and deliverables
- Prefer a self-contained vector SVG. Keep vector artwork vector; avoid scripts, external images, fonts or links.
- For a PNG source, retain bitmap output. Never wrap a PNG in SVG and call it a vector, or claim upscaling creates detail. Flag an insufficient source and ask for a better original.
- Deliver logo.png (1024 × 1024), logo.svg only for vector input, a light/dark six-context preview, the original source, settings or adjustment notes, and a README in one ZIP for review by a CoW Protocol contact.
- Do not add crop guides, labels, borders or padding annotations to the final logo asset.

## Reading the visual examples
examples/context-reference.png is the supplied design reference for the six contexts. examples/positioning-guide.png compares a crowded crop with comfortable spacing using a supplied Fibrous logo. These are references, not artwork to copy into the user's logo.
current-logo.png and current-preview.png show the uploaded logo with the user's current adjustments; they are not necessarily the recommended result.

These previews represent proposed logo treatments, not a verification of production behaviour. All generated artwork needs human review; the pack does not publish anything or update a CMS.
`

export function aiPrompt({ name, asset, state }: Pick<LogoSnapshot, 'name' | 'asset' | 'state'>): string {
  return `Help me prepare the existing ${JSON.stringify(name)} solver logo for CoW Swap, using the attached AI pack.

Start with original/${originalFilename(asset)} (${asset.type.toUpperCase()}, ${asset.width} × ${asset.height}). Read guidelines.md and inspect examples/context-reference.png and examples/positioning-guide.png. Treat those examples as layout references, not replacement artwork. current-logo.png and current-preview.png show my starting point.

My current settings: size ${state.scale}%, X ${state.x}%, Y ${state.y}%, background ${state.background}. Offsets are percentages of the 1024px square; size is the longest source dimension as a percentage of that square. Preserve the logo's aspect ratio and brand colours. Adjust padding, scale and optical centring, without redesigning the mark. Explain any suggested background change.

Use code or file tools to prepare a 1024 × 1024 square PNG that survives a circular crop and stays recognisable at 24px (Row/Winner) and 18px (Stack). Check all six light/dark contexts using the colours, white backing and UI-only ring described in guidelines.md. Keep the UI ring out of the exported logo. Keep a vector SVG vector; for PNG input do not invent a vector SVG or claim upscaling adds detail.

Show the recommended result and a six-context preview. Create a downloadable ZIP with logo.png, logo.svg only if the source is vector, the preview, original source, adjustment settings/notes and a short README. This is a submission for review by my CoW Protocol contact, not an approved CMS update. If the source is too small, ask for a better original. If you cannot inspect attachments or create downloadable files in this chat, say so and give precise manual steps instead of claiming files exist.`
}
