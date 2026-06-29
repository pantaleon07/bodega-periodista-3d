import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import { COLORS } from '../constants/dims'

// =============================================================================
//  Anaqueles de tarima (placeholder). Parametrizable por coordenadas.
//  Cada fila: posición de inicio (x,z), nº de claros (bays), orientación.
//  El almacén cerrado (candidato a farmacia) y la bodega mayor son los destinos.
// =============================================================================

export interface RackRow {
  id: string
  x: number
  z: number
  bays: number
  levels: number
  orient: 'X' | 'Z' // dirección en que se alinean los claros
}

// 6 hileras de anaqueles de tarima distribuidas en toda la profundidad de la
// bodega mayor. Todas alineadas a la derecha (extremo este a 30 cm del muro,
// último poste en X≈9.575). Las DOS filas del lado del acceso (sur) son más
// cortas y recorridas al este para dejar libre el área del tortón. La última
// hilera (al fondo, norte) va PEGADA al muro norte.
// 'x' = extremo oeste (arranque); los claros crecen hacia el este (+X).
const X_LONG = 1.775 // 6 claros → último poste en 9.575 (30 cm del muro este)
const X_SHORT = 4.375 // 4 claros, alineado a la derecha (9.575)
export const RACKS: RackRow[] = [
  // 4 hileras largas (norte). La 1ª pegada al muro norte (borde Z≈-9.85).
  { id: 'r1', x: X_LONG, z: -9.3, bays: 6, levels: 3, orient: 'X' },
  { id: 'r2', x: X_LONG, z: -7.6, bays: 6, levels: 3, orient: 'X' },
  { id: 'r3', x: X_LONG, z: -5.9, bays: 6, levels: 3, orient: 'X' },
  { id: 'r4', x: X_LONG, z: -4.2, bays: 6, levels: 3, orient: 'X' },
  // 2 hileras cortas (sur, junto al acceso/tortón)
  { id: 'r5', x: X_SHORT, z: -2.5, bays: 4, levels: 3, orient: 'X' },
  { id: 'r6', x: X_SHORT, z: -0.8, bays: 4, levels: 3, orient: 'X' },
]

const BAY = 1.3 // ancho de claro
const DEPTH = 1.1 // fondo del rack
const POST_H = 3.0

function Rack({ row }: { row: RackRow }) {
  const data = useMemo(() => {
    const posts: [number, number, number][] = []
    const beams: { pos: [number, number, number]; len: number; axis: 'X' | 'Z' }[] = []
    const pallets: [number, number, number][] = []
    const levelH = POST_H / row.levels

    for (let b = 0; b <= row.bays; b++) {
      const along = b * BAY
      for (const side of [-DEPTH / 2, DEPTH / 2]) {
        const px = row.orient === 'Z' ? row.x + side : row.x + along
        const pz = row.orient === 'Z' ? row.z + along : row.z + side
        posts.push([px, POST_H / 2, pz])
      }
    }
    for (let b = 0; b < row.bays; b++) {
      const along = b * BAY + BAY / 2
      for (let l = 1; l <= row.levels; l++) {
        const y = l * levelH - levelH + 0.15
        const cx = row.orient === 'Z' ? row.x : row.x + along
        const cz = row.orient === 'Z' ? row.z + along : row.z
        beams.push({ pos: [cx, y, cz], len: BAY, axis: row.orient })
        if (l < row.levels) pallets.push([cx, y + 0.35, cz])
      }
    }
    return { posts, beams, pallets }
  }, [row])

  return (
    <group>
      {/* postes (instancing) */}
      <Instances limit={200} range={data.posts.length}>
        <boxGeometry args={[0.09, POST_H, 0.09]} />
        <meshStandardMaterial color={COLORS.rackOrange} metalness={0.3} roughness={0.6} />
        {data.posts.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>

      {/* travesaños */}
      {data.beams.map((bm, i) => (
        <mesh key={i} position={bm.pos}>
          <boxGeometry
            args={bm.axis === 'Z' ? [0.06, 0.08, bm.len] : [bm.len, 0.08, 0.06]}
          />
          <meshStandardMaterial color={COLORS.rackOrange} metalness={0.3} roughness={0.6} />
        </mesh>
      ))}

      {/* tarimas con bulto (instancing) */}
      <Instances limit={300} range={data.pallets.length}>
        <boxGeometry args={[1.0, 0.6, 0.9]} />
        <meshStandardMaterial color="#b9925e" roughness={0.85} />
        {data.pallets.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>
    </group>
  )
}

export function Racks() {
  return (
    <group>
      {RACKS.map((r) => (
        <Rack key={r.id} row={r} />
      ))}
    </group>
  )
}
