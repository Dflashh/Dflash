import { useEffect, useRef, useState } from 'react'

// Scale the display wrapper, keeping the document itself at its export size.
export default function PreviewViewport({ children, mobile, compact, pageWidth }) {
  const viewportRef = useRef(null)
  const paperRef = useRef(null)
  const [layout, setLayout] = useState({ scale: 1, height: 980 })

  useEffect(() => {
    if (!mobile) return
    const viewport = viewportRef.current
    const paper = paperRef.current
    const measure = () => {
      const availableWidth = Math.max(1, viewport.clientWidth - 24)
      const availableHeight = Math.max(1, viewport.clientHeight - 20)
      const scale = Math.min(1, availableWidth / pageWidth,
        compact ? availableHeight / 980 : 1)
      setLayout({ scale, height: paper.offsetHeight })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(paper)
    measure()
    return () => observer.disconnect()
  }, [mobile, compact, pageWidth])

  return (
    <div className="preview-scroll" ref={viewportRef} tabIndex={mobile ? 0 : undefined} aria-label="문서 미리보기">
      <div className="preview-size" style={mobile ? {
        width: pageWidth * layout.scale,
        height: layout.height * layout.scale,
      } : undefined}>
        <div className="preview-paper" ref={paperRef} style={mobile ? {
          width: pageWidth,
          transform: `scale(${layout.scale})`,
          transformOrigin: 'top left',
        } : undefined}>
          {children}
        </div>
      </div>
    </div>
  )
}
