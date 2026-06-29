import { useMemo } from 'react'
import * as THREE from 'three'
import { Line, Text, Billboard } from '@react-three/drei'
import { PLANT, ROOMS, OPENINGS, EAVE, RIDGE } from '../constants/dims'

const COLOR = '#23d6c4' // teal de cotas
const Y = 0.06 // sobre el piso

type P3 = [number, number, number]

interface DimDef {
  a: P3
  b: P3
  label: string
  tick?: P3 // dirección de las marcas extremas (si no, se calcula)
}

function Dim({ a, b, label, tick }: DimDef) {
  const A = new THREE.Vector3(...a)
  const B = new THREE.Vector3(...b)
  const mid = A.clone().add(B).multiplyScalar(0.5)
  let t: THREE.Vector3
  if (tick) t = new THREE.Vector3(...tick)
  else {
    const d = B.clone().sub(A)
    t =
      Math.abs(d.y) < 1e-4
        ? new THREE.Vector3(-d.z, 0, d.x).normalize().multiplyScalar(0.25)
        : new THREE.Vector3(0.25, 0, 0)
  }
  const seg = (p: THREE.Vector3): [P3, P3] => [
    [p.x + t.x, p.y + t.y, p.z + t.z],
    [p.x - t.x, p.y - t.y, p.z - t.z],
  ]
  return (
    <group>
      <Line points={[a, b]} color={COLOR} lineWidth={1.6} />
      <Line points={seg(A)} color={COLOR} lineWidth={1.6} />
      <Line points={seg(B)} color={COLOR} lineWidth={1.6} />
      <Billboard position={[mid.x, mid.y + 0.45, mid.z]}>
        <Text
          fontSize={0.32}
          color="#ffffff"
          outlineWidth={0.022}
          outlineColor="#0c5a53"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  )
}

const f = (n: number) => n.toFixed(2)

export function Dimensions() {
  const dims = useMemo<DimDef[]>(() => {
    const list: DimDef[] = []

    const { minX, maxX, minZ, maxZ, width, depth } = PLANT
    const offN = minZ - 1.4 // línea de cota fuera del frontón norte
    const offE = maxX + 1.4 // línea de cota fuera del muro este

    // ---- huella de la nave (afuera) ----
    list.push({ a: [minX, Y, offN], b: [maxX, Y, offN], label: f(width) }) // 25.65
    list.push({ a: [offE, Y, minZ], b: [offE, Y, maxZ], label: f(depth) }) // 30.30

    // ---- cuartos (oficina / baño): ancho + fondo ----
    for (const r of ROOMS.filter((r) => r.id !== 'bodega')) {
      const xa = Math.min(r.x1, r.x2)
      const xb = Math.max(r.x1, r.x2)
      const za = Math.min(r.z1, r.z2)
      const zb = Math.max(r.z1, r.z2)
      list.push({ a: [xa, Y, za + 0.3], b: [xb, Y, za + 0.3], label: f(xb - xa) })
      list.push({ a: [xa + 0.3, Y, za], b: [xa + 0.3, Y, zb], label: f(zb - za) })
    }

    // ---- portones (fachada sur, afuera) ----
    for (const o of [OPENINGS.portonL, OPENINGS.portonR]) {
      list.push({ a: [o.x1, 0.1, maxZ + 0.9], b: [o.x2, 0.1, maxZ + 0.9], label: f(o.x2 - o.x1) })
    }

    // ---- alturas de la bóveda (frontón norte, afuera) ----
    list.push({ a: [maxX - 1, 0, offN], b: [maxX - 1, EAVE, offN], label: `${f(EAVE)} (alero)` })
    list.push({ a: [0, 0, offN], b: [0, RIDGE, offN], label: `${f(RIDGE)} (cumbrera)` })

    return list
  }, [])

  return (
    <group>
      {dims.map((d, i) => (
        <Dim key={i} {...d} />
      ))}
    </group>
  )
}
