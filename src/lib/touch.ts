// Estado táctil compartido (joystick móvil). Mutable a propósito: lo escribe
// el overlay DOM (nipplejs) y lo lee FPControls cada frame.
export const touch = {
  moveX: 0, // -1..1 (derecha +)
  moveZ: 0, // -1..1 (adelante +)
  active: false,
}

export function isTouchDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  )
}
