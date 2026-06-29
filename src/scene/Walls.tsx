import { useMemo } from 'react'
import type { Wall, Box } from '../constants/dims'
import { wallBoxes, WALL } from '../constants/dims'
import { mat } from '../lib/materials'

/**
 * Dibuja un muro alineado a eje: cuerpo de block (hueso) + zócalo gris oxford
 * de 1.2 m envolviendo ambas caras. Comparte el generador de cajas con el
 * sistema de colisión, así que render y colisión nunca divergen.
 */
export function WallMesh({ wall }: { wall: Wall }) {
  const { render } = useMemo(() => wallBoxes(wall), [wall])
  const wallMat = mat.wall()
  const baseMat = mat.base()
  const base = WALL.baseHeight

  return (
    <group>
      {render.map((b, i) => (
        <mesh key={i} position={[b.cx, b.cy, b.cz]} castShadow receiveShadow material={wallMat}>
          <boxGeometry args={[b.sx, b.sy, b.sz]} />
        </mesh>
      ))}
      {/* zócalo: solo en los tramos que llegan al piso (no dinteles) */}
      {render
        .filter((b: Box) => b.cy - b.sy / 2 < 0.05)
        .map((b, i) => (
          <mesh
            key={`base-${i}`}
            position={[b.cx, base / 2, b.cz]}
            receiveShadow
            material={baseMat}
          >
            <boxGeometry args={[b.sx + 0.02, base, b.sz + 0.03]} />
          </mesh>
        ))}
    </group>
  )
}
