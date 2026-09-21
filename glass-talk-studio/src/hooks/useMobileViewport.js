import { useEffect, useState } from 'react'

export default function useMobileViewport(shellRef) {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 680px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 680px)')
    const update = () => setMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!mobile) return
    const viewport = window.visualViewport
    const shell = shellRef.current
    const update = () => {
      shell.style.setProperty('--mobile-height', `${viewport?.height ?? window.innerHeight}px`)
      shell.style.setProperty('--mobile-top', `${viewport?.offsetTop ?? 0}px`)
      shell.classList.toggle('keyboard-visible', (viewport?.height ?? window.innerHeight) < window.innerHeight * 0.75)
    }
    update()
    window.addEventListener('resize', update)
    viewport?.addEventListener('resize', update)
    viewport?.addEventListener('scroll', update)
    return () => {
      window.removeEventListener('resize', update)
      viewport?.removeEventListener('resize', update)
      viewport?.removeEventListener('scroll', update)
      shell.style.removeProperty('--mobile-height')
      shell.style.removeProperty('--mobile-top')
      shell.classList.remove('keyboard-visible')
    }
  }, [mobile, shellRef])

  return mobile
}
