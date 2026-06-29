import { useEffect, useRef } from 'react'
import nipplejs from 'nipplejs'
import { touch, isTouchDevice } from '../lib/touch'

// nipplejs tipa `.on` con overloads por evento que chocan con el modo estricto;
// este shape mínimo evita el conflicto sin perder seguridad en el handler.
type NippleData = { vector?: { x: number; y: number } }
type NippleOn = {
  on: (event: string, cb: (evt: unknown, data: NippleData) => void) => void
  destroy: () => void
}

/** Joystick (nipplejs) para mover en móvil. La mirada es por arrastre en el lienzo. */
export function MobileControls() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !isTouchDevice()) return
    const manager = nipplejs.create({
      zone: ref.current,
      mode: 'static',
      position: { left: '70px', bottom: '70px' },
      color: '#D4581A',
      size: 110,
    }) as unknown as NippleOn

    manager.on('move', (_evt, data) => {
      if (!data.vector) return
      touch.active = true
      touch.moveX = data.vector.x // derecha +
      touch.moveZ = data.vector.y // arriba (adelante) +
    })
    manager.on('end', () => {
      touch.active = false
      touch.moveX = 0
      touch.moveZ = 0
    })
    return () => {
      manager.destroy()
      touch.moveX = 0
      touch.moveZ = 0
    }
  }, [])

  if (!isTouchDevice()) return null
  return <div className="joystick-zone" ref={ref} />
}
