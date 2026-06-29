import { PARTITIONS, ROOMS } from '../constants/dims'
import { mat } from '../lib/materials'
import { WallMesh } from './Walls'

function Ceiling({
  x1,
  x2,
  z1,
  z2,
  height,
}: {
  x1: number
  x2: number
  z1: number
  z2: number
  height: number
}) {
  const w = Math.abs(x2 - x1)
  const d = Math.abs(z2 - z1)
  return (
    <mesh
      position={[(x1 + x2) / 2, height, (z1 + z2) / 2]}
      rotation={[Math.PI / 2, 0, 0]}
      receiveShadow
      material={mat.ceiling()}
    >
      <planeGeometry args={[w, d]} />
    </mesh>
  )
}

export function Rooms() {
  return (
    <group>
      {PARTITIONS.map((w) => (
        <WallMesh key={w.id} wall={w} />
      ))}
      {ROOMS.filter((r) => r.ceiling).map((r) => (
        <Ceiling key={r.id} x1={r.x1} x2={r.x2} z1={r.z1} z2={r.z2} height={r.height} />
      ))}
    </group>
  )
}
