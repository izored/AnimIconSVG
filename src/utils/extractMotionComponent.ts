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
  [key: string]: any
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

  // Framer bundles framer-motion, not motion/react — rewrite import
  code = code.replace(/from\s+["']motion\/react["']/g, 'from "framer-motion"')

  // Insert framer import + inline types after the last import line
  const lines = code.split('\n')
  let lastImportLine = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith('import ')) lastImportLine = i
  }
  lines.splice(lastImportLine + 1, 0, `import { addPropertyControls, ControlType } from "framer"\n` + INLINE_TYPES)

  code = lines.join('\n')

  // Match: const Foo = forwardRef / export default Foo / export function Foo / export const Foo
  const componentName =
    (code.match(/const\s+(\w+)\s*=\s*forwardRef/)?.[1]) ||
    (code.match(/export\s+default\s+(\w+)/)?.[1]) ||
    (code.match(/export\s+(?:function|const)\s+(\w+)/)?.[1]) ||
    null

  if (componentName) {
    // Remove existing bare `export default ComponentName` line — wrapper takes over
    code = code.replace(/^export\s+default\s+\w+\s*;?\s*$/m, '')

    // Append Framer wrapper + controls at bottom
    // Wrapper accepts Framer's injected style prop for proper canvas sizing
    code += `
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 32
 * @framerIntrinsicHeight 32
 */
function ${componentName}Framer({
  color = "currentColor",
  strokeWidth = 1.5,
  style,
}: {
  color?: string
  strokeWidth?: number
  style?: React.CSSProperties
}) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "12%", boxSizing: "border-box", ...style, overflow: "visible" }}>
      <${componentName}
        size={256}
        color={color}
        strokeWidth={strokeWidth}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}

export default ${componentName}Framer

addPropertyControls(${componentName}Framer, {
  color: {
    type: ControlType.Color,
    title: "Color",
    defaultValue: "currentColor",
  },
  strokeWidth: {
    type: ControlType.Number,
    title: "Stroke",
    defaultValue: 1.5,
    min: 0.5,
    max: 4,
    step: 0.25,
    displayStepper: true,
  },
})
`
  }

  return code
}
