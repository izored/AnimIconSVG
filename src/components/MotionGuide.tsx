interface MotionGuideProps {
  componentName: string
  onDismiss: () => void
}

export function MotionGuide({ componentName, onDismiss }: MotionGuideProps) {
  const displayName = componentName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

  return (
    <div className="motion-guide" onClick={onDismiss}>
      <div className="motion-guide-card" onClick={(e) => e.stopPropagation()}>
        <p className="motion-guide-name">{displayName}.tsx</p>
        <ol className="motion-guide-steps">
          <li>Open the <strong>Components panel</strong> (left sidebar in Framer)</li>
          <li>Drag <strong>{displayName}</strong> onto your page</li>
        </ol>
        <button className="motion-guide-dismiss" onClick={onDismiss}>Got it</button>
      </div>
    </div>
  )
}
