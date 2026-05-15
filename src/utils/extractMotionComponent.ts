const INLINE_TYPES = `
type IconEasing =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "circIn"
  | "circOut"
  | "circInOut"
  | "backIn"
  | "backOut"
  | "backInOut"
  | "anticipate"

interface AnimatedIconProps {
  size?: number | string
  color?: string
  strokeWidth?: number
  className?: string
}

interface AnimatedIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

`

export function extractMotionComponent(tsxSource: string): string {
  let code = tsxSource

  // Remove the relative ./types import — breaks Framer's module resolver
  code = code.replace(/import\s+type\s+\{[^}]+\}\s+from\s+["']\.\/types["'];?\r?\n?/g, '')

  // Insert inline types after the last import line
  const lines = code.split('\n')
  let lastImportLine = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith('import ')) lastImportLine = i
  }
  lines.splice(lastImportLine + 1, 0, INLINE_TYPES)

  return lines.join('\n')
}
