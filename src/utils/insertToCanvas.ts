import { framer } from 'framer-plugin'
import { extractMotionComponent } from './extractMotionComponent'

export async function insertToCanvas(svg: string, name: string): Promise<boolean> {
  try {
    await framer.addSVG({ svg, name })
    return true
  } catch (e) {
    console.error('framer.addSVG failed:', e)
  }

  try {
    await navigator.clipboard.writeText(svg)
  } catch (e) {
    console.error('Clipboard fallback failed:', e)
  }
  return false
}

export async function insertMotionComponent(tsxSource: string, name: string): Promise<boolean> {
  const componentName = name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
  const fileName = `${componentName}.tsx`
  const code = extractMotionComponent(tsxSource)

  try {
    await framer.unstable_createCodeFile(fileName, code)
  } catch {
    try {
      await (framer as any).unstable_setCodeFileContent(fileName, code)
    } catch (e) {
      console.error('insertMotionComponent failed:', e)
      return false
    }
  }

  return true
}
